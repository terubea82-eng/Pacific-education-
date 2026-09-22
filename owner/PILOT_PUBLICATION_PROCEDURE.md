# Pacific Education — 3-Month Controlled Pilot Publication Procedure

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
- Prototype authorization objects used by Secure Link and Secure Communication explicitly require `prototypeSession: true`.
- The prototype validation workflow must pass JavaScript syntax, local script-reference, publication-record, fail-closed, security-boundary and obvious-secret checks.
- Do not treat a missing or delayed GitHub Actions run as a successful validation result.

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

## 7. Pilot close-out and automatic transition check

At the end of the pilot:

1. The application automatically detects that the pilot end date has passed and records the pilot as closed.
2. Freeze the pilot evidence and issue/defect record.
3. Record user-testing results without exposing personal information.
4. Record curriculum-alignment findings and unresolved questions.
5. Record accessibility and device findings.
6. Record security/privacy/safeguarding findings.
7. The application automatically evaluates all required production conditions.
8. If any required condition is missing, unverified or blocked, production remains **BLOCKED**.
9. Automatic production approval is permitted only when every required production condition is verified **and authorized server-side production authority confirms approval**.
10. Client-side JavaScript, localStorage, GitHub Pages, pilot dates, or a successful pilot cannot by themselves grant production authorization.
11. Do not label the system production-ready until the external requirements and owner authorization are actually completed.

**Owner-control statement:** Pilot participation does not transfer Pacific Education ownership, equity, shares, intellectual property, or platform control.

### Final pre-pilot owner checklist
- [ ] Confirm GitHub Pages source is configured to the intended prototype publishing source.
- [ ] Confirm the published site opens from the repository's GitHub Pages URL.
- [ ] Confirm the pilot banner and end date are visible.
- [ ] Confirm no real child/sensitive data is entered during the pilot.
- [ ] Confirm an actual validation workflow run completes successfully; absence of a run is not a pass.
- [ ] Record pilot tester/device/browser evidence separately from prototype code.
- [ ] Report defects through the repository issue/test process.
- [ ] Keep production authorization blocked throughout the pilot unless every production requirement is independently verified and authorized server-side.
