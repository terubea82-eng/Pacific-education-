# Stage 28 — Payment Verification, Operations & Business Controls Implementation Specification

**Status:** PREPARED — production payment verification and operational controls required.

## 1. Payment authority
Client-side payment status is never proof of payment. Production entitlement must be confirmed server-side using the authorized payment provider and reconciliation records.

## 2. Pricing
Owner-controlled pricing is versioned by jurisdiction, currency and plan. GDP-based international calculations must be documented, tested, versioned and server-verified before production use.

## 3. Payment states
Use explicit states such as initiated, pending, verified, failed, refunded, disputed and cancelled. Entitlements follow authoritative server state.

## 4. Security
Never store payment credentials or provider secrets in the client or repository. Use approved provider mechanisms and external secret management.

## 5. Reconciliation
Reconcile provider transactions, internal orders, refunds, disputes and entitlements. Exceptions require investigation and audit records.

## 6. Refunds and complaints
Define procedures and customer-facing terms for refunds, failed payments, duplicates and disputes. Legal/consumer wording requires appropriate review.

## 7. Operations
Define support roles, escalation, incidents, backups, financial record retention, segregation of duties and service continuity.

## 8. Business controls
Maintain plan catalogue, price history, transaction IDs, receipt references, entitlement history, adjustment authorization and audit trail.

## 9. Testing
Use sandbox/test transactions where available. Test success, failure, timeout, duplicate, refund, dispute, delayed confirmation and provider/API outage.

## 10. Evidence
Provider configuration evidence without secrets; server verification tests; reconciliation; refund/dispute tests; pricing audit; operational runbooks; business-control review; security verification.

## 11. Completion
Stage 28 is COMPLETE only when mandatory evidence is VERIFIED and required review is APPROVED.

## 12. Guardian boundary and transition
Guardian cannot approve financial/legal compliance, access secrets or authorize production charging. Verified completion prepares Stage 29 final readiness and explicit owner approval.

**Stage 28 remains incomplete until real production controls are implemented and independently verified.**
