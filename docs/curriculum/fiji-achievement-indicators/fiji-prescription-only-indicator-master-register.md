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
