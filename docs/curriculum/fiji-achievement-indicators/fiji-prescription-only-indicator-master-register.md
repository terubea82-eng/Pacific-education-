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


### Controlled-source verification update — 12 November 2026 (continued)

**ECE national policy cross-check:** The Ministry-hosted 2025 Pre-Primary Education Policy expressly identifies *Na Noda Mataniciva* as the national curriculum guidelines for Fiji for children aged 3–6, and identifies the NCF as the structure extending from early childhood to Year 13. This confirms the guideline's official policy relevance. It does not withdraw the need to check the Government's September 2025 ECE curriculum-update announcement, obtain CAS confirmation of the operative version/amendments, and establish reuse permission before reproducing or promoting any outcome text. Policy URL: https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf. **ECE remains pending; zero ECE indicators imported.**

**Secondary RSEC document lead — not yet a controlled source:** A third-party-hosted copy labelled *Revised Secondary English Curriculum — Teachers Guide* for Years 9–10 surfaced during discovery. Its visible text attributes preparation to Ministry Curriculum Advisory Services in partnership with the Fiji Program Support Facility and carries a Ministry copyright notice. Because the copy is hosted on an unofficial flipbook platform, it is not accepted as the controlled source of record. Request the identical approved file directly from CAS or an authorised school/FEMIS distribution channel, including document control/version, approval/effective date, annexes, amendments and reuse terms. URL of third-party lead (discovery only): https://fliphtml5.com/gjgbb/naau/RSEC_Teachers_Guide_Year_9_%26_10/. No indicator text copied.

**Secondary English circular lead — unverified copy:** A third-party Studocu listing surfaced for a document described as Ministry Circular No. 19-25, dated 27 January 2025, concerning secondary English curriculum coverage and assessment. The listing is not a Ministry-hosted controlled copy and its displayed text cannot establish current status or legal reuse. Obtain the signed circular and annexes directly from CAS/Ministry records. Do not use the listing to create indicators or treat annual examination coverage as a complete curriculum prescription. Discovery URL: https://www.studocu.com/row/document/nakawa-vocational-training-college/english/circular-no-19-25-2025-secondary-english-curriculum/117881613.

**Assessment authority cross-check:** The Ministry's National Curriculum Assessment and Reporting policy describes assessment processes, including internal assessment, moderation and external examinations at Forms 6 and 7. This is relevant to PacEdu's assessment architecture, but it is not a subject syllabus or achievement-indicator schedule. It cannot be used to populate the indicator bank. Official policy: https://www.education.gov.fj/wp-content/uploads/2022/11/POLICY-IN-NATIONAL-CURRICULUM-ASSESSMENT-AND-REPORTING.pdf.

**Primary literacy/numeracy package:** The Ministry-hosted Annual Report 2020–2021 search result confirms the report's official publication and repeats the Y1–Y8 English/Mathematics package description recorded above. It remains a historical status source; no current controlled syllabus, full scope-and-sequence or approval history was retrieved. Official Ministry-hosted PDF: https://www.education.gov.fj/wp-content/uploads/2024/06/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2020%E2%80%932021.pdf. Years 1–8 English/Mathematics remain pending.

**Coverage rule reaffirmed:** No active indicator records have been added from any of the above status, policy, annual-report, circular-listing or unofficial-host sources. The ECE, Years 1–8 and Forms 3–7 level rows remain pending until exact current controlled prescriptions are retrieved and validated. The active indicator count therefore remains zero. Daily activity authoring and 115-day allocation from this strict bank remain blocked pending that evidence.

### ECE outcome-framework review — decision superseded, 12 November 2026

A previous staging note proposed treating the *Na Noda Mataniciva* outcomes as PacEdu ECE outcome indicators for activity planning. **That proposal is withdrawn following the user's instruction to stick strictly to prescription indicators.** The guideline is an official Ministry curriculum reference, but its own foreword says it outlines outcomes rather than prescribing detailed learning content. The Ministry's 2025 PPE Policy and the 2 September 2025 Government announcement establish its continuing relevance and an ECE update process, but do not establish a current, detailed controlled prescription schedule with authorised indicator wording.

**Current rule:** Do not use Na Noda Mataniciva outcomes as active PacEdu prescription indicators or generate daily activities from them under the prescription-only bank. Retain the document only as an official background/reference source for source discovery and transition comparison. ECE remains `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` until CAS confirms the current formally authorised ECE prescription/outcome schedule, amendments, effective date and reuse terms. No Mataniciva outcomes are promoted to the active indicator bank.

The separate staging index `mataniciva-ece-outcome-indicator-index.md` is to be removed so it cannot be mistaken for an approved active indicator distribution. The original Ministry document remains an audit/reference lead only. Official source: https://www.education.gov.fj/wp-content/uploads/2022/06/Na-Noda-Mataniciva.pdf. Ministry policy: https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf. Government update notice: https://www.fiji.gov.fj/47th-fiji-early-childhood-teachers-association-conference-national-social-emotional-learning-launched/.


### Official-source discovery update — 12 November 2026 (continued)

**2025 Pre-Primary Education Policy:** The Ministry-hosted policy identifies *Na Noda Mataniciva* as the national curriculum guidelines for children aged 3–6, defines primary schooling as Years 1–8, and distinguishes public/registered ECE provision from private centres that organise their curriculum autonomously. This is useful for ECE scope and jurisdiction checks, but it is a policy document, not a current detailed ECE prescription or indicator schedule. ECE remains `PENDING_CURRENT_CONTROLLED_PRESCRIPTION`. Official source: https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf.

**Years 6–8 teacher-guide lead:** The Ministry-hosted *Year 6 & Year 8 Teacher's Guide* identifies itself as a first edition (2015), issued free to schools, and states that school classroom reproduction is subject to acknowledgement and other use must be referred to the Permanent Secretary through the Director Curriculum Advisory Services. It is not accepted as proof of the current full-year prescription, and its copyright/reuse terms are not permission for PacEdu's broader reuse. Do not import indicators from it without CAS confirmation of current status, exact authorised scope and written reuse terms. Official source: https://www.education.gov.fj/wp-content/uploads/2022/07/Y6_Y8_Guideline_2-Teachers_Guide.pdf.

**Primary subject/resource cross-check:** The Ministry's *Policy on Free Educational Resources* lists Year 7 and Year 8 learning resources including English, Mathematics, Healthy Living, Basic Science, Social Science and language/arts materials. This helps identify subject labels and possible resource leads, but a resource-supply list is not a syllabus or indicator prescription. It cannot populate the active bank. Official source: https://www.education.gov.fj/wp-content/uploads/2022/11/Policy_on_Free_Educational_Resources_FINAL.pdf.

