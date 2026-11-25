# PacEdu global onboarding and accessible user journeys

**Status:** staging UX specification; not a production approval  
**Priority:** simple, accessible, curriculum-first; learner worksheets before the separate global library.

## 1. One short setup journey

Show only the next required step. Use a single-column layout, plain language, large touch targets, visible text, optional audio narration, Stop Speech, and clear Back/Next controls. Do not rely on colour, sound, icons or gestures alone.

1. **Choose country or jurisdiction.** Searchable list, clear country name, optional local language preview. Do not infer the legal jurisdiction solely from device location.
2. **Choose school or institution.** Search verified institutions or choose “Independent learner” where permitted. Unverified institutions remain pending and cannot claim school approval.
3. **Choose role.** Learner, parent/guardian, teacher, school administrator or authorised education officer. Require the correct invitation/verification for privileged roles.
4. **Choose level and subject.** Display only levels and subjects supported by that jurisdiction's approved profile. Never silently map a foreign grade to Fiji Class/Form.
5. **Show curriculum source status.** Name the controlling authority and prescription edition. If the source or legal profile is pending, explain that learner daily activities are not yet available for that subject.
6. **Privacy and permission.** Show the relevant age-appropriate notice and obtain guardian/institution permission where required. Separate necessary service terms from optional audio, analytics or other consents.
7. **Accessibility preferences.** Offer text size, contrast, language, audio on/off, captions/transcript and response methods. Ask only what is needed; do not ask for a diagnosis.
8. **Finish and resume.** Show a simple confirmation and a single “Continue learning” route. Save progress securely and resume at the last confirmed step after disconnection.

## 2. Learner workspace

- Open directly to the learner's approved subject boxes; no crowded dashboard or unrelated menus.
- Each subject shows the next approved daily activity, source-linked concept/indicator, completion state and teacher feedback.
- If the curriculum gate is blocked, show a calm message: “Your teacher is preparing this subject's approved learning activities.” Do not show placeholder questions, unrelated subject content or an AI-invented substitute.
- Keep the learner's task screen focused: instructions, reading/material, one question at a time, response area, audio/accessibility controls, Save and Next.
- Accept the response methods authorised for that learner: typing, drawing/upload, paper evidence, oral response or teacher-approved assistive method.
- Do not advance automatically before a response is saved. Offer “Check answer” or “Next question” clearly; preserve the learner's place offline and after accidental closure.
- Show progress as learning evidence, not public rankings. Explain when a response is automatically checked and when teacher review is pending.

## 3. Parent and guardian workspace

- Show only linked children and the minimum necessary learning progress.
- Provide clear consent, permission history, notices, communication preferences and a way to request correction or deletion.
- Never expose other learners or teacher-only answer keys.
- Make school contact routes visible without opening unrestricted private messaging.

## 4. Teacher workspace

- Start with selected class, subject and today's approved activity.
- Separate student worksheet from teacher plan/answer guide; never show teacher-only answers in the learner view.
- Show the official source, edition, page/section, concept/indicator, review status and any interim-old-source warning.
- Let teachers preview and approve before assigning. Show a clear reason when an activity is blocked.
- Allow teacher-authorised response accommodations, save/resume, printable copies and review of voice/text/paper submissions.
- Keep the mandatory single narrator/navigation controller; page-level audio buttons are optional additions, not competing automatic narrators.

## 5. School administrator and education authority

- Provide institution verification, staff invitations, class/subject setup, calendar, permissions and policy acknowledgement.
- Show only authorised aggregate usage and billing data unless a specific role has a lawful need for identifiable records.
- Keep curriculum and payment approvals separate: a school cannot override a national prescription or legal restriction merely by selecting a setting.
- Provide exportable audit reports for approvals, changes, incidents and user-rights requests.

## 6. Low-bandwidth and offline behaviour

- Make the core learner interface usable on a low-cost Android phone and unstable mobile data.
- Cache only authorised learning materials; do not cache another learner's records on a shared device.
- Save responses locally with clear “Saved on this device / Waiting to sync / Synced” status.
- Encrypt local sensitive data where technically supported; expire or clear a session on logout/shared-device mode.
- On reconnect, sync idempotently, preserve the last confirmed answer and show conflicts for teacher resolution rather than silently overwriting work.
- Never report a save or upload as complete until the device or server confirms it.

## 7. Release and usability tests

Test the entire journey with learners, guardians, teachers and users of screen readers, magnification, switch access and voice input. Include low-bandwidth Android devices and shared-device scenarios. Test that:

- no unverified curriculum content can be opened by direct URL, old bookmark, offline cache, download, API or alternate role;
- consent and role permissions cannot be skipped by changing screens;
- learner and teacher content remain separated;
- every action has visible and accessible feedback;
- speech can be stopped and does not compete with another narrator;
- progress resumes correctly after force-close, network loss and sync retry;
- users can reach help, privacy notices, complaint and account-rights routes without searching through menus.

**Design rule:** a child should need to understand only the next small step. A blocked subject must explain what is pending without blaming the learner or filling the gap with unrelated content.
