# PacEdu priority: student daily worksheets before the Global Learning Library

**Decision:** Student worksheets are the first delivery priority. The Global Learning Library remains a separate, isolated follow-on project and must not delay the core daily learning and assessment workflow.

**Current branch:** `pacedu/simple-subject-workspace-staging-20261111`  
**Current PR:** #363 — staging only, draft and unmerged.

## 1. Existing worksheet capability verified in staging

The current code already has important foundations:

- `paceduDownloadableClassPacks.js` builds term packs for a selected class, subject and ability pathway. It uses 45 planned slots for Terms 1 and 2 and 25 for Term 3, and reports missing slots instead of claiming unavailable content exists.
- `paceduSeparateDailyResourceDownloads.js` separates daily student activity files from teacher lesson plans, notes, answer guides and teaching aids.
- The daily student download is generated for a selected class, subject, term, week, day and Copper/Bronze/Silver/Gold pathway.
- The student copy does not currently include the answer key. Teacher answers are generated through a separate teacher answer-guide download.
- The generator preserves a shared objective across ability pathways and labels curriculum mapping as pending review.
- Unsupported subject banks are blocked rather than silently replaced with English or another subject.

These are foundations, not proof that every class/subject/day has complete, verified or approved content.

## 2. Gaps to close before calling student worksheets ready

The current student-download renderer needs a focused review and improvement before broad release:

1. **MCQ layout:** where an item is multiple choice, print exactly four options labelled A, B, C and D. Validate the content record first; do not duplicate, invent or silently pad missing distractors. If it does not have four valid options, hold the item for teacher correction or render it as a non-MCQ response only when the approved question type supports that.
2. **Student identity and task linkage:** in-app assignment and submission records must bind to the authenticated learner, school, class, subject, term, week, day, activity and stable question IDs. A printed worksheet must provide a clear learner-name and date field. Do not put FEMIS numbers, account IDs or other private identifiers in filenames or public URLs. Do not claim FEMIS verification until an authorised school process confirms it.
3. **Separate copies:** learner copies contain instructions, questions and answer space only. Teacher-only answer keys, rubrics, exemplar responses and marking notes stay in the authorised teacher view/download.
4. **Answer space:** include enough space for the response type: writing lines, working/calculation area, drawing/diagram area, matching columns, practical observation table or oral/sign/point/draw evidence record.
5. **Same learning objective:** Copper, Bronze, Silver and Gold work on the same approved class/term/week/day objective. Adjust modelling, prompts, task quantity, scaffolding and extension only; never change the sequence or teach an unrelated concept.
6. **Audio and accessible interaction:** every learner-facing reading and instruction should have a usable listen control in the app, with visible text/transcript. Offer large print, screen-reader-compatible structure, keyboard access, captions/transcripts, tactile/concrete and oral/sign/point/draw alternatives where appropriate. Do not claim audio is embedded in an offline HTML download unless it actually is.
7. **Voice answers:** voice response/write-in is available only when an authorised teacher has enabled it for that learner and task. Keep text/manual response available. Do not silently record or store voice. Clearly show recording state and provide stop/cancel controls.
8. **Progress and resume:** save the current question and response safely. Resume the exact learner, activity and question after interruption. Current local draft recovery is device-local only; do not claim cross-device/cloud recovery until trusted synchronisation is implemented and tested.
9. **Marking:** pre-reviewed objective answer keys may support deterministic marking. Open-ended, oral, practical, creative, image and uncertain responses remain pending teacher review. Never claim AI has correctly marked a response that needs human judgement.
10. **Feedback and next question:** after a response is saved, show clear confirmation and move to the next question in sequence. If saving fails or connection is lost, retain a recoverable draft and do not skip or duplicate the question.
11. **Teacher approval:** no learner activity is released until the responsible teacher approves the exact class, subject, term, week, day, objective, question set and answer key/rubric.
12. **School calendar:** actual dates come from the school's configured calendar and timetable. If absent, show that setup is required; never invent dates.

## 2A. First focused worksheet fix completed in staging

The separate daily student worksheet and five-day classwork-book renderer now formats any multiple-choice option list as A, B, C and D. It refuses a question with anything other than four non-empty options and reports that teacher correction is required. Non-MCQ questions remain unchanged. A focused automated test file covers these cases. This is a narrow rendering safeguard; it does not yet prove that every content-bank question, class, subject or day is complete or teacher-approved.

## 3. Required worksheet layout

