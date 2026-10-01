# Pacific Education — 100-User Controlled Pilot

## Pilot front door

**Live web pilot:** https://terubea82-eng.github.io/Pacific-education-/

**Repository:** https://github.com/terubea82-eng/Pacific-education-/

**Android pilot workflow:** https://github.com/terubea82-eng/Pacific-education-/actions/workflows/android-pilot-build.yml

## Pilot user workspaces

The live pilot exposes controlled demo workspaces for:

1. Student
2. Teacher
3. Parent / Caregiver
4. Professional Reviewer
5. NGO / Organization
6. Education / Government
7. Community / Partner
8. Owner / Control

These workspaces are **demo-only pilot access**. They do not constitute production authentication or authorization and do not contain real student records.

## What testers can test

- Pilot landing page and navigation
- Accessibility text-size controls
- Learning and daily-lesson demonstrations
- Assessment demonstrations
- Teacher/class/lesson/progress demonstrations
- Parent/caregiver progress demonstration
- Professional review evidence demonstration
- NGO/organization pilot participation demonstration
- Education/government evidence demonstration
- Community/partner services and feedback demonstration
- Owner pilot-status/evidence demonstration
- Browser/device compatibility and usability
- Feedback and issue reporting

## Do not enter

Do not enter real child names, sensitive personal information, passwords, banking/payment information, exact location, or other confidential information during the controlled pilot.

## Production boundary

The production authorization file must remain fail-closed until the required independent verification, curriculum verification, secure authentication/database/hosting, cybersecurity, privacy, safeguarding, accessibility, controlled testing, payment verification, owner authorization and release evidence are complete.

## Android pilot

The Android workflow builds:

- debug APK
- release APK (signed only when owner-controlled signing secrets are configured)
- release AAB
- SHA-256 checksums
- a combined 100-user pilot artifact

A release artifact must not be described as production-approved merely because it builds successfully.

## Pilot acceptance

A tester should record:

- role tested
- device/browser
- date/time
- feature tested
- result
- issue or suggestion
- screenshot if useful
- whether the issue blocks pilot use

## Current status

This repository is configured for a **controlled pilot**, not an unrestricted production launch. The pilot can proceed through the live web URL and, after a successful Android workflow run, the generated APK artifact.

Initial controlled pilot period: **September 21–October 21, 2026**. Any extension requires genuine documented need and explicit owner approval, up to a maximum total of three months; no automatic extension.
