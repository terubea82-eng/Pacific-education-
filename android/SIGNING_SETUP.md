# Android release signing setup

Keep the release keystore, private key and passwords out of the repository. Configure GitHub Actions secrets KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS and KEY_PASSWORD. The unsigned workflow is validation-only; Google Play requires a properly signed release artifact.

Before upload, verify application ID, version, Play testing requirements, privacy/data-safety declarations, target audience, child-safety requirements, store listing, and the actual web content loaded by the wrapper.
