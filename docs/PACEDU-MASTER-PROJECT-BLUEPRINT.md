# PacEdu Master Project Blueprint
**Pacific Education (PacEdu) — consolidated product requirements and implementation record**  
**Last consolidated:** 5 November 2026  
**Repository:** https://github.com/terubea82-eng/Pacific-education-

This document brings together the user's agreed PacEdu requirements across business advertising, entry journey, registration, workspaces, teaching and learning, accessibility, curriculum, safeguarding, technical architecture and pilot planning. It is the central product reference for future development. It does not certify that every listed feature is implemented.

## 1. Product purpose and boundaries

PacEdu is an owner-controlled education and opportunity platform for learners, teachers, families, schools, education communities and separately registered business advertisers. The education experience must remain education-first. Business advertising and commercial checkout must be separated from teaching, student records, marks and assessment.

Core principles:
- Simple, predictable, accessible screens, especially for DeafBlind learners and Class 1 users.
- A linear journey with clear Next and Back actions; no confusing menu-driven main journey.
- Text is always available. Speech is optional and can be stopped or muted.
- Preserve the existing working pilot; make small, tested changes rather than broad rewrites.
- Clearly distinguish prototype demonstrations, verified functionality and production-ready services.
- Never invent curriculum content, official approval, partner relationships, payment capability or verification.

## 2. Main entry journey

The agreed user-facing journey is:

1. **Page 1 — Global Business Advertising:** business advertisements, one business registration form, product video submission/preview, country markets, language choices and English translations, proposed PacEdu advertising packages, and approved business catalogue links.
2. **Page 2 — Welcome:** PacEdu introduction, country, country calling code, preferred language, language guidance and short user rules.
3. **Page 3 — Workspaces:** clear entry to Student Workspace, Teacher Workspace and Parent/Family access, with concise rules and conditions.
4. **Education user registration:** one mandatory registration box for all education user types, with role selection and role-appropriate details.
5. **Workspace and learning flow:** continue to the correct workspace, classes, subjects, daily learning and assessment.

Keep Page 1 business registration separate from education-user registration. A business advertiser must not need an education-user account merely to submit an advert. Do not create duplicate registration forms for the same account type.

### Navigation and refresh
- Next and Back controls must work on every relevant page and have accessible labels.
- Provide a visible refresh action where requested, but do not create endless reload loops.
- On opening, refresh only in a controlled, one-time way and preserve offline fallback.
- If a page is slow or fails, show a useful recovery message and a working route back; never leave a blank page.
- Resume the user's safe progress after accidental closure where technically supported.
- Test navigation, refresh, browser history, service-worker cache and offline behaviour on the actual Android device.

## 3. Page 1 — Business advertising and registration

### One business registration box
Use one clearly labelled **Business Registration** box/form. All business details, advertising package selection, country/market, language choices and advertisement submission belong within this one business registration flow. Do not require a separate registration for each language or product.

The form should collect, as applicable:
- Legal/business or seller name and contact person.
- Business category, country/target market and town/service area.
- Business contact email and official website.
- Product/service description and product catalogue link.
- Customer checkout/payment link (separate from PacEdu advertising fees).
- Product video (MP4/WebM, size limit shown clearly) and original advertisement text.
- Selected language versions and complete English interpretation.
- Advertising package and monthly/annual billing preference.

### Country and language respect
- Offer a country/market selector covering the intended international markets.
- Let the advertiser choose all languages in which the advert is to appear, using a multi-select language control and an “Other — specify” field.
- Preserve the original language, script and meaning. Do not replace the original with English.
- Respect the target country's, region's and community's language identity.
- Ask the advertiser to identify applicable local or legally required language versions. Do not falsely claim that every official language is legally mandatory for every advertisement; requirements depend on jurisdiction, product and advert type.
- **Mandatory PacEdu publication rule:** every advert must have a complete English translation/interpretation, alongside the original and other selected language versions, so international users can understand it.
- The English version must cover product details, prices, conditions, warnings, claims and calls to action. It must not omit material terms.
- Machine translation must be labelled and must not be treated as certified. Require competent human review where meaning, safety, health claims, pricing or legal conditions matter.
- Translation collection is not the same as automatic translation. Do not claim automatic interpretation or verified translation until an appropriate translation service and human-review workflow are implemented and tested.

