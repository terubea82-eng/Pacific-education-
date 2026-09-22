# Pacific Education — Stage 22 Production Hosting, Infrastructure & Deployment Security

## Status

**Stage 22 architecture contract: DEFINED — production infrastructure implementation and independent verification required.**

This document defines the production hosting boundary. GitHub Pages remains a prototype/public demonstration host and is not the production backend security boundary.

## 1. Production hosting boundary

Production services must run in an environment capable of securely hosting:

- Web application/PWA
- Production API
- Authentication integration
- Production database
- Background/synchronization services
- Audit and monitoring services
- Payment verification services where applicable

The production environment must separate public client assets from protected server-side services.

## 2. Environment separation

At minimum, maintain separate:

- Development
- Test/staging
- Production

Production credentials, databases, secrets and service endpoints must not be reused casually in development or prototype environments.

Prototype data must not be promoted into production without an approved migration and validation process.

## 3. HTTPS and network protection

Production traffic must use encrypted transport.

Required controls include:

- HTTPS/TLS
- Secure API endpoints
- Firewall/network access controls
- Restricted database network access
- Administrative access restrictions
- Appropriate rate limiting and abuse protection
- No direct public database access

TLS certificates and infrastructure credentials must be managed securely and renewed before expiry.

## 4. Secrets management

Secrets must not be committed to GitHub.

Examples include:

- Database credentials
- API keys
- Authentication secrets
- Encryption keys
- Payment-provider secrets
- Cloud credentials
- Signing keys

Use a production secret-management mechanism with restricted access, rotation and auditability.

## 5. Deployment security

Production deployment must use a controlled pipeline.

Required safeguards include:

1. Version-controlled source
2. Automated tests
3. Dependency/security checks
4. Build verification
5. Staging validation
6. Owner-approved release
7. Production deployment
8. Post-deployment health checks
9. Rollback capability

A successful build alone does not mean the system is production-approved.

## 6. Least privilege

Infrastructure accounts and services must receive only the permissions necessary for their function.

Separate privileges should exist for:

- Application runtime
- Database access
- Deployment
- Monitoring
- Support
- Security administration
- Owner/release approval

Service-to-service credentials must be scoped and rotated.

## 7. Availability and recovery

Production infrastructure should provide:

- Health monitoring
- Error monitoring
- Alerting
- Backup integration
- Capacity monitoring
- Documented incident response
- Recovery procedures
- Rollback capability

Availability targets and recovery objectives must be defined before production approval.

## 8. Logging and monitoring

Monitor security and operational events including:

- Authentication failures
- Authorization failures
- Unusual request patterns
- Server errors
- Deployment events
- Administrative actions
- Database/service health
- Payment verification failures where applicable

Logs must avoid unnecessary child personal information and secrets.

## 9. Dependency and patch management

Production dependencies must be inventoried and maintained.

Required controls include:

- Dependency vulnerability scanning
- Timely security updates
- Removal of unnecessary packages
- Lockfiles/version control where appropriate
- Review of high-risk vulnerabilities
- Documented exceptions

## 10. Backup and disaster recovery

Production backups must be:

- Automated
- Access-controlled
- Encrypted where appropriate
- Retained according to approved policy
- Tested through restoration

Disaster recovery must be tested rather than assumed.

## 11. Deployment failure behavior

If deployment validation fails:

- Do not release the affected build.
- Preserve the last known-good production version.
- Record the failure.
- Fix and retest before retrying.

If a production dependency becomes unavailable, protected operations must fail safely rather than bypassing authentication, authorization or verification.

## 12. Required Stage 22 evidence

Stage 22 should not be marked implementation-complete until evidence exists for:

- Production hosting environment provisioned
- Development/test/production separation
- HTTPS/TLS configuration verified
- Network restrictions verified
- Database not publicly exposed
- Secrets management verified
- CI/CD deployment controls verified
- Rollback tested
- Monitoring and alerting tested
- Dependency/security scanning active
- Backup and restore verified
- Incident/recovery procedures documented
- Production-like deployment test passed

## 13. Release boundary

Stage 22 does not authorize production publication.

The production approval gate remains fail-closed until hosting, backend, authentication, database, security, privacy, safeguarding, accessibility, curriculum validation, payment verification and required reviews are complete.