**Secondary Years 9 and 11 historical review lead:** The Ministry's 2019–2020 Annual Report says curriculum working committees reviewed Year 9 and Year 11 curricula and developed teaching resources, and that new Year 9 curriculum/textbooks were endorsed and implemented in 2019. This is historical programme evidence only; it does not establish the current controlled syllabuses, subsequent revisions or present approval status. Obtain current year/subject prescriptions and version history from CAS. Official source: https://www.education.gov.fj/wp-content/uploads/2024/06/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2019%E2%80%932020.pdf.

**Years 11–13 subject leads:** The Ministry's 2016–2017 Annual Report lists historical Year 13 syllabuses across subjects including Accounting, Biology, Chemistry, Economics, English, Geography, History, Mathematics and Physics, and Year 11 Physical Education. These entries are not current prescriptions and must not be reused as indicators. They are only leads for requesting each current subject syllabus and its assessment specification. Official source: https://www.education.gov.fj/wp-content/uploads/2022/06/MEHA-Annual-Report-2016-2017.pdf.

**Decision and counts:** These searches located official policy, resource-list and historical programme documents, but no new current controlled subject prescription with a verifiable approval/effective date and complete indicator schedule. All ECE, Years 1–8 and Forms 3–7 rows remain `PENDING_CURRENT_CONTROLLED_PRESCRIPTION`. Accepted current prescription documents added: zero. Active prescription indicators added: zero. Daily activity generation and 115-day allocation from this bank remain blocked. Next retrieval priority remains the current controlled Years 1–8 English/Mathematics packages, then current subject-specific Years 9–13 syllabuses and ECE CAS confirmation.


### Additional official-source search — 12 November 2026

**System structure cross-check:** The Fiji Higher Education Commission's School Education page describes ECE, primary Years 1–8 and secondary Years 9–13, and explains the broad examination progression. This is a system-description source, not a subject-level syllabus or indicator schedule. Use it to check coverage boundaries only; do not create or infer indicator records from it. URL: https://nic.hec.org.fj/school-education.

**Ministry strategic-plan cross-check:** The Ministry's 2023–2026 Strategic Plan confirms the Year 1–8 and Year 9–13 school-level ranges and gives general school information. It does not provide the controlled subject prescriptions, exact indicator schedules, version approvals or effective dates needed for the active bank. URL: https://www.education.gov.fj/wp-content/uploads/2024/04/2023-2026-MOE-SP.pdf.

**Years 1–8 literacy/numeracy package — unresolved:** The official Ministry Annual Report 2020–2021 again confirms that changes were made to the Years 1–8 English and Mathematics syllabuses and lists the package components (syllabus, curriculum framework, scope-and-sequence overviews, year-level scope and sequence, teacher guides). The report is not the package itself and cannot establish the currently operative version. Retrieve the current controlled package and its approval/revision history from CAS. URL: https://www.education.gov.fj/wp-content/uploads/2024/06/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2020%E2%80%932021.pdf.

**Year 6–8 guide warning:** The Ministry-hosted Year 6 & Year 8 Teacher's Guide is labelled first edition, 2015. It is not accepted as a current full-year prescription and cannot be used to fill missing Years 6–8 indicators. Obtain written CAS confirmation of status, approved scope and reuse permission before considering any material from it. URL: https://www.education.gov.fj/wp-content/uploads/2022/07/Y6_Y8_Guideline_2-Teachers_Guide.pdf.

**Resource-list warning:** The Ministry's Policy on Free Educational Resources identifies learning-resource subject areas, but resource availability does not establish the currently prescribed syllabus, year-level outcomes or indicator wording. Do not use it as an indicator source. URL: https://www.education.gov.fj/wp-content/uploads/2022/11/Policy_on_Free_Educational_Resources_FINAL.pdf.

**Secondary English lead:** A recent programme recruitment notice reports that RSEC English frameworks for Years 9 and 10 have been developed and rolled out, while Year 11 work is being extended before Years 12–13. The notice is not the framework itself, nor does it establish its formal approval/version or reuse terms. Obtain the signed/current controlled framework and supporting outcome schedule from CAS. Do not use third-party copies or the notice text as indicators. URL: https://ausconnect.dfat.gov.au/opportunities/revised-secondary-english-curriculum-rsec-advisor-yr-11-australia-fiji-education-fiji-program.

**Third-party curriculum mapping excluded:** A 2025-hosted Years 1–8 mapping PDF surfaced, combining syllabus labels and years across different learning areas. It is not a Ministry-controlled publication, and its mixed vintages make it unsuitable as a source of current indicator wording. It may be used only to identify candidate document titles for direct Ministry verification. No content was copied into the register's active indicator bank. Discovery URL: https://sustainability-and-stories.org/wp-content/uploads/2025/09/Fiji-Primary-Curriculum-mapping-Years-1-to-8b.pdf.

**Outcome of this search:** No current controlled subject prescription with verifiable approval/effective date and complete level-specific indicator schedule was retrieved. ECE, Years 1–8 and Forms 3–7 remain `PENDING_CURRENT_CONTROLLED_PRESCRIPTION`; accepted current prescription documents added: zero; active prescription indicators added: zero. Daily activity authoring and 115-day distribution from this bank remain blocked. Next step is to obtain the controlled source files and document-control confirmation from CAS/authorised school distribution, then validate each year and subject independently.


### RSEC English evidence distinction — 12 November 2026 (continued)

The current Australia–Fiji Education Program recruitment notice specifically describes the Years 9–10 RSEC English frameworks as developed and rolled out, and describes Year 11 framework development as following existing achievement indicators. This strengthens the conclusion that an identifiable Years 9–10 controlled framework/indicator set exists and should be requested from CAS. It does not itself provide the approved indicator schedule or document-control metadata. Official programme notice: https://ausconnect.dfat.gov.au/opportunities/revised-secondary-english-curriculum-rsec-advisor-yr-11-australia-fiji-education-fiji-program.

A third-party-hosted copy of the RSEC Years 9–10 Teacher Guide states that achievement standards and CLOs express expected end-of-year achievement, while classroom-level objectives are called KUDs (Know, Understand, Do); it also describes model units and assessment tasks/rubrics. This is a useful document-identity and terminology lead, but the host is unofficial and the guide states Ministry/CAS copyright and restrictions on reproduction. Do not scrape/transcribe its outcome or indicator wording into PacEdu. Request the approved controlled copy, its linked syllabus/framework and exact indicator schedule, version/effective date, amendments and written reuse terms from CAS. Discovery copy: https://fliphtml5.com/gjgbb/naau/RSEC_Teachers_Guide_Year_9_%26_10/.

**Implementation implication:** If CAS confirms that the Years 9–10 RSEC framework contains the authoritative achievement indicators, import only those exact controlled indicators into a separate immutable source version. Keep CLO/achievement-standard/KUD/model-unit/assessment-rubric fields distinct; do not relabel classroom objectives or task prompts as prescribed indicators. Year 11 remains pending until its own formally approved package is issued. No RSEC indicator text has been added in this update.


