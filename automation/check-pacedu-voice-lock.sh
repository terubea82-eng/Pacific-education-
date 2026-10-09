#!/usr/bin/env bash
set -euo pipefail

# Pacific Education #856 protected voice guard.
# This script fails when protected voice files are deleted or changed.

PROTECTED=(
  "src/js/pacificEducationSpeechVoice.js"
  "src/js/pacificEducationMandatoryVoiceNavigation.js"
)

# Compare protected files to the last known-good #856 voice baseline.
# This allows unrelated commits to pass while still rejecting any content change.
BASELINE_REF="476cda0a284de6471ce3619aab0cd6b2330ea29b"
git fetch --no-tags --depth=1 origin "$BASELINE_REF"
for file in "${PROTECTED[@]}"; do
  if ! git show "${BASELINE_REF}:${file}" > "${RUNNER_TEMP:-/tmp}/pacedu-voice-baseline.tmp"; then
    echo "::error::Could not read protected baseline file at ${BASELINE_REF}: ${file}"
    exit 1
  fi
  if ! cmp -s "${RUNNER_TEMP:-/tmp}/pacedu-voice-baseline.tmp" "${file}"; then
    echo "::error::Protected Pacific Education #856 voice file differs from baseline:"
    echo "${file}"
    exit 1
  fi
done

for file in "${PROTECTED[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "::error::Protected voice file is missing: ${file}"
    exit 1
  fi
done

echo "Pacific Education #856 protected voice lock: PASS"
