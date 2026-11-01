# PacEdu mandatory automatic curriculum and dated lesson preparation

**Requirement status:** Mandatory product requirement for the curriculum workspace. This specification is part of the PR #319 proposal and is not live until merged, deployed and validated.

## Mandatory behaviour

PacEdu, not the teacher, prepares the curriculum lesson package from the currently approved Ministry of Education curriculum prescription and verified class/subject outcomes. The teacher must not be required to populate blank curriculum-planning fields manually.

For every school-confirmed subject box and class/level, PacEdu must prepare:

1. Topic and exact learning outcome/objective.
2. Teaching and learning materials, examples and locally relevant resources.
3. Short, ordered teacher instructions and demonstration steps.
4. Student instructions, activities and worksheets.
5. Assessment method, questions/tasks, evidence criteria and marking guide.
6. Differentiated pathways, accessibility alternatives and next-step/reteaching tasks.
7. Retrieval practice, revision activities and appropriately labelled practice examinations.

The teacher's role is to review/approve the prepared lesson, teach it, record evidence and make professional decisions. The student view shows only the approved learning activity and simple step-by-step instructions; teacher planning notes, answer keys and unreleased assessments remain teacher-only.

## Mandatory date fields

Every generated lesson and assessment must carry:

- country and school;
- school year;
- curriculum/framework name and version;
- official source publication/approval date where published;
- official commencement/effective date where applicable;
- source verification and reviewer date;
- term number, week number and learning day;
- actual lesson date from the school's approved calendar;
- timetable/subject slot where supplied;
- generated-at timestamp and content version;
- teacher review/approval date and student release date.

Dates must be real, traceable dates. PacEdu must never invent a school day, holiday, term boundary, examination date, framework approval date or effective date. If the school calendar or timetable is missing, show a teacher-only setup warning and keep the lesson unscheduled rather than fabricating a date. If an official publication date is not stated, record it as unavailable; do not infer it from a web page's last-modified date.

## Fiji planning defaults

Use the user's configured planning pattern of Term 1 = 9 weeks, Term 2 = 9 weeks and Term 3 = 5 teaching weeks, but calculate actual calendar dates only from the school's approved calendar. These week counts are PacEdu planning defaults and must not be presented as a Ministry-wide calendar unless independently confirmed by an official Ministry notice. Revision and examinations follow the school's dated assessment calendar.

Keep the Fiji 2013 National Curriculum Framework as the working baseline until an authorised replacement is formally in force. Store its version and source evidence. A source-page change or research lead cannot change the active framework. A new framework requires official notice, effective date, verified outcome mapping, reviewed complete content pack, separate reviewer and approver, and activation on/after the official effective date.

## Source and quality controls

- Use exact Ministry outcome wording, identifiers and source page/section where available.
- A generated scaffold with missing official mapping must be labelled `outcome-mapping-pending` and must not claim official curriculum alignment.
- The generator may create a draft structure, but it must not pretend generic placeholders are completed teaching materials, student worksheets, questions or marking guides.
- Student release requires complete, subject-specific content, accessibility checks, answer/marking validation and explicit teacher approval.
- Practice assessments must be labelled as PacEdu practice unless official status and reuse permission are confirmed.
- Keep all daily work, revision, assessment and feedback inside the relevant subject box and chronological class sequence.
- The nine subject boxes remain English, Mathematics, Phonics, Science, Social Science, Health, Agriculture, Arts and Technology, subject to the school's officially confirmed programme for each level.
- Keep ECE play-based and observation-led; use ECE as the level label. Forms 3–7 use their own selected subjects and current syllabuses, not copied primary content.

## Acceptance tests before calling this complete

1. A valid school calendar produces dated lessons with school year, term, week, day and actual date.
2. Missing or malformed calendar dates stop scheduling; no fallback dates are generated.
3. Framework source/version and publication/effective/review dates are retained without inventing unavailable dates.
4. Every generated lesson includes topic, objective, materials, teacher instructions, student task, assessment method and marking criteria, or is explicitly held as an incomplete draft.
5. Student-facing output excludes teacher-only notes, answer keys and unreleased assessment content.
6. No lesson is marked officially aligned without a verified official outcome and source reference.
7. No pack is student-ready until all required content is complete and reviewed/approved.
8. All dates are consistent with the approved school calendar and timetable; term/week/day order is validated.
9. Existing protected voice/navigation, learner records, Firebase, payment and Android build paths remain unchanged by this curriculum requirement.

**Honest implementation note:** PR #319 currently provides framework monitoring, draft generation scaffolds and dated framework-release activation. This requirement adds the mandatory content and school-calendar contract; it must not be represented as fully implemented until the generator, lesson schema, UI and automated tests satisfy the acceptance tests above.