### National curriculum governance and senior secondary review — 12 November 2026

**Important governance change — FNCF 2013 review:** Fiji Cabinet's official 7 October 2025 decisions endorsed a review of the 2013 Fiji National Curriculum Framework and established a taskforce for initial planning. This is a framework-review decision, not evidence that the existing year/subject prescriptions have already been replaced. Do not assume either that all existing prescriptions are withdrawn or that they remain unchanged indefinitely. For every source, record any later circular or formal transition notice that states its current status. Official Cabinet record: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/.

**2026 Education Commission review:** FBC reported on 23 September 2026 that the Fiji Education Commission had handed its 2026 report to the Minister and that the Ministry would consider its recommendations. This is a significant policy-review milestone, but not itself an adopted curriculum prescription or an order replacing existing syllabuses. Obtain the report and any subsequent Cabinet/Ministry decisions before changing source status. Until a formal adoption, amendment or withdrawal is verified, keep each syllabus status pending current controlled confirmation. Report: https://www.fbcnews.com.fj/news/education-commission-report-handed-over/.

**Secondary TEST subject review — Years 12–13:** The Ministry Annual Report 2022–2023 describes analysis/review work for Year 12 Applied Economics, Applied Technology, Design Technology, Home Economics and Office Technology syllabuses, and Year 13 Computer Education. It also records Year 9–13 TEST textbook amendments, Year 11 Home Economics and Industrial Arts resources implemented in 2021, Year 12/13 Computer Education review, and Year 12/13 Agricultural Education and Office Technology materials. These entries establish that subject-level review activity occurred, but do not establish the latest approved syllabus version, effective date, or complete outcome/indicator schedule. Each subject/year remains pending until the controlled syllabus and approval history are retrieved. Official report: https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-Education-Annual-Report-2022%E2%80%932023.pdf.

**Assessment-policy distinction:** Cabinet's 7 October 2025 decision endorsed reintroduction of scaling for national external examination marks from the 2026 academic year. This affects interpretation of examination results, not the wording or completeness of curriculum indicators. PacEdu must not change indicator mastery thresholds or teacher assessment criteria merely because external marks are scaled; any assessment-policy integration requires its own formal rule and approval. Official Cabinet record: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/.

**Older secondary Mathematics syllabus lead:** A third-party-hosted copy of a Year 9–10 Mathematics syllabus labels itself first edition 2015 and carries Ministry copyright and restricted-use wording. It is not a controlled source and is not accepted as current. Request the current Years 9–10 Mathematics syllabus, any replacement or amendment, and its achievement-indicator schedule directly from CAS. Discovery copy: https://www.scribd.com/document/571027588/Years-9-10-Mathematics-Syllabi-231214. No wording copied.

**Decision:** These findings strengthen the requirement to track framework-level review separately from subject-prescription validity. No new current controlled subject prescription has been accepted. All ECE, Years 1–8 and Forms 3–7 coverage rows remain `PENDING_CURRENT_CONTROLLED_PRESCRIPTION`; active prescription indicator count remains zero. Do not freeze the 2013 framework as the presumed future framework, and do not prematurely discard extant subject syllabuses absent a formal replacement/withdrawal notice. Continue source acquisition and record formal transition evidence as it appears.


### Senior-secondary Mathematics and project-assessment source detail — 12 November 2026

**Year 12 Mathematics pathway distinction:** The Ministry's 2022–2023 Annual Report records two Year 12 Mathematics pathways: Life Mathematics and Pure Mathematics. It says Life Mathematics was rolled out in 2022 following a pilot in the prior year. This is an important subject/pathway completeness check: PacEdu must not treat Year 12 Mathematics as one undifferentiated indicator sequence or merge Life and Pure Mathematics outcomes. However, the report does not provide the complete current controlled syllabuses, approved indicator schedules, or post-2022 amendments. Obtain the exact current Life and Pure Mathematics prescriptions separately from CAS. Official report, printed report section around the Year 12 Life Mathematics discussion: https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-Education-Annual-Report-2022%E2%80%932023.pdf.

**Year 12 language research projects:** The same report records Year 12 Vosa Vakaviti project themes for 2022–2026 and moderation of Hindi and Urdu projects. These are project-assessment arrangements and dated themes, not complete language syllabuses or standalone achievement-indicator lists. Record them only in a separate assessment/project requirements register after current circulars and specifications are verified; do not import them as curriculum indicators. The report references MEHA Circulars 15/2022 and 17/2022 for project moderation. Obtain current signed circulars and any superseding notices from the Ministry before implementing project requirements.

**Assessment separation for PacEdu:** Curriculum indicators, syllabus learning outcomes, assessment specifications, project themes, marking criteria and external-examination weighting must be separate linked records. An examination project contributing a stated percentage or a moderated assessment process does not by itself define the full curriculum indicator set. Keep formal assessment eligibility disabled until the current subject prescription and assessment authority are separately validated.

**Status:** These official report details refine the source request list but do not qualify as current controlled prescriptions. No indicator wording added; Year 12 Life Mathematics and Pure Mathematics both remain pending controlled-source verification, as do the language project requirements and all other level/subject rows.


### 2026 primary numeracy review and school-year delivery update — 12 November 2026

**Primary numeracy review is actively being commissioned:** A recent Australia–Fiji Education Program notice seeks an independent numeracy curriculum specialist to review the primary Years 1–4 numeracy curriculum, explicitly including syllabi, teacher guides, scope and sequence, instructional expectations, pacing, assessment guidance and existing expected learning outcomes. This is a current review/procurement notice, not an adopted replacement prescription. It means PacEdu must not treat any older Years 1–4 Mathematics/numeracy package as conclusively current without CAS confirmation of the review's outcome and any formal transition notice. Do not anticipate or invent revised indicators from the review brief. Official programme notice: https://ausconnect.dfat.gov.au/opportunities/independent-numeracy-curriculum-specialist-australia-fiji-education-fiji-program.

**2026 national assessment results are not prescriptions:** A media report dated 20 August 2026 quotes the Minister on Year 5 and Year 7 literacy/numeracy results and the Ministry's intention to use assessment results to strengthen teaching and learning. Such results may later inform diagnostic/revision planning, but they do not supply curriculum indicator wording or authorise a change to syllabus scope. Treat assessment datasets as evidence inputs only after authorised access and privacy controls; never convert a score trend into a prescribed indicator. Discovery report: https://fijisun.com.fj/news/education/year-5-year-7-literacy-results-improve-but-numeracy-declines.

