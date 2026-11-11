# Global Country User Counts and Payment Accountability

**Status:** Product requirements / staging specification only  
**Owner visibility:** Restricted to the PacEdu Owner role  
**Implementation status:** Not implemented or connected to live account/payment data  
**Applies to:** Global registration, supplementary learning, official school learning, country agreements and business accounts

## 1. Purpose

PacEdu must support users worldwide, including users in countries that have not officially adopted PacEdu. The platform must distinguish personal supplementary learning from official school implementation and must keep country user statistics private to the PacEdu Owner.

The system must provide accurate, auditable country-level user totals and separately reconcile student accounts covered by a written country payment agreement. A country must never be invoiced for every person registered in that country merely because those users selected its curriculum.

## 2. Three separate country attributes

Never treat these as interchangeable:

1. **Registration country:** the country associated with the user's account registration, using the minimum reliable information and lawful collection basis.
2. **Preferred curriculum country/jurisdiction:** the country or education jurisdiction whose published curriculum the user chooses to study. A user may select more than one curriculum.
3. **Contracting/billing country:** the government, school network, sponsor or other legal entity that has signed an agreement to pay for specified student accounts.

A user registered in Country A who studies Country B's curriculum remains counted under Country A's registration-country total and is separately recorded as a Country B curriculum learner. This does not make Country B responsible for payment.

## 3. Owner-only country user statistics

The PacEdu Owner dashboard is the only role permitted to view aggregate user counts broken down by registration country.

For each country, the Owner may view:
- total unique registered accounts;
- verified accounts;
- active accounts for a clearly defined reporting window;
- student accounts;
- individual learner accounts;
- teacher accounts;
- parent/family accounts;
- education officer accounts;
- business/organisation accounts;
- suspended, closed and deleted-account aggregates where retention lawfully permits;
- new registrations by day, week, month and selected period;
- supplementary curriculum selections as a separate aggregate dimension; and
- historical snapshots and changes over time.

The Owner dashboard must also show global totals and allow filtering by account type, registration period, account status and curriculum selection without exposing unnecessary personal details.

**Strict access rule:** Country administrators, teachers, schools, businesses, individual users and other roles must not see total registered-user counts for any country or the global country comparison table. Country finance contacts may see only the billable student quantity, rate, period and reconciliation evidence expressly covered by their own signed agreement. That contractual invoice quantity is not the country's total user count.

The Owner dashboard should show aggregated statistics by default. It must not expose children's names, dates of birth, school identifiers, contact details, learning answers or other personal records merely to display a count. Any exceptional access to identifiable account records requires a separate operational purpose, least-privilege permission, legal basis and audit log.

## 4. Counting and deduplication rules

- Count one person/account once in the global unique-user total, even if they use multiple subjects or curricula.
- A multi-country curriculum selection must not create multiple user accounts or inflate registration-country totals.
- Separate registered, verified and active metrics. Define active as an explicit reporting-window measure; do not silently treat all registered accounts as active.
- Exclude test, synthetic, known duplicate and unverified placeholder accounts from genuine-user totals, while retaining clearly labelled operational counts where useful.
- Use a stable internal account identifier for deduplication; do not rely only on name, email or phone matching.
- Record account closure/deletion and apply the applicable retention and deletion policy. Historical aggregates should be retained only where lawful and appropriately anonymised.
- Do not infer nationality, residence, government responsibility or payment liability from curriculum selection, IP address or language preference.
- Display the metric definition, reporting window, last refresh time and data-quality status beside every count.

## 5. Student pricing and country agreements

The proposed standard pricing direction is:
- Student: US$5 per student for the agreed billing period, unless a country agreement negotiates a different amount.
- Country-funded student cohort: negotiable per covered student, with local-currency settlement or an agreed USD reference.
- Independent individual learner: US$10 per agreed billing period.
- Business/organisation: retain the separate existing business pricing and package arrangements; do not change them through this student-pricing specification.

**Billing-period decision:** The billing period must be expressly defined in the signed pricing schedule (for example, monthly, termly or annually). Do not assume a billing period from the price alone and do not activate recurring charges until the Owner approves the terms.

A country agreement must specify:
- legal contracting entity and authorised signatories;
- covered schools, cohorts and eligibility rules;
- definition of a billable student (registered, verified, enrolled or active, as explicitly agreed);
- agreed quantity or auditable roster-counting method;
- per-student price and currency;
- billing period, cut-off date and invoice schedule;
- exchange-rate source/date or fixed local-currency price;
- taxes, fees, withholding and bank charges;
- payment deadline, grace period and dispute process;
- additions, withdrawals, transfers, refunds and mid-period adjustments;
- agreement start, expiry, renewal and termination; and
- treatment of sponsored, scholarship-funded and privately paying students.

A country's agreement applies only to the eligible student accounts defined in that agreement. It does not automatically cover every user registered in that country.

## 6. Student billing reconciliation

