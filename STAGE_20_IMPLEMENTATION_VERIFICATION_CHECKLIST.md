# Pacific Education — Stage 20 Implementation & Verification Checklist

## Purpose

This checklist converts the Stage 20 architecture contract into a controlled implementation and verification sequence. It is a planning and evidence document only. It does not create production infrastructure or authorize production release.

## Gate 20.1 — Production environment

- [ ] Approved production-like environment identified.
- [ ] Database service provisioned by an authorized operator.
- [ ] Database access restricted to approved server-side services.
- [ ] No database credentials or secrets committed to Git.
- [ ] Environment configuration separated from prototype configuration.

## Gate 20.2 — Core data model

- [ ] Accounts and role/status records implemented.
- [ ] Profiles implemented with data-minimization controls.
- [ ] Education relationships implemented with verification and revocation state.
- [ ] Learning-progress records implemented with synchronization/version metadata.
- [ ] Assessments and marks implemented with correction/audit workflow.
- [ ] Curriculum references implemented with jurisdiction, source identifier, version/date and verification status.
- [ ] Audit events implemented without unnecessary child personal information.

## Gate 20.3 — Authorization

- [ ] Every protected API operation authenticates the requesting account.
- [ ] Role and account status are evaluated server-side.
- [ ] Verified relationships are evaluated where required.
- [ ] Resource scope/ownership is enforced.
- [ ] Missing or invalid authorization inputs deny access by default.
- [ ] Client-side localStorage, flags and prototype authorization are never accepted as authority.

## Gate 20.4 — Persistence and synchronization

- [ ] Learning progress persistence tests pass.
- [ ] Assessment persistence tests pass.
- [ ] Marks correction workflow tests pass.
- [ ] Offline queue operations are authenticated on reconnect.
- [ ] Idempotency protection is tested.
- [ ] Stale/conflicting operations are rejected or reconciled by explicit server rules.
- [ ] Server state remains authoritative after synchronization.

## Gate 20.5 — Backup and recovery

- [ ] Automated backup configured.
- [ ] Backup access restricted.
- [ ] Retention documented.
- [ ] Recovery objectives documented.
- [ ] Restore test completed successfully.
- [ ] Restore evidence recorded with date, operator and result.

## Gate 20.6 — Audit and failure behavior

- [ ] Security-relevant operations generate audit events.
- [ ] Audit records contain actor, action, resource, outcome and timestamp as appropriate.
- [ ] Authentication/authorization outage tests deny new protected access.
- [ ] Client-side success cannot create authoritative records during outage.
- [ ] Payment confirmation remains server/provider verified.
- [ ] Recovery reconciliation returns authoritative server state.

## Gate 20.7 — Independent verification

The following evidence must be recorded before Stage 20 can be considered complete:

1. Production data model/schema implemented in an approved environment.
2. Identity, role, relationship, authorization and audit boundaries independently verified.
3. Backup, recovery and migration controls tested.
4. Independent technical verification recorded.

The authorized completion authority is the role defined in `automation/stage-evidence-requirements.json`.

## Completion rule

Stage 20 remains **INCOMPLETE** until all mandatory evidence is verified, the required review is approved, blocking defects are zero, and the completion authority is recorded in the stage-completion evidence record.

**Stage 20 completion does not authorize production launch.**
