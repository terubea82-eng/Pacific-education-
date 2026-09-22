#!/usr/bin/env node
"use strict";

const fs = require("fs");

const evidencePath = process.argv[2] || "automation/stage-completion.json";
const configPath = process.argv[3] || "automation/stage-allowlist.json";

const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function fail(reason, extra = {}) {
  console.log(JSON.stringify({ eligible: false, reason, ...extra }));
  process.exit(0);
}

if (!Number.isInteger(evidence.stage) || evidence.stage < 1 || evidence.stage > 30) {
  fail("invalid_stage");
}

const stageConfig = config.stages && config.stages[String(evidence.stage)];
if (!stageConfig) fail("stage_configuration_missing");

if (evidence.status !== "COMPLETE") fail("stage_not_complete");
if (evidence.testsPassed !== true) fail("required_tests_not_passed");
if (!Array.isArray(evidence.evidence) || evidence.evidence.length === 0) {
  fail("missing_evidence");
}
if (evidence.reviewStatus !== "APPROVED") fail("review_not_satisfied");
if (
  typeof evidence.completionAuthority !== "string" ||
  !evidence.completionAuthority.trim()
) {
  fail("completion_authority_missing");
}
if (Number(evidence.blockingDefects) !== 0) fail("blocking_defect_present");
if (!Array.isArray(evidence.targetFiles) || evidence.targetFiles.length === 0) {
  fail("missing_target_files");
}

if (evidence.changeClass !== stageConfig.changeClass) {
  fail("change_class_mismatch");
}

const allowlistedTargets = new Set(stageConfig.allowlistedTargets || []);
for (const path of evidence.targetFiles) {
  if (
    typeof path !== "string" ||
    path.startsWith("/") ||
    path.includes("..")
  ) {
    fail("unsafe_target_path");
  }
  if (!allowlistedTargets.has(path)) {
    fail("target_not_allowlisted_for_stage");
  }
}

const autoWrite = stageConfig.autoWrite === true;
const result = {
  eligible: true,
  stage: evidence.stage,
  stageName: stageConfig.name,
  changeClass: stageConfig.changeClass,
  autoWrite,
  reviewRequired: stageConfig.reviewRequired,
  requiredEvidenceType: stageConfig.requiredEvidenceType,
  targetFiles: evidence.targetFiles
};

if (!autoWrite) {
  result.action = stageConfig.changeClass === "C"
    ? "REVIEW_ONLY_PROTECTED"
    : "REVIEW_REQUIRED";
}

console.log(JSON.stringify(result));
