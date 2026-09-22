# Pacific Education — Stage 28 Payment Verification, Operations & Business Controls

## Status

**Stage 28 architecture/process contract: DEFINED — production payment implementation, operational controls and independent verification required.**

## 1. Payment boundary

Pacific Education must not treat a browser/client-side payment state as proof of payment.

The production authority for payment status must be server-side and, where applicable, verified against the authorized payment provider.

The prototype may demonstrate payment-request flows without processing real production payments.

## 2. Pricing authority

Pricing must remain owner-controlled.

Production pricing should be maintained through a controlled server-side configuration or equivalent authoritative service.

Client-displayed prices must not be treated as authoritative.

Any GDP-based or jurisdiction-specific pricing calculation must have documented inputs, versioning, effective dates and an auditable calculation record.

## 3. Payment verification

A production payment flow should provide:

- Unique order/subscription/payment identifier
- Server-side creation of the payment record
- Authorized payment-provider integration
- Provider-side verification or trusted webhook confirmation
- Amount and currency verification
- Product/plan verification
- Transaction/status verification
- Duplicate/replay protection
- Idempotent processing
- Failure and cancellation handling
- Refund/chargeback handling where applicable
- Audit logging

Payment credentials and provider secrets must never be stored in client-side source code or localStorage.

## 4. Entitlement control

Paid access must be granted only after authoritative server-side verification.

The server should determine:

- Account
- Product/plan
- Jurisdiction/currency
- Amount
- Payment status
- Subscription/entitlement status
- Start/end dates where applicable
- Refund, cancellation or suspension status

A user must not be able to create or extend paid entitlement by modifying browser state, JavaScript variables, URLs or local storage.

## 5. Offline payment requests

If offline payment requests are supported, the prototype may record a request for later processing.

Production offline requests must not automatically create paid entitlement.

On reconnection, the server must validate the request, prevent duplicate processing and record the authoritative payment outcome.

## 6. Financial operations

Production operations should define controlled procedures for:

- Payment reconciliation
- Refunds
- Failed payments
- Chargebacks/disputes
- Manual adjustments
- Customer support
- Receipts/transaction records
- Accounting records
- Tax obligations
- Currency conversion where applicable

Manual financial actions must be authenticated, authorized and audited.

## 7. Business continuity

Payment operations should have procedures for:

- Provider outage
- Delayed webhook/provider confirmation
- Duplicate transactions
- Database/API outage
- Reconciliation mismatch
- Fraud/abuse indicators
- Customer entitlement disputes

The system should fail safely rather than grant unverified paid access.

## 8. Ownership and control

Funding, payment-provider services, hosting, technical assistance, distribution or operational support do not by themselves transfer Pacific Education ownership, equity, shares or platform control.

Owner-controlled pricing and business rules must remain subject to documented lawful agreements and applicable requirements.

## 9. Required evidence

Before Stage 28 can be marked implementation-complete, evidence should include:

- Production pricing configuration review
- Payment-provider configuration review
- Successful payment verification test
- Failed/cancelled payment tests
- Duplicate/replay test
- Refund/chargeback handling test where applicable
- Entitlement authorization tests
- Reconciliation procedure
- Manual adjustment audit test
- Secret-management verification
- Financial/operational procedure review
- Applicable tax/legal/accounting review
- Owner approval of business controls

No real production payment credentials should be committed to GitHub.

## 10. Release boundary

Stage 28 does not authorize production publication.

Real payments must not be enabled merely because the prototype payment UI or client-side payment flow works.

Production payment activation requires the applicable secure backend, authentication, database, hosting, privacy, cybersecurity, safeguarding, operational and independent-review controls to be implemented and verified.
