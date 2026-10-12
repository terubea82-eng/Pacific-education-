# Pacedu Page-by-Page Navigation Rebuild (Isolated Candidate)

## Safety boundary
- This work stays on `rebuild/pacedu-page-by-page-navigation-20261012`.
- Do not merge to `main`, deploy GitHub Pages, or replace the installed APK until the candidate passes checks and the owner confirms real-device testing.
- Keep the current Pacedu app and all existing features intact.
- Do not modify the protected #856 voice architecture files:
  - `src/js/pacificEducationSpeechVoice.js`
  - `src/js/pacificEducationMandatoryVoiceNavigation.js`

## Objective
Replace the tangled page-transition behavior with one clearly defined page-by-page navigation owner, developed separately and integrated only after its tests pass. This is not a delete-and-recreate of the application.

## Required user flow
1. Welcome: one continuous welcome/owner/Pacedu introduction; AI Playback only here.
2. Vision, Mission and Purpose.
3. Rules and Conditions.
4. Country selection.
5. Language selection.
6. User role selection.
7. Registration details and save.
8. Correct role-specific workspace.
9. Sign-out.

The repository may contain more than nine guided screens; the final controller must map the real existing pages rather than assume page numbers. Only the current guided page should be visible. Back and Next must work on every applicable page, and invalid/incomplete inputs must not advance.

## Features that must be preserved
- Protected #856 voice baseline and one-narrator behavior.
- No welcome/owner/Pacedu narration on Registration; registration-specific Hear Instructions and Stop Speech remain available.
- Offline-first operation and app-scoped tunnel design.
- Mail Box, accessibility, Math/English/Phonics learning activities, curriculum coverage, assessment, progress dashboards, and existing role workspaces.
- Pilot safety notices and owner-only controls.

## Implementation and verification stages
1. Inventory the current page markup, navigation handlers, duplicate click listeners, and page visibility rules.
2. Build a new isolated navigation controller with one transition owner; avoid editing the protected voice files.
3. Add tests for every page transition, Back, hidden-page isolation, invalid-input blocking, role/workspace routing, sign-out, and no welcome playback on Registration.
4. Run the browser test suite and Android build checks.
5. Review the diff to verify feature preservation and protected-file integrity.
6. Only after all automated checks pass, request owner testing on the actual Android phone. Browser checks cannot confirm physical speaker output or installed-app behavior.
7. Keep this PR draft and unmerged until the owner confirms the candidate is ready.

## Current status
- Isolation branch created from `main`.
- Planning and safety boundaries recorded.
- No application code has been changed by this planning commit.