**Term 2 coverage / Term 3 revision — circular must be obtained:** A June 2026 newspaper report describes an April 28 Ministry administrative circular directing schools to complete curriculum coverage by the end of Term 2. A separate June 15 report quotes the Permanent Secretary as clarifying that Term 3 continues normally and includes trial examinations, remedial teaching, revision and examination preparation. These are media accounts, not the signed circular or formal learning-and-teaching plan. Do not change PacEdu's 115-day distribution or presume all subjects' coverage windows from media summaries. Obtain the signed circular, any annexes and current Ministry academic calendar/learning-and-teaching plan. The Term 3 revision design must use only concepts already taught and verified against the approved prescription, while leaving room for remedial and examination preparation. Sources for document discovery only: https://www.fijitimes.com.fj/schools-told-to-finish-curriculum-by-term-2/ and https://fijilive.com/education-ps-dismisses-unsubstantiated-claims-on-school-operations/.

**Current national strategy:** Cabinet's 22 September 2026 decision endorsed the 10-Year Education Sector Strategic Plan 2025/2026–2034/2035. This is a sector strategy and governance context, not a set of subject prescriptions or indicator codes. Track any future formal Ministry curriculum circulars arising from the strategy separately. Official Cabinet decision: https://www.fiji.gov.fj/decisions-of-the-17th-cabinet-meeting-held-on-22-september-2026/.

**Curriculum-framework review status:** Cabinet's 7 October 2025 decision endorsed review of the 2013 Fiji National Curriculum Framework and established a taskforce for initial planning. The framework review and the 2026 Years 1–4 numeracy curriculum review are separate processes. Neither notice is an adopted subject prescription. Keep subject-level source status pending until the controlled documents and formal adoption/transition notices are available. Official Cabinet decision: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/.

**Source-status decision:** The 2026 numeracy review creates a new high-priority source request: current Years 1–4 Mathematics/numeracy syllabi, teacher guides, scope and sequence, expected learning outcomes, pacing and assessment guidance, plus CAS confirmation of the review's current status and any superseding documents. No new controlled prescription or indicator has been accepted in this update. All ECE, Years 1–8 and Forms 3–7 rows remain `PENDING_CURRENT_CONTROLLED_PRESCRIPTION`; active indicator count remains zero. Daily activity generation from the prescription-only bank remains blocked until the actual controlled indicators are received and validated.


### Curriculum authority, learner progression and assessment-policy controls — 12 November 2026

**CAS is the correct controlled-source authority:** The Ministry's 2021–2022 Annual Report describes Curriculum Advisory Services' responsibilities as reviewing/developing ECE, primary and secondary curricula and syllabi; developing teaching/learning resources; developing external assessments for Years 6, 8, 10, 12 and 13 and final assessments for Years 7, 9 and 11; developing LANA; and procuring/dispatching syllabi and supplementary resources to schools. This confirms the appropriate Ministry route for requesting controlled syllabuses and source-version history. It is an organisational-role record, not a source of indicator text. Official report: https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-EducationHeritage-and-Arts-Annual-Report-2021%E2%80%932022.pdf.

**Student Progression and Retention Policy — separate authority layer:** Cabinet's 7 October 2025 decision endorsed Fiji's Student Progression and Retention Policy for primary and secondary schools. The Cabinet summary says learner progress is gauged using literacy and numeracy competency levels and progression decisions involve students, parents, teachers and the Head of School, with monitoring and support strategies. This is a progression/governance policy, not a syllabus or achievement-indicator schedule. PacEdu must represent progression decisions as a separate governed workflow and must not invent a pass threshold, automatic promotion rule or indicator from the Cabinet summary. Obtain the full signed policy, implementation circulars and any authorised competency-level rubrics before implementing progression decisions. Official Cabinet decision: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/.

**External examination scaling — do not conflate with mastery:** Cabinet endorsed reintroduction of scaling across national external examination levels from the 2026 academic year. Scaling applies to external examination marks; it does not rewrite curriculum outcomes or automatically alter classroom mastery thresholds, teacher rubrics, parent home-practice marks or PacEdu's indicator completion rules. Keep raw evidence, teacher-assessed mastery, moderated internal results and externally scaled examination results as distinct data types. Obtain the full current policy and technical guidance before calculating or displaying scaled marks. Official Cabinet decision: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/.

**External examination policy catalogue:** The Pacific Data Hub Education Policy Bank lists Ministry policies on External Examinations and Assessment and National Curriculum Assessment and Reporting. These are policy leads for assessment governance and reporting, not curriculum prescription files. Retrieve the Ministry-controlled current versions and any circulars before implementing exam administration, moderation or reporting rules. Catalogue: https://pacificdata.org/data/group/education-policy-bank?groups=education-policy-bank&member_countries=fj&organization=fiji-ministry-of-education-heritage-and-arts&res_format=PDF&tags=curriculum&topic=Education&type=publications.

**CAS request bundle to resolve outstanding source gaps:** Request from the Director, Curriculum Advisory Services (or authorised Ministry records channel) a controlled electronic copy and source-control cover sheet for each currently operative document, with: (1) exact title/document number; (2) subject and year/form; (3) approval authority/date and effective date; (4) version/edition; (5) full syllabus and all outcome/indicator annexes; (6) scope-and-sequence and contact hours; (7) teacher guide and assessment specifications where formally linked; (8) amendment, replacement and withdrawal history; (9) status of current reviews/trials and transition arrangements; (10) written copyright/licence permission for PacEdu's intended storage, transformation, display and distribution. Prioritise ECE, Years 1–4 English/Mathematics, Years 5–8 English/Mathematics, RSEC Years 9–10 English, Year 11 English, each current Year 12/13 subject and all remaining prescribed learning areas. Record each response and document independently; a broad confirmation that “the curriculum is current” is insufficient without identifying exact documents and versions.

**PacEdu implementation separation:** Keep five linked but separate layers: (A) controlled curriculum prescription and exact indicators; (B) teaching sequence and daily activity; (C) classroom evidence/teacher assessment and moderation; (D) parent/home revision evidence, clearly labelled non-official and never overwriting teacher records; (E) national external examination result/scaling. Learner progression decisions must be another restricted workflow tied to the full authorised policy, with human review and parent/student participation as required. No automatic progression, official grade, exam scaling or assessment threshold is to be inferred from the curriculum indicator bank.

**Status:** The CAS role and the Cabinet progression/scaling decisions are verified governance leads, but none supplies the missing current subject prescriptions. Accepted current prescription documents added: zero. Active prescription indicators: zero. All ECE, Years 1–8 and Forms 3–7 remain pending controlled prescription verification. Daily activity generation from the strict bank remains blocked pending actual approved indicator sources.


## Official-source audit — 12 November 2026 (continued)

### New evidence reviewed

- The Fiji Government's 7 October 2025 Cabinet decisions record endorsement of a review of the 2013 Fiji National Curriculum Framework and establishment of a taskforce for initial planning. This is evidence of a framework review, not evidence that a replacement framework or any subject prescription has been formally adopted or made effective. The review must therefore not be treated as automatic withdrawal or replacement of existing subject prescriptions.
  - Official source: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/