### Product advertisements and catalogues
- Businesses may submit product/service adverts and videos for review.
- Use only fictional AI-generated people in PacEdu promotional imagery. Do not use real teachers, students, children or identifiable copied faces as promotional models; do not imply fictional people are actual PacEdu users.
- Distinguish local video preview from upload, public publication or live streaming.
- Display adverts publicly only after business, content, rights and safety review.
- Business catalogue links and customer checkout links are separate from PacEdu advertising fees.
- Show “Verified business” only after the business identity, catalogue ownership and payment destination have actually been checked. A verification label is not a guarantee that a transaction is risk-free.
- Do not invent businesses, products, prices, partners or payment destinations.

### Advertising fees
Proposed prices for owner review, all in USD:
- Starter: US$5/month or US$50/year.
- Growth: US$15/month or US$150/year.
- Professional: US$39/month or US$390/year.
- Enterprise: US$99/month or US$990/year.

Annual prices represent ten monthly payments. Proposed optional promotions include 7-day and 30-day featured placements and campaign packages. These remain proposals until owner approval, written terms, tax/renewal/cancellation review and secure payment integration are complete. No payment is to be represented as active unless the payment provider and server-side verification have been implemented and tested.

## 4. Page 2 — Welcome, country and language

Page 2 should provide:
- A concise PacEdu welcome and purpose statement.
- Country selection and the correct international calling code.
- Preferred interface language selection.
- A clear statement that language choices respect local identity and that English interpretation is available for international understanding.
- Short, readable rules and an accessible Next action.

Country/language lists must be reviewed for completeness and accuracy. Do not label an incomplete list as every country's full set of mandated languages. Local legal language requirements must be checked against current authoritative sources before legal claims are made.

## 5. Page 3 — Workspaces

Each role must have its own clearly separated workspace, with personal data and actions scoped to the signed-in and authorized account. The Teacher Workspace is a personal professional workspace: it contains the teacher profile, assigned classes, subject boxes, daily teaching, planning, worksheets, marking and learner progress. Teachers select a subject box and then a class; resources must match both. The Student Workspace contains the learner's own class, subjects, daily activities, worksheets, practice, assessment and progress. The Parent/Family Workspace contains only the approved learner information the parent is authorized to see. A visual screen or browser-side role selection is not a security boundary; account-specific data requires server-side authorization.

Provide simple, distinct entry points:
- **Student Workspace:** the learner's assigned class and approved subject boxes, daily activities, worksheets, learning progress and assessments.
- **Teacher Workspace:** the teacher's personal professional workspace, assigned classes and subject boxes. Each subject box opens the matching class, daily activities, lesson/workplan, worksheets, marking guidance and approved teacher resources.
- **Education Officer / Ministry Workspace:** authorized education subject boxes and class/term curriculum views, plus curriculum evidence and coverage oversight. This is not access to a teacher's private profile, personal notes or unrelated learner records.
- **Parent/Family access:** approved learner progress and communications only; no entry to the education subject boxes.
- **All other roles:** no access to English, Mathematics, Phonics or other teaching/learning subject boxes unless a separately approved role is explicitly added to this access policy.

**Education subject-area access policy:** only authenticated Students (including Blind and Deaf Learner student pathways), Teachers and approved Education Officers/Ministry accounts may enter the education subject area. Parents/Caregivers, businesses, NGOs, community/partner users, reviewers, technicians and other roles must be denied. The UI role gate is a navigation safeguard only; production access must also be enforced by Firebase/server-side authorization on every read and write.

