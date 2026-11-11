# Global Learning Library prototype — Android review checklist

**Status:** isolated design preview only; not connected to PacEdu runtime, accounts, media storage, curriculum records or payments.

## What this preview demonstrates

- A separate library page rather than another Teacher Workspace subject box.
- Fiction and Non-fiction collections.
- Read, Listen and Watch format filters.
- Search plus language and level filters.
- An optional recommendation panel for today's learning.
- Continue-learning and saved-resource placeholders.
- Visible sample access labels: Free sample, Preview and Paid label demo.

All six catalogue entries are synthetic placeholders. They are not real books, lessons, recordings or videos. The Open sample action records only a local demonstration state; it does not play or fetch media.

## Android phone review

Open the HTML preview from the staging branch in a browser that can display repository HTML files. Check:

1. The page fits a narrow phone screen without sideways scrolling.
2. Text remains readable when the phone's text size is increased.
3. Collection and format buttons clearly show which option is selected.
4. Search, language and level filters can be used without a keyboard covering the controls.
5. Each sample card exposes its title, subject, level, language, format and access label.
6. Save and unsave updates the Saved Resources list.
7. Open sample updates Continue Learning without pretending to stream media.
8. The return-to-daily-activity control is clearly identified as a prototype action.
9. Keyboard and screen-reader focus can reach every control in a logical order.
10. No child is asked to pay, enter payment details or provide personal information.

## Required before any live integration

- Replace sample records only with resources whose source, copyright/licence, territories and permitted uses are documented.
- Complete educator, age-suitability, safety and accessibility review before publication.
- Use the learner's authorised country, class/level, subject, language and approved objective only to rank suitable resources; allow the learner to skip recommendations.
- Keep the library separate from required daily activities. Free entitled learning and required schoolwork must not be blocked by paid library access.
- Enforce paid or sponsored access on a trusted server using verified account entitlements. Never unlock content from a browser flag, local storage value or client-supplied role.
- Do not expose personal learner progress to advertisers or use child activity for unrelated profiling.
- Add explicit consent and guardian-managed payment safeguards before any child-related purchase flow.
- Add real media-player, captions/transcripts, audio controls, resume, low-bandwidth and offline tests only after approved media sources and rights are in place.
- Add automated tests for filtering, saved items, accessibility labels, empty states, entitlement denial/allowance and country restrictions.
- Run the complete Android and regression suite on the exact candidate commit.

## Release decision

This preview is not production-ready and must not be linked into the live app, used to claim media availability, or used to collect payment. Keep it isolated until the above gates and the existing PacEdu regression/security checks are reviewed and approved.