- The Ministry's 2020–2021 Annual Report describes changes to the Years 1–8 syllabus and identifies a package comprising the framework, scope-and-sequence overviews, year-level scope and sequence, and teacher guides. This confirms the existence of a structured primary package at that time, but does not establish the current approved edition, amendments, or effective status in November 2026.
  - Official source: https://www.education.gov.fj/wp-content/uploads/2024/06/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2020%E2%80%932021.pdf
- The Higher Education Commission's school-education overview describes ECE, Years 1–8 and Years 9–13 and the broad FALD/KLA structure. It is useful for level coverage and inventory planning only; it does not supply the controlled subject-by-year indicator schedules required for import.
  - Source: https://nic.hec.org.fj/school-education
- A 2024 news report quoting the Ministry states that English and Mathematics literacy/numeracy curriculum work for Classes 1–8 had been completed and that Years 9–10 literacy/numeracy was being piloted. This is a discovery lead only, not a current Ministry-controlled approval instrument; it cannot establish which version is now authorised.
  - Source: https://www.fbcnews.com.fj/news/curriculum-review-in-progress/

### Decision and required evidence

1. Keep the 2013 NCF review status separate from subject-syllabus status. Do not infer adoption, withdrawal, or replacement of any subject prescription from the Cabinet decision alone.
2. Keep the Years 1–8 English and Mathematics packages in PENDING_CURRENT_CONTROLLED_PRESCRIPTION until CAS supplies or confirms the current approved syllabus, framework alignment, scope-and-sequence, year-level schedules, teacher guides, amendment history, and effective dates.
3. Keep Years 9–10 literacy/numeracy pilot material out of the active bank unless CAS confirms final approval, national rollout, exact controlled edition, and effective date.
4. Continue ECE and Years 1–13 coverage. The broad HEC level map is not a substitute for prescriptions at each year, subject, strand, and pathway.
5. No indicators were imported or generated from these sources. Active prescription indicator count remains zero; daily activity generation and 115-day distribution remain blocked pending verified controlled prescriptions and validated scope/contact hours.

### CAS document request checklist

For each level and subject, obtain: (a) approved syllabus/prescription; (b) indicator/outcome schedule with exact codes and wording; (c) scope and sequence; (d) year-level teacher guide; (e) version/edition and approval/effective date; (f) amendments, supersession and withdrawal notices; (g) assessment and contact-hour requirements; and (h) copyright/reuse permissions. Record source page/section and controlled-copy provenance before importing any indicator.

### Safety boundary

This is a documentation-only staging update. No merge, production deployment, Firebase write, learner or payment record change, or APK replacement is authorised by this audit. CI must be checked separately and must not be described as passed unless a relevant workflow run and its result are verified.


## Official Ministry document inspection — 12 November 2026 (continued)

### Important primary-source finding: Years 6 and 8 Term 3 guide

The Ministry-hosted PDF titled "Teachers Guide for Y6 & Y8 Teachers-Term3", published by the Curriculum Development Unit and marked First edition 2015, was inspected directly:
https://www.education.gov.fj/wp-content/uploads/2022/07/Y6_Y8_Guideline_2-Teachers_Guide.pdf

The guide explicitly says it assists Year 6 and Year 8 teachers to design lessons after the external examination (printed page 1 / PDF lines 100–104). Its tables contain content learning outcomes, achievement indicators, scope/content and some coded outcomes (for example PE 6.1.1.1a and PE 8.1.1.1b; printed pages 3–5 / PDF lines 255–304 and 365–480). This is useful evidence of the format and existence of achievement-indicator material, but its post-examination Term 3 purpose and 2015 first-edition date mean it is not proof of the current full-year controlled prescription. Do not import these rows into the active bank as current indicators without CAS confirming their current status, applicable subject/year scope, amendments and effective dates.

### Free Educational Resources policy and access safeguards

The Ministry-hosted Policy on Free Educational Resources identifies CAS as policy owner, defines free resources to include syllabi, teacher guides and workbooks, and says students may take textbooks and supplementary notes/workbooks home for revision (sections 4.7–4.8; printed pages 4–5). It also requires approval for school reproduction and warns against copyright infringement (sections 4.12–4.13; printed page 5).
https://www.education.gov.fj/wp-content/uploads/2022/11/Policy_on_Free_Educational_Resources_FINAL.pdf

This policy is relevant to PacEdu resource-access and copyright workflow design, not a source of curriculum indicators. PacEdu must not assume permission to reproduce Ministry or third-party materials beyond the policy's stated conditions and applicable copyright law.

### Subject inventory leads — not accepted prescriptions

- The Ministry policy appendix lists primary subjects/resources including English, Mathematics, Healthy Living, Elementary Science, Social Studies, Vosa Vakaviti, Hindi, Urdu, Rotuman, Performing Arts and Visual Arts. The appendix is a 2016 resource list; it is not evidence that every listed item is a current prescription or that its linked resource remains current.
- A third-party-hosted Year 9–10 Social Science syllabus labels itself a 2014 trial version. Exclude it from the active indicator bank pending the current controlled CAS copy.
- A third-party-hosted Years 5–6 Elementary Science syllabus labels itself a 2015 trial version. Exclude it from the active indicator bank pending current controlled confirmation.
- A Ministry strategic plan confirms the broad Year 1–8 primary and Year 9–13 secondary structure, but does not supply indicator schedules.

### Register decisions

1. Record the Y6/Y8 Term 3 guide as an official historical candidate with a precise limitation; do not promote its indicators.
2. Record the Free Educational Resources policy as an access/copyright policy, not curriculum prescription.
3. Add the primary subject/resource list as an inventory lead only.
4. Keep Social Science Y9–10 and Elementary Science Y5–6 trial copies excluded until CAS verifies the current controlled editions.
5. Active current controlled prescription count remains zero; active prescription indicator count remains zero. Daily activities and 115-day distribution remain blocked pending complete, current, approved prescriptions, scope-and-sequence and contact-hour validation.

### Required next evidence

Request from CAS the current controlled subject-by-year prescriptions for Science, Social Science and all remaining primary/secondary subjects, including exact indicator codes and wording, approval and effective dates, amendment/supersession history, and permission terms for digital reproduction. Also request confirmation whether the Y6/Y8 Term 3 guide remains in force for any limited post-examination purpose.


## Source-labelled supplementary concept bank — 12 November 2026

A separate reference-only bank has been created at `docs/curriculum/fiji-achievement-indicators/source-labelled-supplementary-concept-bank.md` (7 source-labelled records). It preserves official ECE guideline concepts, RSEC Years 9–10 English guide concepts and distinct achievement-standard/CLO terminology, primary Years 1–8 package metadata, the 2016 primary subject-resource inventory, the official assessment/reporting policy concepts, a third-party 2018 Year 13 Biology trial lead, and a UNESCO/USP Pacific ESD resource. These records are explicitly NOT active prescribed indicators.