The main learner journey should not be cluttered with a general App Menu. Keep navigation linear and role-appropriate. Teacher Teaching Workspace should follow Teacher Workspace: teachers resume work, identify assigned classes/subjects, open teaching rooms, teach, assess and print differentiated worksheets.

## 6. Education user registration

Use one mandatory education-user registration box for all education user types. Users select one role and complete the matching fields inside that same box.

Agreed role choices:
1. Student
2. Blind Learner
3. Deaf Learner
4. Teacher
5. School Administrator/Principal
6. Education Officer/Ministry
7. Learning Support Assistant
8. Curriculum/Content Contributor
9. Education Researcher/Auditor
10. Parent/Caregiver
11. Professional Reviewer
12. NGO/Organization
13. Education/Government
14. Community/Partner
15. Technician — restricted access, separate authorisation required
16. Owner/Control — invitation only

Registration should collect only the information needed for the selected role. Student and school identity workflows must support school name and school registration number (including Fiji FEMIS ID where applicable), country, class/level and a unique learner identity. Teacher registration and school/role approval are separate from student registration. Camera use must remain optional.

**Security requirement:** role labels and browser-side selection are not authorization. Technician and Owner/Control privileges must be enforced server-side through verified identities, least-privilege access and explicit owner-controlled approval. Never expose privileged access merely because a user selected a role.

## 7. Curriculum and learning content

### Authoritative source rule
For each country and curriculum, use existing, ready, official syllabus/prescription materials only. For the Fiji pilot, use verified current Fiji Ministry of Education curriculum/syllabus sources and achievement indicators. Exclude unfinished revised curriculum material unless it is officially adopted and verified.

Before writing activities:
1. Identify and record the official source, edition/version and relevant pages.
2. Extract the approved strands/units, concepts, learning outcomes and achievement indicators.
3. Verify the exact class/form and term alignment.
4. Distribute approved content across the school year.
5. Only then create daily lessons, activities and worksheets.

Clearly distinguish official curriculum requirements from PacEdu-created teaching explanations and practice activities. If source evidence is missing or uncertain, label the item PENDING_TEACHER_REVIEW and keep it unpublished/unapproved.

### Fiji year plan
Current agreed structure:
- Term 1: 9 weeks.
- Term 2: 9 weeks.
- Term 3: 5 weeks.
- Five teaching days per week: 45 + 45 + 25 = **115 daily learning days** per year.

Do not revert to the earlier 10-week term plan. Do not invent concepts to fill a schedule.

### Levels and subjects
- Curriculum range: ECE through Form 7.
- Keep the label **ECE**, not Kindergarten.
- Fiji National Curriculum Framework remains the pilot baseline until a new official framework or a different country's curriculum is verified and selected.
- Class 1–6: **Elementary Science**.
- Class 7–Form 4: **Basic Science**.
- Form 3–4 should also include applicable pathways/subjects such as Technology, Agriculture, Home Economics and Commercial Studies.
- The subject boxes should reflect the verified Fiji curriculum, with separate subjects where the curriculum requires them (including Vosa Vakaviti, Urdu, Rotuman, Office Technology, Home Economics, Commercial Studies, Computer Studies and Financial Education where applicable). Do not collapse distinct subjects into one generic science box.

### English programme and differentiated pathways
- Build English from ECE through Form 7.
- Use four ability groups: **Gold, Silver, Bronze and Copper**.
- PacEdu assigns the initial group after the Day 1 activity; teachers do not manually assign the initial group.
- All groups work on the same approved class/term/week/day objective. Differentiate support, scaffolding and challenge only; do not introduce out-of-sequence concepts.
- Copper, Bronze and Silver receive appropriate pathways toward the Gold objective.
- Verify and attach corrected concepts before daily lessons are generated.
- Maintain a source and verification record for every level.

