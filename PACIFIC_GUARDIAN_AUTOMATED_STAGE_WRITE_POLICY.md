# Pacific Guardian — Automated Stage Write Policy

## Purpose

Pacific Guardian may automatically prepare and apply **limited, stage-scoped repository updates** when a Pacific Education development stage is demonstrably completed.

This is an automation policy, not unrestricted autonomous access.

## Authority model

Pacific Guardian may:

- detect a verified stage-completion record;
- create or update the stage's documentation/status record;
- update explicitly allowlisted application files required by that completed stage;
- run the required validation workflow;
- create a commit or pull request containing the change;
- record the evidence and change identifier.

Pacific Guardian must not:

- bypass GitHub branch protection;
- expose or create secrets;
- modify authentication credentials or production keys;
- grant itself repository ownership/admin rights;
- declare legal compliance;
- declare Ministry approval;
- declare production readiness;
- bypass security, privacy, safeguarding, accessibility, curriculum or payment review;
- directly modify protected production infrastructure without the applicable authorization.

## Stage completion requirement

A stage may trigger automated writing only when all required completion conditions for that stage are recorded.

Minimum conditions:

1. Stage identifier is valid.
2. Required tests have passed.
3. Required evidence references exist.
4. Required review status is satisfied.
5. No blocking defect remains.
6. The target files are allowlisted for that stage.
7. The change passes automated validation.

A stage marked only "defined", "in progress", "testing" or "pending" cannot trigger automatic application writing.

## Change classes

### Class A — Low-risk automatic updates

Guardian may automatically update:

- stage documentation;
- test/evidence indexes;
- non-sensitive UI wording;
- documentation links;
- version/status metadata;
- approved prototype content files.

These changes must still be validated and audited.

### Class B — Review-required updates

Guardian may prepare but must not independently merge changes involving:

- curriculum interpretation or official-source claims;
- assessment/marks logic;
- safeguarding behavior;
- privacy/data handling;
- authentication/authorization;
- payment/entitlement;
- database schema;
- communication between children and adults;
- production infrastructure.

These changes require the applicable human or specialist review.

### Class C — Protected changes

Guardian must not autonomously write or deploy:

- production secrets;
- credentials;
- signing keys;
- payment-provider secrets;
- authentication secrets;
- production database credentials;
- infrastructure credentials;
- security-policy bypasses;
- production deployment authorization.

## Git workflow

The preferred automatic sequence is:

**Stage evidence verified → Guardian prepares scoped change → automated tests → commit/PR → required review → merge → deployment only through approved release workflow.**

For Class A changes, repository policy may permit automatic merge after all automated checks pass.

For Class B changes, Guardian creates a reviewable pull request and waits for the required reviewer.

For Class C changes, Guardian records the required action but does not write the protected material.

## Fail-closed rule

If evidence is missing, tests fail, a required reviewer is unavailable, a target file is outside the allowlist, or the stage status is ambiguous:

**NO AUTOMATIC WRITE.**

The system must create a review item instead.

## Audit record

Every automatic write must record:

- Stage
- Completion evidence
- Files changed
- Commit/PR identifier
- Test results
- Actor: Pacific Guardian automation
- Timestamp
- Review status
- Deployment status

## Owner control

Pacific Education remains owner-controlled.

Automatic writing is delegated operational authority only. It does not transfer ownership, equity, shares, platform control or production approval.

The owner may disable the automation through the repository's protected automation controls.

## Production boundary

Pacific Guardian's ability to update repository files does not authorize production release.

Production remains governed by the Stage 29 and Stage 30 readiness and release gates.
