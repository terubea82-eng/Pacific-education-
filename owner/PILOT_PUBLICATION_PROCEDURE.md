# Pacific Education — 3-Month Pilot Publication Procedure

**Release type:** Controlled prototype pilot  
**Pilot period:** September 21, 2026 – December 21, 2026  
**Repository:** terubea82-eng/Pacific-education-  
**Default branch:** main

## 1. Publication boundary

This procedure authorizes publication of the repository as a **controlled prototype pilot demonstration only**. It does not authorize production education services, production authentication, production child-data collection, production payments, or production security claims.

GitHub Pages is a static web publication mechanism. GitHub states that Pages sites are publicly available and should not be used for sensitive transactions such as passwords or credit-card numbers. HTTPS should be enforced where available.

## 2. Pre-publication checks

Before opening the pilot to testers, confirm:

- Repository visibility is Public.
- Default branch is main.
- The root `index.html` exists and routes to `src/index.html`.
- `src/index.html` contains the 3-month controlled-pilot notice.
- The notice states that real sensitive child information, passwords, payment credentials and exact child location data must not be entered.
- Production status remains explicitly blocked.
- Prototype authorization is not described as production authentication.
- Production approval gates remain fail-closed.
- Prototype validation workflow exists under `.github/workflows/prototype-validation.yml`.
- No secrets, API keys, passwords, private credentials or real child records are committed.

## 3. GitHub Pages publication

1. Open the repository on GitHub.
2. Open **Settings → Pages**.
3. Select the intended publishing source.
4. If publishing from a branch, use the branch/source containing the public static site and confirm that the published source contains the required entry file at its top level.
5. Save the Pages configuration.
6. Open **Visit site** after GitHub reports the deployment is available.
7. Confirm the landing page reaches the Pacific Education pilot page.
8. Confirm HTTPS is enabled/enforced where GitHub makes the option available.

GitHub notes that changes can take several minutes to publish.

## 4. Pilot smoke test

Use test data only.

Check on Android and at least one additional supported device/browser:

- Landing page loads.
- Accessibility controls load.
- Text-size controls work.
- Speech controls do not expose sensitive data.
- Daily lesson loads.
- Assessment flow loads.
- Teacher dashboard prototype loads.
- Parent dashboard prototype loads.
- Curriculum-alignment prototype loads.
- Offline/low-bandwidth prototype behavior is clearly labelled as prototype.
- Prototype authorization is clearly labelled as synthetic/browser testing.
- No page claims that GitHub Pages is a secure production backend.
- No payment credential collection is active.

Record defects as GitHub Issues and do not treat a successful browser smoke test as production certification.

## 5. Data-safety rule during the pilot

Do not collect or enter real sensitive child information in this prototype. Use synthetic test identities and non-sensitive demonstration data.

Do not use the prototype as the system of record for:

- identity verification;
- authentication;
- authorization;
- child safeguarding records;
- health or other sensitive personal records;
- payment credentials;
- production assessment records;
- exact child location information.

## 6. Production gate

The pilot may provide evidence for later production work, but it does not remove the production blockers already recorded in the repository.

Production requires, at minimum:

- verified official curriculum sources and permissions where applicable;
- production database and server-side authorization;
- secure production authentication;
- production hosting and operational controls;
- cybersecurity/security testing and review;
- privacy review;
- child-safeguarding review;
- accessibility and device testing;
- controlled pilot/user testing evidence;
- production payment verification;
- owner authorization and appropriate independent review.

Client-side JavaScript, localStorage, GitHub Pages, prototype gates, or this document cannot substitute for those controls.

## 7. Pilot close-out

At the end of the pilot:

1. Freeze the pilot evidence and issue/defect record.
2. Record user-testing results without exposing personal information.
3. Record curriculum-alignment findings and unresolved questions.
4. Record accessibility and device findings.
5. Record security/privacy/safeguarding findings.
6. Review all open production blockers.
7. Decide separately whether to extend the prototype, begin production engineering, or close the pilot.
8. Do not label the system production-ready until the external requirements and owner authorization are actually completed.

**Owner-control statement:** Pilot participation does not transfer Pacific Education ownership, equity, shares, intellectual property, or platform control.
