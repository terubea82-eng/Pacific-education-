# Pacific Education — Controlled Release Readiness

## Purpose
This document records the controlled prototype-to-publication path for Pacific Education.

## Verified in the current build
- Central Education Core authorization boundary remains active.
- Daily lesson completion uses the Core/Dashboard flow.
- Day 30 Alphabet Assessment progression gate tested.
- Day 60 Phonics Assessment progression gate tested.
- Teacher and Parent dashboards display the same initial progress state on the live GitHub Pages application.
- GitHub Pages deployment is active from the main branch.

## Connected application order
1. Central Education Core
2. Core Bridge
3. Master Control
4. Pricing engine and pricing audit guard
5. Education Link Bridge
6. Secure Link Authorization
7. Assessment integration
8. Daily Lessons
9. Assessments
10. Dashboards
11. Buy Plans
12. Application shell

## Publication rule
GitHub Pages publication is prototype/public web publication only. It is NOT approval for production education services, production authentication, production child data, production payments, or production security.

## Production gates that remain required
- Production database and server-side authorization
- Secure authentication and account recovery
- Server/provider-side payment verification
- Cybersecurity and penetration/loophole testing
- Privacy and child-data legal review
- Child safeguarding controls and operational procedures
- Fiji curriculum authority validation and licensing/permissions where applicable
- Accessibility testing with users
- Offline/low-bandwidth validation
- Controlled pilot and user acceptance testing
- Backup, rollback and incident-recovery procedures
- Owner approval before production launch

## Owner-control rule
Pacific Education remains owner-controlled. Technical assistance, hosting, funding, distribution, or other support does not by itself transfer platform ownership, equity, shares, partnership status, or control.

## Safe automation rule
The build may automatically connect and publish prototype code to GitHub Pages when the repository is configured for Pages. Production gates must not be bypassed by client-side code or by GitHub Pages.

## Current release state
PROTOTYPE — PUBLISHED TO GITHUB PAGES — PRODUCTION GATES OPEN

Last controlled update: 2026-09-21
