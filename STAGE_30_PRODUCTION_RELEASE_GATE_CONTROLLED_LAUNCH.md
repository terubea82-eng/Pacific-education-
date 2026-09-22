# Pacific Education — Stage 30 Production Release Gate & Controlled Launch

## Status

**Stage 30 process contract: DEFINED — production release is not authorized until every mandatory gate is independently verified and explicitly approved.**

## 1. Purpose

Stage 30 defines the controlled process for moving a verified production release from readiness review into production.

A GitHub commit, GitHub Pages deployment, successful prototype, pilot completion or owner intention does not by itself constitute production authorization.

## 2. Mandatory release gate

Before release, the release manager/owner must verify the applicable production evidence for:

- Production backend and database
- Secure authentication and session management
- Server-side authorization and verified relationships
- Hosting and infrastructure security
- Cybersecurity controls
- Privacy/data governance
- Child safeguarding
- Accessibility and supported-device testing
- Low-bandwidth/offline behavior
- Official Fiji curriculum source validation and alignment
- Controlled pilot/user testing
- Payment verification and business operations
- Monitoring, backup, recovery and incident response
- Required independent/specialist reviews
- Final owner approval

Any mandatory unresolved blocker keeps the release **BLOCKED**.

## 3. Release candidate

The production release candidate must have a unique version/commit identifier.

The release record should capture:

- Version
- Commit SHA
- Build identifier
- Configuration/version references
- Date/time
- Approved environment
- Evidence packet
- Open risks
- Approval record

Only the reviewed release candidate may be promoted.

## 4. Controlled deployment

Production deployment should use a controlled process with:

1. Verified release candidate
2. Secure deployment credentials
3. Approved production configuration
4. Database migration review where applicable
5. Deployment
6. Health checks
7. Smoke tests
8. Monitoring confirmation
9. Release confirmation

Secrets must remain outside source code and client assets.

## 5. Fail-safe launch

If health checks, smoke tests, monitoring or critical production controls fail, the launch must stop or be rolled back.

The system must not silently continue with a partially verified production configuration.

## 6. Rollback and recovery

A documented rollback/recovery procedure must exist before launch.

It should address:

- Application rollback
- Database migration rollback or forward-fix strategy
- Configuration rollback
- Failed deployment
- Service outage
- Data-integrity incident
- Security incident
- Payment inconsistency

Backups and restore procedures must have been tested before relying on them for recovery.

## 7. Initial launch monitoring

The initial production period should receive heightened monitoring for:

- Authentication failures
- Authorization violations
- API errors
- Data-integrity errors
- Synchronization failures
- Payment verification failures
- Performance problems
- Security alerts
- Privacy/safeguarding incidents
- Unexpected user-impacting behavior

Incidents must follow the approved response and escalation process.

## 8. Post-release verification

After deployment, the approved release should be rechecked in production for critical workflows.

Evidence should confirm:

- Authentication works securely
- Authorization remains enforced
- Core learning flows work
- Assessment/marks controls work
- Relationship boundaries work
- Payment status is server-verified
- Monitoring and logging operate
- Backup/recovery controls remain available

## 9. Change control

After release, material changes must not bypass the release process.

Changes affecting security, authentication, authorization, privacy, safeguarding, curriculum, payment, database structure or other critical controls require appropriate review and retesting.

## 10. Production status

The following statuses should remain distinct:

- **BLOCKED** — mandatory requirements unresolved
- **READY FOR APPROVAL** — evidence assembled and awaiting explicit approval
- **APPROVED FOR RELEASE** — owner and required reviewers have approved the identified release
- **RELEASED** — approved release deployed and post-release checks passed
- **ROLLED BACK/PAUSED** — release withdrawn or launch paused because of an identified issue

No status should be inferred solely from client-side state.

## 11. Final ownership/control principle

Production launch does not transfer Pacific Education ownership, equity, shares or platform control to technical providers, funders, infrastructure providers, distributors or other service partners unless a separate lawful agreement expressly provides otherwise.

## 12. Final release boundary

Stage 30 defines the release process; it does **not** falsely mark Pacific Education as production-ready.

Production remains **BLOCKED** until the actual mandatory evidence, required reviews and explicit owner approval are verified.

A later implementation should connect this process to the authoritative production approval gate and deployment controls rather than using a client-side flag to declare production readiness.