Recommended design: maintain separate `prescribed_indicators`, `reference_outcomes`, `supplementary_concepts`, `activity_mappings`, and `worksheet_versions` records. Each record must retain source title, authority/publisher, URL, date/version, page/section, level/subject, verification state and reuse rights. A supplementary worksheet may be drafted only after teacher validation and rights review and must be labelled “SUPPLEMENTARY — NOT A SUBSTITUTE FOR THE FIJI PRESCRIPTION”. Official daily worksheets remain blocked until current controlled prescriptions are verified.

Current controlled Fiji prescription sources accepted: 0. Active prescribed indicators: 0. Source-labelled reference/supplementary records: 7. Approved daily worksheets from active prescriptions: 0. No indicator was promoted from a guideline, annual report, third-party host, trial syllabus or regional resource.


## Additional Fiji FinED learning-outcome sources — 12 November 2026

Two additional Fiji Financial Education programme sources have been indexed in the supplementary concept bank (now 9 source-labelled records):

- Primary Years 1–8: official programme learning outcomes arranged by year bands and strands, with curriculum links to Mathematics, English, Social Studies and Social Sciences. Themes include money, budgeting, saving, credit, income, financial planning and financial risk. Store as programme reference outcomes, not active prescription indicators until CAS confirms current adoption, exact controlled version, revisions and effective date.
- Forms Five and Six / Years 11–12: a historical programme manual records financial-education competency indicators and concepts, and states that selected learning outcomes were integrated into Accounting, Economics, English and Mathematics prescriptions at the time. Treat this as a high-value CAS verification lead, not proof of current 2026 placement.

Source pages and links are recorded in `docs/curriculum/fiji-achievement-indicators/source-labelled-supplementary-concept-bank.md`. No source outcomes have been promoted into the active prescribed indicator bank. Current controlled Fiji prescription sources accepted remain 0; active prescribed indicators remain 0. Daily worksheets from the active prescription bank remain blocked. A separate supplementary worksheet may be developed only after teacher validation and reuse-rights review, with explicit supplementary labelling.



## New source discoveries (12 November 2026)

Four additional Fiji curriculum/teacher resources have been indexed in the supplementary concept bank, increasing the source-labelled record count from 9 to 13:

- **Years 9–10 Revised Secondary English Teacher's Guide (2024, CAS-attributed):** records Achievement Standards, CLOs, Learning Objectives, formative Dry Run Tasks, summative Performance Tasks and rubrics; strands include Language, Text Types and Critical Literacy. Third-party-hosted copy; verify controlled Ministry version and current rollout before activation.
- **Year 4 Elementary Science (revised edition 2023):** Ministry/CAS resource lead with strands covering Living Things and Environment, Matter, Energy, and Earth and Beyond. Its front matter identifies Ministry ownership and school classroom reproduction conditions; external PacEdu reuse needs permission.
- **Year 1 Moral Values and Civic Education Teacher's Guide (2022):** Ministry/CDAU guide based on Years 1–3 syllabi; verified concept examples include right/wrong choices, fairness, teamwork, respect, chores/community care and hygiene. Confirm current syllabus/version.
- **Teacher's Guide to Disability-Inclusive Education in Fiji (updated edition cited 2023):** official Ministry-hosted cross-curricular teaching/assessment guidance; includes formative and summative assessment practice, reasonable adjustments and consultation with learners/caregivers/teachers. This is teacher-practice guidance, not a subject indicator source.

**Teacher-role implementation note:** The Ministry assessment policy requires valid/reliable and equitable assessment, explicit criteria, moderation, regular reporting to parents/guardians and use of assessment evidence to improve teaching. The Ministry disability-inclusive guide further supports planning assessment before teaching and applying reasonable adjustments. These obligations should inform PacEdu teacher workflows, but PacEdu must not claim that any single guide exhaustively states all legal teacher duties.

**Current prescription status remains unchanged:** current controlled Fiji prescription sources accepted = 0; active prescribed indicators = 0. The four new records are reference/teacher-guidance records only. No supplementary concept has been promoted into the active prescribed indicator bank. Daily prescription-based worksheets remain blocked pending verification of current controlled prescriptions, version/effective date, subject-level outcomes, and reuse authority.


## Additional Fiji resource indexed (12 November 2026)

- **Year 4 Moral Values and Civic Education Teacher's Guide (2022):** Ministry/CDAU-issued resource. The foreword says MCE expanded from Years 1–3 to Years 4–6. Recorded strand structure includes Character Building (Making Choices and Decisions, Good Manners, Discipline) and Relationship (Love, Respect), with broader strands for health, wellbeing and safety, and citizenship. This increases the supplementary/source-labelled record count to 14. Treat as a teacher-guide reference pending confirmation of the controlled current syllabus and version; reuse permissions must be respected.

No change to active prescribed indicators: 0 current controlled prescription sources accepted; 0 active prescribed indicators. No daily prescription-based worksheet generation is authorised from these reference records.

## Locked rule: historical source lineage before every daily worksheet (12 November 2026)

Before a daily worksheet is drafted, every proposed indicator/concept must have its own source lineage record in the source-labelled concept bank. Search older Fiji prescriptions, syllabuses, teacher guides, textbooks and assessment materials to identify its earlier wording, origins, prerequisite concepts and progression. Record the source authority, title, edition/year, page/section, exact short wording, URL/file identifier, classification, status, rights and relationship to the current concept. Keep each edition separate and document differences; never silently merge versions.

Each concept record must carry a stable ID, current prescription code/wording if verified, subject/year/strand, historical source list, current/superseded/withdrawn/draft/historical status, reuse permissions, teaching-use note and worksheet eligibility. Historical material is provenance, not proof of current mandatory status. A verified current prescription takes precedence. Where no current controlled prescription is verified, do not call the concept mandatory. A supplementary worksheet may be considered separately only after rights review and teacher validation and must be labelled supplementary. All worksheet drafts remain PENDING_TEACHER_REVIEW until teacher approval.

This rule is locked for all subjects and levels ECE–Year 13/Form 7. No untraceable concept may be used to create a PacEdu daily worksheet.

## Historical lineage sources added (12 November 2026)

