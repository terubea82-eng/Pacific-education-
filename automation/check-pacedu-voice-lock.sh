#!/usr/bin/env bash
set -euo pipefail

# Pacific Education #856 protected voice guard.
# This script fails when protected voice files are deleted or changed.

PROTECTED=(
  "src/js/pacificEducationSpeechVoice.js"
  "src/js/pacificEducationMandatoryVoiceNavigation.js"
)

if [[ -n "${GITHUB_EVENT_NAME:-}" && "${GITHUB_EVENT_NAME}" == "pull_request" ]]; then
  BASE="${GITHUB_BASE_REF:-main}"
  git fetch --no-tags --depth=1 origin "${BASE}"
  RANGE="origin/${BASE}...HEAD"
else
  RANGE="HEAD^...HEAD"
fi

CHANGED="$(git diff --name-only "${RANGE}" -- "${PROTECTED[@]}" || true)"

if [[ -n "${CHANGED}" ]]; then
  echo "::error::Protected Pacific Education #856 voice files were changed:"
  printf '%s\n' "${CHANGED}"
  echo "::error::Use additive changes around the protected voice baseline. Do not replace the #856 controller."
  exit 1
fi

for file in "${PROTECTED[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "::error::Protected voice file is missing: ${file}"
    exit 1
  fi
done

echo "Pacific Education #856 protected voice lock: PASS"
