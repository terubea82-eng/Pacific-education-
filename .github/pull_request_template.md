## Purpose and scope
<!-- What user-visible problem does this solve? What is explicitly out of scope? -->

## Expected behaviour and failure path
- Expected behaviour:
- Failure/recovery behaviour:
- Affected files/components:
- Rollback or disable plan:

## Regression evidence
- [ ] Added/updated a test that reproduces the defect or protects the new behaviour.
- [ ] Tested a failure path (not only the happy path).
- [ ] No unrelated features or protected #856 voice files were changed.
- [ ] Offline/service-worker/cache behaviour checked if affected.
- [ ] Security, privacy, and pilot-only boundaries checked.
- [ ] Current-affairs approvals and production gates remain fail-closed where relevant.

## Required gates
- [ ] Pacedu Feature Admission Gate passed.
- [ ] Pacedu Cross-Device Browser Tests passed.
- [ ] Feature Preservation Gate passed.
- [ ] Pilot Preflight passed.
- [ ] Android debug build passed if Android/app files or shared app behaviour changed.
- [ ] Exact commit/asset cache versions reviewed.

## Device verification (required for device-sensitive changes)
- [ ] Not device-sensitive; explain why below, OR
- [ ] Physical device test completed against this exact commit/build.
- Device/model and OS:
- APK SHA-256 or build identifier:
- Steps and observed results:
- Evidence link:
- Remaining limitations:

## Owner review
- [ ] No claim of physical-device success based only on CI/browser tests.
- [ ] No credentials, private keys, keystores, or real child-sensitive data added.
- [ ] Change is focused, reversible, and documented.