## 8. Daily teaching, worksheets and assessment

- Teacher Workspace STEP 2 of 3 should place classes and daily activities inside subject boxes. Selecting a subject opens the teacher's assigned classes; selecting a class opens that subject/class's daily activities, lesson plan/workplan, worksheets, marking guidance and matching approved teaching resources together. Keep the teacher work-plan nearby; place each worksheet in the matching subject box for the same day and class.
- Student and authorized Education Officer views use the same subject/class/curriculum alignment, but expose only the records and actions appropriate to their role. A student sees their own assigned learning; an Education Officer sees approved curriculum and coverage material, not a teacher's private workspace.
- Student worksheets must be real, printable and downloadable—not merely descriptive placeholders.
- Each worksheet must match the exact approved concept and achievement indicator for the learner's class, term, week and day.
- Link worksheets and progress to the registered learner identity, school, class and country, subject to privacy and safeguarding approval.
- Every multiple-choice question must have exactly four options: A, B, C and D.
- Include short notes and examples, reading passages with questions based only on the supplied passage, grammar notes, matching, fill-in tasks, synonyms/antonyms, word building, spelling, short and extended writing, paragraph/letter/composition spaces and drawing space where appropriate.
- Provide accessible alternatives for blind/low-vision learners, Deaf learners, learners with additional needs and low-literacy users.
- Include teacher instructions, marking criteria, answer guidance and a daily marking workflow.
- Provide class test rankings from highest to lowest only with appropriate privacy, school policy and safeguarding controls; do not expose one learner's private results to other families.
- Teacher approval is required before student activities are released where the workflow calls for review.
- Teacher answer entry is an accepted fast fallback. Audio answers may be supported, but uncertain speech recognition must be flagged for teacher review, not silently treated as correct.

## 9. Teaching-aid library

For every subject and level, provide activity-linked teaching aids:
- Cards, charts, diagrams and worked examples.
- Printable/downloadable resources.
- Teacher instructions and lesson-use guidance.
- Accessible versions and alternatives.
- A direct link from each aid to the exact activity, class, subject and objective.

A proposed design for this library has been approved by the user as a requirement; approval of the design does not mean it has already been implemented.

## 10. Accessibility, voice and device experience

- Text must remain visible; speech is optional.
- Provide short, page-specific spoken instructions on each relevant page.
- Use one consistent narrator voice; Fiji English is preferred if available. If unavailable, state the selected voice clearly rather than pretending a Fiji voice exists.
- Provide Stop Speech/mute controls and support spoken “next” and “back” where reliable.
- Provide large, clear, high-contrast controls, simple labels and predictable focus order.
- Do not depend on colour alone.
- Camera is optional.
- Keep the screen awake while the app is actively in use where the platform permits, with an appropriate user control.
- Resume safely after accidental closure where technically supported.
- Voice and speech recognition failures must not block manual navigation or teacher answer entry.

## 11. Communications and mail box

Provide a PacEdu Mail Box separate from the user's personal email. Intended functions:
- Pilot messages and authorized communications.
- In-app notices and feedback.
- Refresh/reload of mailbox content.
- Clear sender identity and message status.
- Privacy, access and retention controls.

Do not claim email delivery or secure messaging until a backend service, authentication and message authorization are implemented.

## 12. Technical architecture, security and offline operation

Known pilot context:
- GitHub repository: terubea82-eng/Pacific-education-.
- Firebase project: pacedu-fe868; Firestore region: asia-southeast1; Email/Password authentication was enabled in the previously checked project.
- Android package: fj.pacificeducation.app; pilot version previously identified as 1.0.1-pilot.
- Existing GitHub Pages and Android pilot workflows are prototypes, not production infrastructure.

