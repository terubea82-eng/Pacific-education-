# PacEdu Day 1 Prior-Knowledge Check

**Status:** implementation specification for PR #306; not yet merged or active in the deployed app.

## Purpose

On the first teaching day, establish a quick, low-stakes baseline of what each learner remembers from prerequisite learning. Use this to choose a sensible starting point for teaching, not to rank, label permanently, or select students.

Fiji's assessment policy calls for a comprehensive range of formative and summative evidence over time, equitable and developmentally appropriate assessment, and use of assessment information to improve learning. It specifically states that assessment methods in Preschool–Class 2 and primary Classes 3–8 and Forms 3–4 should support learning and development rather than selection and ranking. A five-minute check is therefore only an initial diagnostic snapshot, not a complete judgement of ability.

## Day 1 flow

1. **Teacher opens the class and subject box.** PacEdu selects the learner's registered class, the school's enabled subject, the previous class's prerequisite outcomes and the school's current curriculum version. It must not invent a subject, outcome, date or school timetable.
2. **Give a short check (about five minutes per subject).** Use a small set of prerequisite tasks. Mix item types only when suitable: multiple choice, matching, short response, a small calculation, reading, picture selection or an oral/practical prompt. Keep the instructions simple and age-appropriate.
3. **Special handling for ECE / first-time learners.** Use observation, pictures, oral prompts, matching, counting objects and practical play. Do not assume a formal previous-class worksheet or penalise a child for not having attended formal schooling.
4. **Teacher captures and confirms.** The teacher captures the completed paper or records an oral/practical response, confirms the learner's internal ID and subject, and checks that the image is readable. Never put a student's FEMIS ID in a public filename or URL.
5. **PacEdu marks against the approved rubric.** Objective answers may be machine-scored after image-quality and recognition checks. Handwriting, unclear marks, oral-language nuances and open-ended answers with low confidence are sent to the teacher for confirmation; PacEdu must not silently guess.
6. **Show evidence and a provisional subject profile.** Present the score by prerequisite outcome/skill, correct and incorrect responses, confidence/uncertain items, and suggested next steps. The teacher can confirm or flag a reassessment.
7. **Assign a provisional subject-specific group.** Once the teacher approves the evidence, use it to recommend a starting activity pathway for that subject only. Keep the initial placement revisable and explain which observed skills led to the recommendation.

## Suggested timing

- 30 seconds: learner identification and instructions
- 3 minutes 30 seconds: short prerequisite items/tasks
- 1 minute: review/submit or teacher observation record

Five minutes is a target, not a reason to rush a learner who needs an accommodation, accessible format, language support, additional time or practical/oral response. Such accommodations must be recorded, and the result should remain comparable only where the task and support make that comparison fair.

## Ability pathways per subject

Use these as supportive instructional pathways, not fixed labels:

- **Supported Start** — needs modelling, foundational revision or guided practice on key prerequisite skills.
- **Developing** — demonstrates some prerequisite knowledge but has specific gaps; needs examples and scaffolded practice.
- **Working at Class Goal** — demonstrates the selected prerequisite outcomes well enough to begin the planned class-level learning.
- **Extension** — shows secure prerequisite understanding and is ready for deeper reasoning or transfer tasks.

Do not assign a group solely from one overall percentage or compare students against one another. Use the item-level evidence, outcome importance, task difficulty, confidence and teacher review. If evidence is insufficient or the image cannot be read, show **Not enough evidence yet** and request another short check rather than forcing a group.

## One child, multiple subject profiles

A learner may be Extension in Mathematics, Developing in English and Supported Start in Science. PacEdu must store and display separate profiles for each configured subject and class level. An optional overall summary may describe strengths and support needs, but must never collapse these into one permanent “ability” label.

## How the profile improves over time

- Day 1: provisional prior-knowledge baseline for each subject.
- Daily activities: gather evidence about the specific learning outcomes taught that day.
- Weekly checkpoints and teacher-approved work: update outcome-level mastery estimates and recommended pathway.
- Term assessments/examinations: add broader evidence against the approved assessment blueprint and marking rubric.
- Reassessment: allow a learner to move between pathways as evidence changes. Never treat an earlier group as permanent or use a low-confidence camera mark as conclusive.

Keep the original Day 1 record for progress comparison; append later evidence rather than overwriting the baseline. Record framework version, class, subject, outcome IDs, rubric version, assessment date, score, confidence, accommodations, teacher review status and the reason for any pathway recommendation.

## Student release and teacher control

- The teacher reviews and approves the Day 1 result and proposed starting pathway before it is used to release differentiated student activities.
- PacEdu may automate marking of reliable objective items and calculations, but the teacher remains responsible for confirming uncertain or subjective evidence.
- Teachers should not need to hand-build every next activity: after approval, PacEdu can recommend the next version-matched activity from the learner's current subject profile.
- Give the learner supportive feedback about what to practise, not a public rank or discouraging label.
- Protect student records with role-based access, minimal displayed identifiers and an audit trail.

## Curriculum and safety requirements

- Generate checks only from official, versioned prerequisite outcomes and school-approved subject configuration.
- If the official outcome/source mapping is not verified, label the check **draft enrichment — outcome mapping pending** and do not represent it as an official curriculum-aligned assessment.
- Never mix curriculum outcomes across countries or framework versions.
- The check is diagnostic and low stakes; it is not a national examination, a substitute for teacher judgement, or sufficient by itself to establish a learner's full ability.
- If camera capture or network access fails, allow the teacher to enter the result manually and synchronise safely later.

## Acceptance tests

1. A new Class/Year 1 learner is offered a suitable prior-learning check without assuming every child completed ECE.
2. A subject has its own check, result, ability pathway and history.
3. A learner can have different pathways in different subjects.
4. Unreadable image, uncertain OCR or missing rubric results in teacher review / insufficient evidence, not guessed marks.
5. A teacher approval is required before the result drives the student's differentiated activity release.
6. Later evidence can change the pathway while preserving the Day 1 baseline and audit history.
7. No single percentage cutoff or peer ranking determines a permanent group.
8. Missing official outcome mapping or country/framework mismatch prevents a claim of official alignment.
9. Accessibility accommodations and oral/practical alternatives are supported.
10. No student's FEMIS ID appears in public URLs or filenames.

## Reference basis

- Fiji Ministry of Education, *Policy in National Curriculum Assessment and Reporting*: https://www.education.gov.fj/wp-content/uploads/2022/11/POLICY-IN-NATIONAL-CURRICULUM-ASSESSMENT-AND-REPORTING.pdf
- Fiji Ministry of Education, *A Teacher's Guide to Disability-Inclusive Education in Fiji*, section on assessment for/as/of learning: https://www.education.gov.fj/wp-content/uploads/2024/09/SIE-guide-high-res-web-version-1.pdf
- Higher Education Commission, Fiji school education overview: https://nic.hec.org.fj/school-education