Each daily worksheet should be short, clear and mobile-first, with a print-friendly version:

- PacEdu heading and worksheet title.
- School, country, class/form, subject and school-approved date (or term/week/day when calendar is not set).
- Learner name field on paper; verified learner/task linkage in the authenticated app.
- Ability pathway label shown only where appropriate and never used as a permanent child label.
- One clear learning objective and short teacher-approved note/example.
- Reading passage or visual/practical prompt, if required.
- Numbered questions with exactly A/B/C/D for each MCQ.
- Suitable response area for every question.
- Audio/listen control for supported in-app text, with transcript.
- Accessible response instructions and approved accommodations.
- Submission status, saved/resume status and teacher feedback area.
- Curriculum/source status. Pending mapping must not be described as official alignment.

## 4. Priority implementation sequence

### Priority 1 — content and answer-key integrity
- Validate every worksheet record against class, subject, term, week, day, objective and question IDs.
- Validate MCQ option count and answer-key references.
- Detect missing, duplicate, out-of-sequence and unsupported records.
- Keep incomplete or unreviewed items out of learner release.

### Priority 2 — separate learner worksheet and teacher marking guide
- Finish the student-only print/download format.
- Ensure no answers, marking hints or teacher-only notes leak into student copies.
- Keep teacher answer guide and rubric in the teacher-authorised area.
- Include correct answer space and learner identity fields without exposing private IDs.

### Priority 3 — attempt, save, submit and resume
- Make each question independently saveable.
- Prevent question skipping after failed save.
- Resume the exact question and response after refresh, accidental close and disconnection.
- Label device-local versus server-synchronised recovery accurately.

### Priority 4 — accessible ways to answer
- Visible text plus optional read-aloud for each reading/instruction.
- Teacher-authorised voice input only, plus text, sign, pointing, drawing, tactile and practical evidence as relevant.
- Ensure audio can be stopped and does not auto-play over another page or activity.

### Priority 5 — marking, feedback and progress
- Use approved answer keys for objective questions.
- Route subjective and uncertain evidence to teacher review.
- Generate daily learner skill evidence and teacher comments only from recorded responses and review outcomes.
- Use repeated evidence and teacher judgement for Copper/Bronze/Silver/Gold pathway adjustments; never one mark alone.

### Priority 6 — curriculum coverage
- Verify the exact Fiji syllabus and achievement indicators for each class/subject/term/week/day before official-alignment claims.
- Preserve the 9/9/5 planning configuration only where it matches the school's calendar.
- Keep unsupported subjects unavailable with a clear explanation; do not substitute another subject.
- Keep ECE developmentally appropriate and observation/play based.

### Priority 7 — Global Learning Library
Only after the student worksheet acceptance gates below are met should the isolated library prototype be considered for runtime integration. Library recommendations may support daily learning but must never replace or block required school worksheets.

## 5. Acceptance gates for worksheet-first release

A representative Android test must pass all of these before learner-facing release:

- Student receives the correct approved worksheet for their own learner, school, class, subject, term, week and day.
- Student copy contains no answer key, teacher-only marking notes or another learner's personal information.
- Every MCQ has exactly four valid A/B/C/D choices; invalid records are held for correction.
- Copper/Bronze/Silver/Gold share the same approved objective and differ only in permitted support/challenge.
- Student can complete using supported text/manual methods and approved accessible alternatives.
- Listen controls have readable text/transcripts and can be stopped.
- Voice answer controls are hidden or disabled unless trusted teacher authorization is confirmed.
- Save, failed-save recovery, resume, retry and next-question sequencing work on Android.
- Objective marking uses the reviewed key; subjective/practical/uncertain work reaches teacher review.
- Teacher approval and review audit are visible and attributable to an authorised account.
- Offline/low-connectivity behaviour is explicit; no false claim of cloud synchronisation.
- All existing feature-preservation, voice, security, browser and Android checks pass on the candidate commit.

## 6. Explicit non-goals for this phase

- Do not merge or deploy this staging PR.
- Do not alter production Firebase rules, records, registrations or payment settings.
- Do not activate a paywall or collect child payments.
- Do not generate or claim official Fiji achievement indicators without verified source evidence and authorised review.
- Do not connect the Global Library to the live app yet.
- Do not weaken teacher approval, privacy, learner identity or accessibility safeguards to make a worksheet appear available.

**Release principle:** A smaller set of correct, approved and accessible daily worksheets is better than a large bank of unverified or incorrectly assigned worksheets.
