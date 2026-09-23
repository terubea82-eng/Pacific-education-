# Pacific Guardian Mandatory Change Traceability Policy

## Mandatory rule
Every necessary Pacific Education application or architecture change must be recorded by Pacific Guardian.

Application changes include `src/`, `js/`, `owner/`, `android/`, and `app/`. Architecture and governance changes include controlled stage specifications, production specifications, Pacific Guardian automation, and related workflows.

## Required record
Each detected change records the commit SHA, previous commit, timestamp, actor, workflow run, changed application files, changed architecture/governance files, and traceability status.

## Approval boundary
A traceability record does not mean production approval. Ministry/curriculum, security, privacy, safeguarding, legal, specialist, and owner approvals remain controlled by their applicable stages.

## Fail-closed requirement
If mandatory audit recording cannot run or cannot create its record, the change must not be treated as fully traceable or production-ready.

## Merge enforcement
The repository owner should configure the GitHub branch/ruleset required status check for **Pacific Guardian Mandatory App Change Audit** so app changes cannot be merged without the audit workflow passing.