Required production architecture:
- Secure authentication and server-side role authorization.
- Server-side data validation and access rules; never rely on sessionStorage/localStorage for security.
- Proper database rules, audit records, backup/recovery and data minimisation.
- Secure storage and moderation for uploaded advert videos and learning resources.
- Verified payment provider, signed server-side payment webhooks, subscription state and refund/cancellation handling.
- Privacy and child-safeguarding controls, parental permissions where required, retention/deletion rules and incident response.
- Offline-first learning support with safe synchronization, retry/idempotency, conflict handling and clear sync status.
- No real child sensitive data in the prototype pilot.
- Keep Owner/Control access separate and tightly protected.
- Preserve existing working Android APK and do not replace it with an untested build.

## 13. Pilot and business timeline

Agreed planning target:
- November 2026: free controlled school pilot.
- December 1, 2026: close the initial one-month pilot unless the owner explicitly approves an extension.
- December 2026: review feedback and improve for 2–3 weeks.
- January 1, 2027: target for payment-readiness planning only.

This schedule does not itself authorize paid operation or production release. Payment collection remains disabled until all required checks and owner approvals are complete.

## 14. Implementation status snapshot — 5 November 2026

### Confirmed in repository by inspection
- Page 1 business advertising page exists.
- Business advert form exists with a single form element.
- Business form includes country/target-market fields, selected-language input, original-language advert, English interpretation field, video preview, package selection and catalogue/payment-link fields.
- The latest business page update adds one mandatory business registration box, a multiple-language selector, additional language-version field and a mandatory English translation field.
- Main src/index.html contains welcome, registration, learning platform, daily lesson, assessment, teacher dashboard, parent dashboard and other education sections.
- The main registration box contains the 16 user role choices.
- Service worker currently identifies cache version pacific-education-shell-v38.

### Not verified as complete/live
- The entire Page 1 → Page 2 → Page 3 → registration → workspace journey on the physical Android device.
- Automatic translation, professional translation review or a multilingual translation engine.
- Live public business advert publication, catalogue backend, verified business directory or real-time livestream.
- Secure advertiser registration and persistent server-side education accounts.
- Payment collection, subscriptions or paid promotion.
- Server-enforced Owner/Technician permissions.
- Full official curriculum verification and complete 115-day lesson/worksheet production for every subject and level.
- Fully connected teacher/student workflows, mailbox delivery and secure student records.
- Independent security, privacy, safeguarding, accessibility and production approval.

The business form's draft storage and the education registration prototype must not be described as secure permanent account systems unless the backend has been implemented and tested.

## 15. Development order and release gates

Work in small, reviewable stages:

1. **Protect the pilot:** preserve the working build; inspect current main branch and open pull requests before modifying overlapping files.
2. **Entry journey:** connect and test Page 1, Page 2, Page 3, education registration and role-appropriate workspaces; fix Next/Back/refresh and blank-page recovery.
3. **Registration and identity:** consolidate fields, validate country/language choices and implement secure server-side role controls.
4. **Accessibility:** verify text/speech controls, focus order, DeafBlind and Class 1 flows on real Android devices.
5. **Curriculum evidence:** source and verify official outcomes/concepts/indicators before producing activities.
6. **Learning content:** produce the 115-day plan, daily lessons, differentiated worksheets and marking criteria in the approved sequence.
7. **Teacher tools and teaching-aid library:** connect resources to exact activities and verify printing/downloads.
8. **Business review and publishing:** build secure uploads, review queues, translation checks and approved catalogue display.
9. **Mailbox and offline sync:** implement secure messaging, sync and recovery.
10. **Independent gates:** privacy, safeguarding, legal, cybersecurity, accessibility, payment and production review.

Do not mark a stage complete because its screen or button exists. Completion requires working end-to-end behaviour and recorded evidence. Do not merge unrelated changes or remove working functionality to make the project appear simpler.

---
**Owner's product direction:** PacEdu should feel like one coherent, accessible education platform with a separate business advertising entrance, not a collection of disconnected pages. This blueprint is the shared reference for that direction.