Four additional Fiji historical/reference sources are indexed, bringing the source-labelled bank to 18 records:
- **English Year 4 resource book (2013; 2019 workgroup amendments indicated):** historical themes include family/culture, health/safety, environment, entertainment, science/technology and careers. Themes only; not indicators. Third-party-hosted; Ministry classroom reproduction notice requires acknowledgement and other uses referred to Ministry.
- **Years 9–10 English syllabus (historical CDU-attributed copy):** explicitly says essential concepts, skills and attitudes were selected from old prescriptions and incorporated into the syllabus. Records older strands Listening & Speaking, Reading & Viewing, Writing & Shaping. Strong historical lineage lead; authenticate edition and exact prior prescription before linking individual outcomes.
- **Fiji Mathematics curriculum history article:** scholarly source reports a 1988 Ministry Forms 5–6 Mathematics prescription and historical concept themes including arithmetic, fractions, decimals, measurement, money, ratio, proportion, averages and percentages. Research only; use to locate the original prescription, not as active indicator authority.
- **Mathematics for Class 8/Form II, revised 1998:** bibliographic lead for a historical Ministry Curriculum Development Unit textbook. Actual contents were not available, so no concepts extracted.

These records support the newly locked requirement to identify older sources for each individual concept. The source-lineage process must obtain original pages and exact wording before recording a one-to-one relationship. A thematic similarity is not proof of equivalence.

Active current prescription status remains unchanged: 0 verified controlled prescription sources accepted; 0 active prescribed indicators. No worksheets generated from historical sources.

## Further Fiji science and primary curriculum lineage leads (12 November 2026)

Three source records were added, bringing the source-labelled concept bank to 21:
- **Basic Science Years 7–8, 2015 trial syllabus:** historical/trial concepts include endangered/endemic species, biodiversity, habitat, conservation and human impacts such as deforestation, pollution, pesticides, overharvesting and overfishing. It uses mini learning outcomes and sequenced learning progressions. Trial status must remain explicit.
- **Elementary Science Years 5–6, 2015 trial syllabus:** source introduction identifies science inquiry/process skills such as observing, measuring, classifying, inferring, predicting, testing, analysing, reporting, simple experiments and environmental care. These are broad aims/process statements, not individual year-level indicators.
- **Fiji Primary Curriculum Mapping Years 1–8 (2025 third-party compilation):** crosswalk index to multiple source years and subjects. Useful to discover original codes, but never authoritative itself; every item must be checked against the cited original prescription or teacher guide.

**English/Mathematics verification lead:** the Ministry's 2020–2021 Annual Report records a Years 1–8 literacy/numeracy syllabus package with the Fiji National Curriculum Framework, scope-and-sequence overviews, year-level scope and sequence, and teacher guides. This is evidence that a structured primary package existed; obtain and authenticate the actual controlled files and revision dates before accepting individual indicators.

Current controlled prescription sources accepted remain 0; active prescribed indicators remain 0. No worksheet has been created from the trial syllabuses or third-party crosswalk.


## Additional senior Mathematics and official curriculum-status leads (12 November 2026)

Three source-labelled records have been added to the source bank, bringing it to 24 records:
- **Mathematics Syllabi Years 11–12 (2014/2015 trial copy):** third-party-hosted copy identifies a trial version and a structured progression/course-content layout. Historical lead only; it must be compared with approved subsequent Life and Pure Mathematics syllabuses. The 2022–2023 Ministry Annual Report confirms that Year 12 Life Mathematics was later rolled out following a pilot and distinguishes Life from Pure Mathematics. See official report: https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-Education-Annual-Report-2022%E2%80%932023.pdf
- **Ministry Annual Report 2022–2023:** official status/lineage evidence for Ministry curriculum responsibilities, resource development, teacher training, assessment and the Year 12 Life Mathematics pathway. It is not a prescription and contains no accepted active indicator in this register.
- **Policy on Free Educational Resources:** official inventory of prescribed textbooks/resources, including Year 10 Basic Science and Social Science. It helps locate approved resources but is not a learning-outcome or achievement-indicator source.

**Important senior Mathematics control:** do not combine Life Mathematics and Pure Mathematics into one undifferentiated Year 12 indicator set. Retrieve the approved pathway-specific syllabuses and verify their effective versions before accepting indicators.

Current controlled prescription sources accepted remain 0; active prescribed indicators remain 0. No worksheet has been created from the trial Mathematics copy, annual report or resource inventory.


## Pre-primary policy, national policy framework and Mathematics version-control findings (12 November 2026)

Three additional official records were indexed in the source bank (27 records total):
- **National Pre-Primary Education Policy (2025):** authoritative policy defines PPE as the one-year programme for five-year-olds before Year 1 and says covered programmes must use the approved Ministry curriculum. It identifies Na Noda Mataniciva as national guidelines for ages 3–6 and the 2013 NCF as spanning early childhood to Year 13. PacEdu must distinguish the broader 3–6 Mataniciva guidance from the five-year-old pre-primary year; obtain approved curriculum outcome pages before making indicator claims. Official source: https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf
- **2023 Denarau Declaration / Fiji National Education Policy Framework 2024–2033:** official policy framework supports NCF review and policy priorities such as climate, financial and digital literacy. It is not itself a subject/year prescription; do not convert policy themes into mandatory indicators without approved curriculum wording. Official source: https://www.education.gov.fj/wp-content/uploads/2024/02/2023-Denarau-Declration.pdf
- **Ministry Annual Report 2020–2021:** confirms a Years 1–8 literacy/numeracy package with NCF, scope-and-sequence overviews, year-level scope and sequences and teacher guides. It also describes a Year 11 Mathematics pilot using “Life Skills Mathematics” and “Applied Mathematics”. This differs in naming from the 2022–2023 report's “Life Mathematics” and “Pure Mathematics” labels. Treat as a version-control warning: retrieve approved pathway syllabuses and establish effective dates; do not merge labels or indicator sets by assumption.

Current controlled subject prescription sources accepted remain 0; active prescribed indicators remain 0. No worksheets have been created from policy documents or annual-report descriptions.


## Primary Literacy/Numeracy revision status and Year 1 English lineage update (12 November 2026)

Two additional records have been indexed in the source bank (29 records total):
- **Ministry Annual Report 2022–2023:** official report states Years 1–4 revised literacy/numeracy curriculum implementation began in all primary schools in 2023 after a 90-school trial; 648 final syllabus/LN guide sets were supplied to schools. It says Years 5–8 were then in Phase 2 trial and syllabus documents were uploaded to FEMIS/Moodle. This means the Years 1–4 final package must be obtained and used ahead of older Year 1 English resources; Years 5–8 draft/trial material must not be mislabelled final. Exact CLOs/indicators are not in the annual report. Official source: https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-Education-Annual-Report-2022%E2%80%932023.pdf
- **Year 1 English: Language, Literacy and Communication (2013; revised 2019; reprinted 2020):** Ministry/Curriculum Development Unit attributed resource, currently accessible only as a third-party hosted copy. Historical lineage source; compare against the final Years 1–4 revised literacy curriculum and confirm authenticity/rights before use.

