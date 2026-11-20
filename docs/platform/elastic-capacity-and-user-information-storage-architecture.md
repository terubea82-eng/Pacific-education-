# PacEdu Elastic Capacity and User Information Storage Architecture

**Status:** staging architecture recommendation; not a production capacity claim or service activation.

## Objective

PacEdu should not impose an arbitrary small global user ceiling. It should be engineered to add capacity as registered learners, teachers, institutions, countries, worksheets, submissions and library resources grow. No physical cloud service is literally unlimited; public commitments must be bounded by tested capacity, provider quotas, lawful retention, security controls and approved spending.

## Architecture requirements

1. **Stateless application tier**
   - Keep web/API application instances stateless wherever practical.
   - Store durable account, curriculum, activity, progress and entitlement records in managed data services, not process memory or one shared browser session.
   - Add application instances behind a load balancer as demand rises; use health checks, graceful draining and rolling deployment.
2. **Tenant and jurisdiction isolation**
   - Every record must carry a stable tenant/institution scope where applicable, user UID, jurisdiction and data classification.
   - Enforce authorization on the server and in database security rules. A client-supplied country, role, UID or entitlement is never authority.
   - Use indexed, scoped queries; prohibit unbounded global reads and cross-tenant data leakage.
3. **Separate data workloads**
   - Keep identity/permissions, curriculum catalogue, learner progress, worksheet submissions, audit logs, media metadata and billing records logically separated.
   - Use object storage/CDN for licensed documents, audio and video; store metadata and access policy separately.
   - Use database storage for structured records and object storage for large files. Do not store media blobs in ordinary user profile documents.
4. **Asynchronous work**
   - Put expensive worksheet generation, audio processing, bulk imports, search indexing, notifications, report generation and media transcoding onto durable queues.
   - Make jobs idempotent, retry with backoff, dead-letter failures, and expose job status. A slow background job must not block a learner answering a question.
5. **Caching and delivery**
   - Cache public, versioned curriculum metadata and approved static resources at the edge/CDN.
   - Do not publicly cache private learner records, submissions, account details or signed media URLs.
   - Use pagination, incremental sync and compression; never download the entire global catalogue to a phone.
6. **Offline-first Android**
   - Keep a small encrypted local working set for the active learner, current worksheets and unsent responses.
   - Queue writes safely with stable operation IDs; reconcile on reconnect and prevent duplicate submissions.
   - Resume at the exact activity/question; show unsynced status clearly. Do not imply that device-local drafts are backed up to the cloud.
7. **Capacity and cost controls**
   - Load-test concurrent sign-in, worksheet open/answer/save, audio playback, reconnect bursts, library search and reporting.
   - Define service objectives for latency, availability, sync delay and error rate; monitor saturation, queue age, database connections, storage growth and CDN cache hit rate.
   - Autoscale within provider quotas and pre-approved budget limits. Alert before quota or budget exhaustion; use graceful degradation rather than silently losing work.
   - Protect against bots, abuse and denial-of-service with rate limits, abuse detection and per-operation quotas that do not penalise ordinary classroom use.
8. **User information space**
   - Provide a personal workspace for notes, saved resources, bookmarks, permitted uploads and learning history.
   - Treat capacity as elastic and expandable, not a promise of infinite bytes. Publish transparent per-file limits, fair-use rules and any plan/sponsor allowance before upload.
   - Offer storage-use visibility, export, deletion and recovery options. Never silently delete learner evidence to make room.
   - Keep free learning access separate from paid storage or library entitlements; do not make essential learner progress dependent on an unexpected payment.
9. **Privacy, safety and retention**
   - Apply data minimisation, encryption in transit and at rest, least privilege, audit trails, backup/restore tests and documented retention/deletion schedules.
   - Separate children's data from public library content. Do not expose a user's saved materials or progress to other users by default.
   - Respect country-specific data residency, child-consent, access, deletion and cross-border transfer requirements before enabling a jurisdiction.
10. **Operational readiness**
    - Establish recovery point and recovery time objectives, tested backups, disaster recovery, incident response and security monitoring.
    - Use synthetic test accounts and anonymised load-test data; never stress-test production learners.
    - Roll out by feature flag to a staging cohort, compare metrics, and keep rollback available.

## Acceptance gates before claiming scalable capacity

- A documented workload model: active users, peak concurrent users, requests per second, data growth, media bandwidth and classroom reconnect bursts.
- Load and soak tests at agreed milestones (for example 1x, 2x and 5x the forecast peak), with pass/fail latency and error thresholds recorded.
- Tenant-isolation, role-permission, rate-limit, queue-retry, duplicate-write, backup-restore and offline-reconciliation tests.
- Cost forecast and hard budget alerts for database, storage, egress, media processing and AI generation.
- Provider quota confirmation and a tested scale-up procedure.
- No production launch until privacy/security review, country-specific legal review and rollback plan are approved.

## Rollout order

1. Measure current architecture and identify bottlenecks.
2. Define data ownership, tenant boundaries, indexes and retention.
3. Move media and large attachments to controlled object storage/CDN.
4. Add queues for expensive and non-interactive tasks.
5. Add metrics, alerts, rate limiting, backup/restore and cost controls.
6. Load-test staging, fix bottlenecks, and repeat.
7. Expand capacity in measured increments; do not change production or learner data without explicit release approval.

## Relationship to the curriculum and worksheet priority

This architecture supports the user's requested order: complete and validate the curriculum indicator bank and 115-day class/subject distributions first; complete accessible, indicator-linked worksheets and teacher guides second; build the separate Global Library third; then expand personal workspace storage and global user capacity. The library and storage features must not delay core worksheet delivery or weaken curriculum, child-safety or privacy gates.
