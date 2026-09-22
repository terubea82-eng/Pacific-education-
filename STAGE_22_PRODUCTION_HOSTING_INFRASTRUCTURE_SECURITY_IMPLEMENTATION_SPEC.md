# Pacific Education — Stage 22 Production Hosting and Infrastructure Security Implementation Specification

**Status:** SPECIFICATION PREPARED — practical implementation and independent infrastructure/security verification required.  
**Stage:** 22  
**Production approval:** NOT GRANTED.

## 1. Purpose

Define the production hosting, network, deployment, infrastructure-access, availability, monitoring and infrastructure-security requirements for Pacific Education.

This stage establishes the technical hosting foundation. It does not itself establish legal compliance, Ministry approval, production release approval or contractual sufficiency.

## 2. Hosting decision

The owner must approve the production hosting architecture before implementation.

Record:

- hosting provider;
- service region/data location;
- application hosting model;
- database hosting model;
- authentication provider;
- object/file storage if required;
- DNS/domain provider;
- monitoring provider;
- backup provider;
- payment provider where applicable;
- estimated recurring cost;
- support arrangements;
- vendor agreements;
- exit/migration plan.

Do not select a provider solely because it is convenient for the prototype.

## 3. Environment separation

Maintain controlled separation between:

- development;
- test;
- staging;
- production.

Production credentials, databases and private keys must never be reused casually in development or test environments.

Development/test data must not be copied into production without an approved controlled process.

## 4. Production architecture

The intended baseline is:

**User device → HTTPS/TLS → production application/API → protected service layer → production database/services**

The browser must not connect directly to the production database.

Internal services must use authenticated and authorized service-to-service communication where required.

## 5. Network controls

Production infrastructure must define:

- public entry points;
- private services;
- database network restrictions;
- administrative access path;
- firewall/security-group rules;
- allowed inbound traffic;
- allowed outbound traffic;
- management-plane access;
- service-to-service access.

Default-deny principles should be used wherever practical.

## 6. TLS and domain security

Production services handling protected information must use secure transport.

Verify:

- valid TLS certificates;
- certificate renewal;
- HTTPS enforcement;
- secure redirects;
- no mixed-content dependency;
- secure API endpoints;
- appropriate DNS configuration.

Certificate/private-key material must not be committed to GitHub.

## 7. Administrative access

Infrastructure administration must use:

- named accounts;
- least privilege;
- strong authentication;
- controlled privileged access;
- audit logging;
- session controls;
- credential rotation;
- emergency-access procedure.

Shared administrator credentials should be avoided.

## 8. Server and platform hardening

The selected hosting environment must be hardened according to the provider's supported security controls and the approved risk assessment.

Evaluate:

- operating-system/platform updates;
- supported runtime versions;
- unnecessary services;
- exposed ports;
- administrative interfaces;
- security configuration;
- endpoint protection where applicable;
- vulnerability management.

Unsupported or obsolete production components must not be used without a documented, reviewed exception.

## 9. Patch management

Define:

- vulnerability monitoring;
- severity assessment;
- patch priorities;
- emergency patch process;
- routine maintenance windows;
- verification after patching;
- rollback/recovery plan.

Critical security updates must have an escalation path.

## 10. Infrastructure secrets

Secrets must be managed outside source control using an approved secret-management/deployment mechanism.

Protected values include:

- database credentials;
- authentication-provider secrets;
- API keys;
- signing keys;
- TLS private keys;
- payment credentials;
- encryption keys;
- administrative credentials.

Repository scans must prevent accidental secret publication where practical.

## 11. Key management

Where encryption keys are used, define:

- key ownership;
- storage;
- access control;
- rotation;
- backup/recovery considerations;
- revocation;
- compromise response.

Encryption keys must not be stored together with protected data in an uncontrolled location.

## 12. Database infrastructure

Production database access must be restricted to authorized application/services and approved administrators.

Verify:

- network isolation;
- authentication;
- least privilege;
- encryption where required;
- backup integration;
- monitoring;
- audit capability;
- connection limits;
- recovery procedures.

The application must not expose database credentials to the browser.

## 13. Storage infrastructure

If file/object storage is used:

- define public/private boundaries;
- prevent accidental public exposure;
- validate file access;
- restrict upload types and sizes;
- scan uploaded content where appropriate;
- control retention/deletion;
- audit sensitive access;
- use signed/temporary access mechanisms where appropriate.

Do not place sensitive learner records in publicly accessible storage.

## 14. Deployment architecture

Production deployment must use a controlled pipeline.

Baseline flow:

**Code change → review → automated tests → security validation → approved build → deployment → health checks → monitoring**

A developer's local machine or Android browser must not be treated as the production deployment authority.

## 15. Branch and release controls

Protected production code should use appropriate repository controls, including:

- protected main/release branches;
- required reviews;
- required status checks;
- controlled merge permissions;
- deployment approvals where required;
- tagged/versioned releases.

Guardian automation must remain subject to these controls.

## 16. Build integrity

Production builds must be traceable to:

- repository commit;
- build identifier;
- dependency versions;
- build date;
- approved workflow;
- deployment record.

Do not deploy an untraceable build.

## 17. Dependency security

Production dependencies must be:

- identified;
- version-controlled;
- scanned for known vulnerabilities;
- maintained;
- reviewed when materially changed.

High-risk dependency findings must be assessed before release.

## 18. Availability architecture

Define expected availability and service dependencies.

Document:

- normal operating capacity;
- scaling model;
- capacity limits;
- service quotas;
- dependency limits;
- maintenance behavior;
- outage response.

Availability claims must be based on measured evidence, not assumptions.

## 19. Monitoring

Monitor:

- application health;
- API latency/errors;
- database health;
- CPU/memory/storage where relevant;
- network failures;
- authentication/security events;
- backup status;
- synchronization failures;
- deployment health;
- infrastructure security alerts.

Critical alerts require a responsible operator and escalation route.

## 20. Logging

Production infrastructure logs must be:

- centralized or otherwise reliably retained;
- access-controlled;
- time-synchronized where practical;
- monitored;
- protected from unauthorized modification.

Do not log:

- passwords;
- authentication secrets;
- payment credentials;
- private keys;
- unnecessary child personal information.

## 21. Time synchronization

Production services should use a reliable time source so that:

- audit events are chronologically meaningful;
- authentication/session controls operate correctly;
- incident timelines can be reconstructed;
- distributed events can be correlated.

Material clock discrepancies must be detected where practical.

## 22. Incident response

Infrastructure incidents must follow the controlled incident process.

Examples:

- hosting outage;
- unauthorized infrastructure access;
- exposed secret;
- database compromise;
- suspicious deployment;
- certificate failure;
- DNS failure;
- storage exposure;
- malware/compromise;
- major service degradation.

For material incidents:

1. detect;
2. contain;
3. preserve evidence;
4. assess impact;
5. recover safely;
6. verify controls;
7. document;
8. complete required professional/legal notifications where applicable;
9. correct the cause;
10. verify closure.

## 23. Backup and disaster recovery dependency

Stage 22 must integrate with Stage 20.5 backup/recovery controls.

Infrastructure recovery must preserve:

- database recovery capability;
- application version;
- configuration;
- required audit records;
- approved infrastructure settings.

Recovery testing must be coordinated rather than assumed.

## 24. Infrastructure change management

Every material infrastructure change must record:

- change ID;
- reason;
- affected resources;
- risk/impact;
- reviewer;
- test evidence;
- deployment window;
- rollback/recovery plan;
- result.

Emergency changes must be retrospectively reviewed.

## 25. Vendor and third-party services

For each critical vendor record:

- service;
- purpose;
- data processed;
- geographic/data location information where available;
- security documentation;
- availability commitments where applicable;
- contract status;
- support contact;
- dependency risk;
- exit/migration considerations.

Vendor review must feed into the legal, privacy and operational registers.