**Current status distinction:** The 2025 National Pre-Primary Education Policy still names the 2013 NCF as the framework and says PPE programmes must use the approved Ministry curriculum. Cabinet endorsed review of the 2013 NCF in October 2025, but this search did not locate an officially published replacement NCF or controlled Years 5–8 final literacy/numeracy package. This is a bounded search finding, not proof that no later internal documents exist. Official references: https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf and https://www.fiji.gov.fj/14th-Cabinet-Meeting-Decisions-7-October-2025/

Active individual prescribed indicator records remain 0 until actual approved syllabus pages and exact outcome wording are obtained and version-checked. No worksheets generated from annual reports or third-party book copies.


## Source record 30 — Years 3 & 4 Literacy Guide (Ministry-hosted teacher guidance)

- **Primary source:** Fiji Ministry of Education, Heritage & Arts, *Years 3 & 4* Literacy Guide for Lower Primary, Ministry-hosted PDF: https://www.education.gov.fj/wp-content/uploads/2022/06/Literacy_Guide_-for_years_34.pdf
- **Authority/status:** Official Ministry teacher guide. Its foreword says it is aligned to the syllabus and supplies practical classroom strategies; it is not, by itself, the controlled syllabus or proof of mandatory achievement indicators.
- **Page evidence:** PDF pp. 3–5 daily guide; pp. 36–37 Fiji-language phonics; later pages include assessment and reading-progress checklists.
- **Indexed concepts:** oral language, shared reading, prediction, comprehension, sight words, phonics, word analysis, sentence construction, fluency, writing, dictation, reading-progress monitoring. These remain teacher-guidance concepts pending exact syllabus crosswalk.
- **Lineage/status:** current prescription wording and older-source lineage not yet verified. The Ministry guide is Ministry-hosted; edition date is not explicit in the retrieved front matter.
- **Rights:** verify permission before copying or adapting guide text or activities.
- **Worksheet eligibility:** `SUPPLEMENTARY_ONLY`; requires prescription crosswalk, rights review and `PENDING_TEACHER_REVIEW`.


## ECE framework clarification — Na Noda Mataniciva (2009)

The Ministry-hosted *Na Noda Mataniciva: Kindergarten Curriculum Guidelines for the Fiji Islands* (copyright 2009) explicitly states that it outlines outcomes rather than prescribing learning content. It organises learning through Foundation Areas of Learning and Development (FALD), which inform Classes 1–2 and link to KLAs from Class 3. Therefore its outcomes may be indexed as ECE framework outcomes, but must not be relabelled as detailed content prescriptions. Source: https://www.education.gov.fj/wp-content/uploads/2022/06/Na-Noda-Mataniciva.pdf, foreword pp. iii–iv (PDF lines 73–90).


## Record 31 — CDU Years 6 & 8 Term 3 Teacher Guide (2015)

- **Source:** Ministry of Education, Curriculum Development Unit, *Teachers Guide for Y6 & Y8 Teachers — Term 3*, first edition 2015, https://www.education.gov.fj/wp-content/uploads/2022/07/Y6_Y8_Guideline_2-Teachers_Guide.pdf
- **Source classification:** Official Ministry teacher guide, not accepted as a current controlled prescription. Its introduction says it supports lessons after external examinations; its content tables describe suggested pointers for student achievement and content.
- **Traceable guide references:** PE 6.1.1.1a and PE 6.1.2.2a–d (PDF pp. 3–4); PE 8.1.1.1a–b and PE 8.1.2.2a–d (pp. 4–5); English EN 6.1.1 (p.6); Year 8 literary-text expectations (pp.7–8); Constitutional/Citizenship material (p.10).
- **Status:** Historical/guide-only pending version and prescription crosswalk. Do not activate codes as current indicators.
- **Reuse restriction:** Ministry copyright permits reproduction for classroom purposes only with acknowledgement; other uses require referral to Permanent Secretary through Director Curriculum Advisory Services (PDF p.i). PacEdu adaptation/republication is blocked pending permission.
- **Eligibility:** `BLOCKED_RIGHTS_REVIEW`; crosswalk and teacher review also required.


## Record 32 — Annual Report 2020–2021: Mathematics version-control evidence

The Ministry's 2020–2021 Annual Report, pp.50 and 52, is an official record of curriculum revision, not a prescription. Page 50 identifies the Years 1–8 English/Mathematics package components (NCF, scope-and-sequence overviews, year-level sequences and teacher guides). Page 52 records a Year 11 pilot called “Life Skills Mathematics” and the existing “Applied Mathematics” curriculum. These names must not be treated as interchangeable with later pathway labels without checking approved syllabus versions and effective dates. Source: https://www.education.gov.fj/wp-content/uploads/2024/06/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2020%E2%80%932021.pdf. No indicator wording is activated from this report.


## Record 33 — Policy on Free Educational Resources (2015)

The Ministry-hosted policy was approved 1 December 2015. It defines Ministry free educational resources to include textbooks, teacher guides, workbooks, syllabi and examination materials (p.4); allows students to take textbooks, notes and workbooks home for revision (p.5); and requires Permanent Secretary approval for school reproduction of free resources (p.5). Appendix A lists Mathematics Year 1 and Year 2 Ministry resources (pp.7–8). This is resource-policy evidence, not a prescription or indicator source. It is not blanket PacEdu reuse permission. Source: https://www.education.gov.fj/wp-content/uploads/2022/11/Policy_on_Free_Educational_Resources_FINAL.pdf.


## Record 34 — Na Noda Mataniciva Early Mathematics outcomes

The official Ministry-hosted *Na Noda Mataniciva* identifies Early Mathematics areas on printed p.37: Number; Measurement; Shape and Space; Patterns; Chance and Data. Examples include positional language, shape sorting and naming, pattern construction, shape fitting, and simple puzzles. The page distinguishes approximately age-3 examples, intermediate development, and end-of-Kindergarten expectations. Retain these developmental stages as written; do not convert them into rigid age tests or Year 1–13 prescription indicators. The guideline's stated role is outcomes/framework guidance, not detailed prescribed content. Source: https://www.education.gov.fj/wp-content/uploads/2022/06/Na-Noda-Mataniciva.pdf. Eligibility: `SUPPLEMENTARY_ONLY`; verify reuse rights before adaptation.


## Record 35 — 2016 Mathematics textbook inventory (Years 1–7 and Year 9)

The Ministry's *Policy on Free Educational Resources* Appendices A and B list Mathematics Year 1–7 textbooks in the 2016 primary inventory (printed pp.7–12) and a “Form 3 Mathematics Textbook” under Year 9 in the 2016 secondary inventory (p.14). This is official resource-inventory evidence only: it does not state achievement indicators or establish current syllabus status. Retrieve the actual books/guides, edition details and pages, then compare against current approved prescriptions. The policy says school reproduction requires Permanent Secretary approval for teaching and learning (p.5); this is not blanket PacEdu reuse permission. Source: https://www.education.gov.fj/wp-content/uploads/2022/11/Policy_on_Free_Educational_Resources_FINAL.pdf.
