# Pacific Education — Pilot Preflight Checklist

**Purpose:** controlled pilot only. This checklist does not authorize production.

## Automatically enforced

- Controlled pilot notice and synthetic/test-data boundary.
- Production remains fail-closed.
- Production authorization/eligibility remains false.
- Payment cannot be confirmed by the browser.
- Official curriculum validation remains a release requirement.
- Daily learning range includes Days 1–365.
- All configured pilot roles remain present.
- Automated preflight evidence is retained as a GitHub Actions artifact.

## Manual evidence still required

These items cannot be honestly completed by source-code automation alone:

1. Install and run the latest APK on the actual pilot Android device(s).
2. Test registration, role selection, class/year, subject, term, and daily navigation.
3. Test Daily Activities for Day 1, representative middle days, and Day 365.
4. Confirm the achievement indicator/concept is shown above the relevant daily activity when verified curriculum evidence exists.
5. Test accessibility controls, speech, text sizing, navigation, and screen layout.
6. Confirm the device exposes the intended English male TTS voice; if not, record the limitation.
7. Conduct controlled teacher/student/parent pilot testing using synthetic/demo data.
8. Record bugs, curriculum issues, accessibility issues, safeguarding concerns, and user feedback.
9. Obtain authoritative curriculum evidence before treating curriculum-specific content as officially verified.
10. Keep production authentication, backend/database, real payment, and production release disabled.
11. Review privacy and safeguarding evidence with the appropriate authorized reviewer.
12. Review cybersecurity and authorized data integrations before any production decision.

## Owner action required

**OWNER ACTION REQUIRED:** authorize expansion from the initial controlled test to the intended pilot population only after the manual evidence above is reviewed.

**WHY:** automated checks can verify code/configuration boundaries, but they cannot prove real-device behavior, human usability, official curriculum approval, or independent safeguarding/privacy review.

**OPTIONS:**
- Start with a small controlled tester group and record evidence.
- Fix issues found during testing and rerun the preflight.
- Keep the pilot limited until required evidence is complete.

**Important:** passing this checklist does not grant production approval. The production gate remains fail-closed.
