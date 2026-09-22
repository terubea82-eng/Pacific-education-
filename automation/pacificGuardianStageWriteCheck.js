#!/usr/bin/env node
"use strict";

const fs = require("fs");

const evidencePath = process.argv[2] || "automation/stage-completion.json";
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));

const allowedStageIds = new Set(
  Array.from({ length: 30 }, (_, i) => i + 1)
);

const allowedClassAPaths = new Set([
  "PACIFIC_GUARDIAN_AUTOMATED_STAGE_WRITE_POLICY.md"
]);

function fail(reason) {
  console.log(JSON.stringify({ eligible: false, reason }));
  process.exit(0);
}

if (!Number.isInteger(evidence.stage) || !allowedStageIds.has(evidence.stage)) {
  fail("invalid_stage");
}

if (evidence.status !== "COMPLETE") fail("stage_not_complete");
if (evidence.testsPassed !== true) fail("required_tests_not_passed");
if (!Array.isArray(evidence.evidence) || evidence.evidence.length === 0) {
  fail("missing_evidence");
}
if (evidence.reviewStatus !== "APPROVED") fail("review_not_satisfied");
if (Number(evidence.blockingDefects) !== 0) fail("blocking_defect_present");
if (!Array.isArray(evidence.targetFiles) || evidence.targetFiles.length === 0) {
  fail("missing_target_files");
}
if (!["A", "B"].includes(evidence.changeClass)) fail("invalid_change_class");

for (const path of evidence.targetFiles) {
  if (typeof path !== "string" || path.startsWith("/") || path.includes("..")) {
    fail("unsafe_target_path");
  }
  if (evidence.changeClass === "A" && !allowedClassAPaths.has(path)) {
    fail("target_not_allowlisted_for_class_A");
  }
}

console.log(JSON.stringify({
  eligible: true,
  stage: evidence.stage,
  changeClass: evidence.changeClass,
  targetFiles: evidence.targetFiles
}));