## 26. Data-location governance

Record the locations/regions in which production data may be processed or stored.

Do not assume that a provider's headquarters equals the location of data processing.

The owner and appropriate professional reviewers must assess applicable privacy, contractual and regulatory implications.

## 27. Capacity and cost controls

Monitor:

- storage growth;
- database usage;
- bandwidth;
- compute usage;
- provider quotas;
- API limits;
- backup storage;
- monitoring costs.

Define alerts before unexpected infrastructure cost becomes operationally damaging.

## 28. Production health and deployment gates

A deployment must not be considered successful solely because the deployment command completed.

Verify:

- application readiness;
- authentication;
- authorization;
- database connectivity;
- critical API functions;
- audit logging;
- monitoring;
- error rates;
- rollback readiness.

If critical verification fails, deployment must enter controlled rollback/recovery or remain unavailable rather than being declared healthy.

## 29. Infrastructure security testing

Required testing should include:

- network exposure review;
- firewall/security-group review;
- TLS configuration;
- administrative-access testing;
- secret exposure scanning;
- dependency vulnerability scanning;
- database exposure testing;
- storage-access testing;
- deployment permission testing;
- backup/recovery integration;
- monitoring/alert testing;
- incident-response exercise.

Testing must be authorized and controlled.

## 30. Required Stage 22 evidence

Evidence must include:

- owner-approved hosting architecture;
- production environment configuration;
- network/access controls;
- TLS verification;
- administrative access controls;
- server/platform hardening;
- patch-management evidence;
- secret/key-management evidence;
- database infrastructure security;
- storage security where applicable;
- controlled deployment pipeline;
- build traceability;
- dependency/security scans;
- monitoring and logging;
- infrastructure incident procedure;
- vendor records;
- capacity/cost controls;
- infrastructure security testing;
- independent infrastructure/security verification.

Do not place credentials or secrets in evidence files.

## 31. Independent verification

Stage 22 requires appropriate independent infrastructure/security verification.

The verifier should confirm:

- infrastructure matches the approved architecture;
- exposed services are justified;
- privileged access is controlled;
- production secrets are protected;
- deployment controls function;
- monitoring works;
- recovery dependencies are understood;
- material findings are documented.

The verifier must state limitations and unresolved risks.

## 32. Defect handling

Findings must be recorded with:

- finding ID;
- affected requirement;
- evidence;
- severity;
- corrective action;
- owner;
- retest requirement;
- closure evidence;
- reviewer decision.

Blocking findings prevent Stage 22 completion.

## 33. Guardian automation boundary

Stage 22 is a protected review-controlled stage.

Guardian may prepare:

- documentation;
- evidence indexes;
- review requests;
- controlled review PRs where permitted;
- validation reports.

Guardian must not autonomously:

- create production credentials;
- expose infrastructure secrets;
- alter protected production infrastructure;
- bypass branch/deployment protection;
- approve its own security review;
- declare infrastructure legally compliant;
- authorize production release.

## 34. Stage 22 completion rule

Stage 22 remains **INCOMPLETE** until:

1. production hosting is actually provisioned;
2. required infrastructure controls are implemented;
3. mandatory tests pass;
4. evidence is recorded;
5. independent infrastructure/security verification is completed;
6. blocking defects = 0;
7. required review is APPROVED;
8. completion authority is recorded.

Documentation alone does not satisfy implementation.

## 35. Automatic transition

When Stage 22 is genuinely verified and completed, Guardian may prepare the controlled next-stage documentation and evidence package.

The next stage remains independently review-controlled.

Automatic preparation does not create legal approval, regulatory approval, Ministry approval or production authorization.

## 36. Release boundary

Stage 22 completion does not authorize production launch.

Stages 23 onward and all applicable privacy, cybersecurity, child-safeguarding, accessibility, curriculum, payment, legal/professional and owner-approval gates remain mandatory.

**Current status: PREPARED — practical implementation and independent infrastructure/security verification required.**