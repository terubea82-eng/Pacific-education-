# Pacific Education — Stage 20.1 Production Environment Setup Specification

**Stage:** 20.1 — Production/Production-Like Environment  
**Status:** PREPARATION — no production environment is approved or provisioned by this document  
**Control:** FAIL-CLOSED

## Purpose

Define the practical requirements for establishing a controlled backend environment for Pacific Education before database and API implementation. The specification is vendor-neutral so the owner can select an appropriate provider later.

## Required environment separation

At minimum, maintain distinct environments:

1. **Development** — engineering work only.
2. **Test/Staging** — integration, security and user testing.
3. **Production** — real service only after all required release gates are satisfied.

Development or staging credentials must never be reused as production credentials.

## Environment requirements

The selected provider and architecture must support, as appropriate:

- server-side application/API hosting
- managed or securely administered database
- TLS/HTTPS
- secret management
- restricted administrative access
- environment variables/configuration management
- logging and monitoring
- backups and restoration
- database migrations
- controlled deployment
- access revocation
- incident response support
- appropriate regional/data-location assessment
- service availability and recovery information

## Network and access model

Target flow:

Client → HTTPS/TLS → API/service → database

Rules:

- No direct client-to-database connection.
- Database credentials are server-side only.
- Administrative access is restricted.
- Least privilege is applied to service accounts.
- Production administration is separated from ordinary learner/teacher/parent access.
- Administrative actions affecting sensitive data are auditable.

## Secrets

Never commit:

- database passwords
- API keys
- authentication secrets
- private certificates/keys
- payment credentials
- signing keys
- recovery credentials

Secrets must be stored using the selected provider's approved secret-management mechanism or another professionally reviewed secure mechanism.

## Environment configuration

Maintain a documented configuration inventory without exposing secret values:

| Configuration | Development | Test/Staging | Production |
|---|---|---|---|
| API endpoint | separate | separate | separate |
| Database | separate | separate | separate |
| Authentication | test | test | production |
| Payment | sandbox/test | sandbox/test | production only after approval |
| Logging | enabled | enabled | enabled |
| Monitoring | enabled | enabled | enabled |
| Backup | test | test | required |
| Real child data | prohibited unless separately approved | prohibited unless separately approved | only after required governance |

## Deployment controls

Production deployment must require:

1. tested change
2. review appropriate to change class
3. successful automated validation
4. evidence record
5. release authorization through the approved workflow

No repository workflow may silently convert a successful build into production approval.

## Database access

The application connects to the database using a restricted service identity.

Separate administrative/database migration access should be used where practical.

Direct database access from a learner, teacher, parent or ordinary client account is prohibited.

## Monitoring and health

The environment should provide:

- application health checks
- database health checks
- error monitoring
- availability monitoring
- security-event monitoring where appropriate
- alerting
- operational logs
- incident records

Monitoring data must not unnecessarily expose personal or sensitive information.

## Backup preparation

Before production launch, establish:

- backup schedule
- retention policy
- protected backup storage
- access restrictions
- restoration procedure
- restoration test
- recovery objectives
- evidence of successful restoration

## Verification gates

### 20.1-A Environment
Environment exists and is isolated from development.

### 20.1-B Security
TLS, access controls and secret management are configured and tested.

### 20.1-C Database connectivity
Only the server-side application can reach the production database.

### 20.1-D Deployment
A repeatable deployment process is demonstrated in staging.

### 20.1-E Backup/recovery
Backup and restoration procedures are demonstrated.

### 20.1-F Independent review
Required technical/security review is completed before the environment is treated as production-ready.

## Evidence required

Evidence must identify:

- environment type
- provider/service selected
- configuration version
- non-secret architecture/configuration references
- access-control test results
- deployment test results
- database connectivity test results
- backup/restore evidence
- reviewer and review date
- unresolved defects

Do not store credentials or unnecessary child data in the evidence.

## Owner decision points

The owner must separately decide:

- hosting provider
- database provider/technology
- authentication provider
- deployment model
- data-location requirements
- operational budget
- service/vendor agreements

Those decisions must not be inferred from this document.

## Boundary

This specification does not establish legal compliance, Ministry approval, production authorization, or vendor approval.

**Stage 20.1 status: PREPARED — practical provisioning and verification still required.**