Maintain separate quantities for:
1. all registered students in the country (Owner-only statistic);
2. verified student accounts;
3. student accounts eligible under the agreement;
4. billable student accounts for the relevant period;
5. sponsored or scholarship-funded accounts;
6. privately paying student accounts; and
7. disputed, suspended, withdrawn or adjusted accounts.

For each invoice, preserve a dated and auditable snapshot of the covered account quantity and calculation. The country finance contact may see the contracted billable quantity and supporting reconciliation information permitted by the agreement, but not the country's total user population or other user categories.

The system must calculate:
- contracted student quantity × agreed per-student rate;
- approved additions/credits/adjustments;
- amount invoiced;
- confirmed payments received;
- refunds and reversals;
- outstanding balance; and
- payment status and due date.

Never mark a payment as received based only on a user-entered confirmation or uploaded receipt. Payment status must be reconciled against a verified payment-provider event or an authorised finance confirmation with an audit record.

## 7. Currency and financial controls

- Store the agreement currency, agreed local-currency amount, USD reference (if applicable), exchange-rate method, rate date and source.
- Do not silently reprice an existing agreement when exchange rates change.
- Apply only the rate and conversion method approved in the agreement.
- Keep invoices, receipts, refunds, adjustments and payment-provider references immutable or versioned with a full audit trail.
- Use server-side calculations and verified payment webhooks; never trust browser/local-storage totals or payment status.
- Separate student subscriptions, individual learner subscriptions and business advertising/service payments in accounting and reporting.
- No live collection, invoice issuance or recurring billing until legal terms, taxes, provider integration, server-side verification and Owner approval are complete.

## 8. Notifications and warnings

Send notices only to the appropriate authorised recipients:
- Owner: global registration changes, country-level count changes, reconciliation anomalies, unpaid invoices and agreement status.
- Country finance contact: its own agreement's billable quantity, invoice, due date, payment receipt, outstanding balance and dispute status.
- School/authorised coordinator: only the roster and payment-related information necessary for its assigned cohort and authorised role.

Warnings should cover upcoming due dates, overdue balances, partial payments, student-count changes, mismatched invoice quantities, expiring agreements, duplicate-account anomalies and unresolved disputes.

An overdue invoice must not automatically block a child's learning. Any service restriction must follow the signed agreement, applicable law, appropriate notice and safeguarding review.

## 9. Security, privacy and audit

- Enforce all permissions server-side; a hidden dashboard or client-side role check is not security.
- Use least-privilege Owner access with strong authentication and protected account recovery.
- Log dashboard access, exports, permission changes, agreement edits, invoice changes, payment confirmations and manual adjustments.
- Protect child and education records; show aggregate counts by default.
- Restrict exports, apply retention limits and secure backups.
- Conduct privacy, child-safeguarding, tax, consumer-protection and cross-border data-transfer reviews for each launch jurisdiction.
- Do not expose one country's statistics to another country or to ordinary users.
- Never use country-level statistics to imply government adoption, endorsement or a payment obligation.

## 10. Owner dashboard sections

1. **Global Overview:** unique registered users and account-type totals.
2. **Country Statistics:** Owner-only country-by-country registration and user counts.
3. **Curriculum Selections:** separate counts of users choosing each curriculum/jurisdiction.
4. **Country Agreements:** negotiated price, currency, covered cohort, billing period and agreement status.
5. **Student Reconciliation:** eligible quantity, billable quantity, invoice and adjustments.
6. **Payments:** received, pending, overdue, refunded and disputed amounts.
7. **Alerts:** count anomalies, agreement expiry, reconciliation mismatches and overdue payments.
8. **Audit History:** who accessed or changed records, when and why.

## 11. Acceptance tests before activation

- One user selecting two countries' curricula is counted once globally and once under their registration country.
- Curriculum selection never creates a billing obligation for that country.
- Country user totals are inaccessible to every non-Owner role, including country administrators.
- A country finance contact sees only its own agreement's contracted billable quantity and invoice details.
- A country without an agreement is counted in Owner statistics but is not invoiced.
- A negotiated country rate overrides the standard student rate only for covered eligible accounts and the agreed period.
- Individual learner and business accounts are not included in student invoices.
- Duplicate, test and closed accounts follow documented counting rules.
- Invoice calculations reconcile to a dated account snapshot and approved adjustments.
- Unverified payment claims do not update received-payment totals.
- Currency changes do not silently alter an existing contract.
- All exports, manual adjustments and permission changes are audited.
- No student access is automatically removed solely because a payment warning is raised.

## 12. Implementation boundary

This document records product requirements only. It does not create accounts, collect payments, change Firebase, expose user statistics or establish country agreements. Implementation requires a reviewed data model, server-side authorization, privacy/legal assessment, payment-provider verification, automated tests and explicit Owner approval.

Build this as a separate global-accounting capability. Preserve the existing student, teacher, curriculum, accessibility, voice and save/resume workflows. Keep the work in the staging branch until the Owner reviews the implementation and all required checks pass.
