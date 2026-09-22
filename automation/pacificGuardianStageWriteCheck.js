#!/usr/bin/env node
"use strict";

const fs = require("fs");

const evidencePath = process.argv[2] || "automation/stage-completion.json";
const configPath = process.argv[3] || "automation/stage-allowlist.json";
const requirementsPath = process.argv[4] || "automation/stage-evidence-requirements.json";
const mappingPath = process.argv[5] || "automation/STAGE_20_EVIDENCE_MAPPING.md";
const extensionAssessmentPath = process.argv[6] || "automation/extension-need-assessment.json";

const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const requirements = JSON.parse(fs.readFileSync(requirementsPath, "utf8"));
const mapping = evidence.stage === 20 ? fs.readFileSync(mappingPath, "utf8") : "";
const extensionAssessment = fs.existsSync(extensionAssessmentPath) ? JSON.parse(fs.readFileSync(extensionAssessmentPath, "utf8")) : null;
const repoRoot = process.cwd();

function fail(reason, extra = {}) {
  console.log(JSON.stringify({ eligible: false, reason, ...extra }));
  process.exit(0);
}

if (!Number.isInteger(evidence.stage) || evidence.stage < 1 || evidence.stage > 36) {
  fail("invalid_stage");
}

const stageConfig = config.stages && config.stages[String(evidence.stage)];
const stageRequirements = requirements.stages && requirements.stages[String(evidence.stage)];
if (!stageConfig) fail("stage_configuration_missing");
if (!stageRequirements) fail("stage_evidence_requirements_missing");

if (evidence.stage > 30) {
  if (!extensionAssessment) fail("extension_need_assessment_missing");
  if (extensionAssessment.defaultDecision !== "NO_EXTENSION_REQUIRED") fail("invalid_extension_default_decision");
  if (extensionAssessment.prohibitedTrigger !== "Time elapsed alone must never activate an extension.") fail("invalid_extension_time_trigger_rule");
  if (extensionAssessment.decision !== "EXTENSION_REQUIRED") fail("extension_not_activated_by_need_assessment");
  if (!Array.isArray(extensionAssessment.relevantExtensionStages) ||
      !extensionAssessment.relevantExtensionStages.includes(evidence.stage)) {
    fail("extension_stage_not_relevant_to_need_assessment");
  }
}
if (typeof stageConfig.implementationSpec !== "string" || !stageConfig.implementationSpec.trim()) fail("implementation_spec_missing");
if (!fs.existsSync(`${repoRoot}/${stageConfig.implementationSpec}`)) fail("implementation_spec_file_missing", { implementationSpec: stageConfig.implementationSpec });

if (evidence.status !== "COMPLETE") fail("stage_not_complete");
if (evidence.testsPassed !== true) fail("required_tests_not_passed");
if (!Array.isArray(evidence.evidence) || evidence.evidence.length === 0) {
  fail("missing_evidence");
}

const requiredEvidence = stageRequirements.requiredEvidence || [];
if (evidence.stage === 20) {
  if (!mapping.trim()) fail("stage_20_evidence_mapping_missing");
  for (const requirement of requiredEvidence) {
    if (!mapping.includes(requirement)) fail("stage_20_evidence_mapping_incomplete", { missingRequirement: requirement });
  }
}
const evidenceRecords = evidence.evidence.filter(item => item && typeof item === "object");
if (evidenceRecords.length !== evidence.evidence.length) fail("invalid_evidence_record");
if (requiredEvidence.length === 0) fail("stage_has_no_required_evidence");
for (const requirement of requiredEvidence) {
  const match = evidenceRecords.find(item =>
    item.requirement === requirement &&
    item.status === "VERIFIED" &&
    typeof item.verifiedBy === "string" && item.verifiedBy.trim() &&
    typeof item.verifiedAt === "string" && item.verifiedAt.trim()
  );
  if (!match) fail("required_evidence_not_verified", { missingRequirement: requirement });
}

if (typeof evidence.evidenceType !== "string" || evidence.evidenceType !== stageConfig.requiredEvidenceType) {
  fail("evidence_type_mismatch");
}
if (
  typeof evidence.completionAuthority !== "string" ||
  !evidence.completionAuthority.trim()
) {
  fail("completion_authority_missing");
}
if (evidence.completionAuthority !== stageRequirements.completionAuthority) {
  fail("completion_authority_mismatch");
}
if (evidence.reviewStatus !== "APPROVED") fail("review_not_satisfied");
if (evidence.reviewType !== stageConfig.reviewRequired) fail("review_type_mismatch");
if (Number(evidence.blockingDefects) !== 0) fail("blocking_defect_present");
if (!Array.isArray(evidence.targetFiles) || evidence.targetFiles.length === 0) {
  fail("missing_target_files");
}

if (evidence.changeClass !== stageConfig.changeClass) {
  fail("change_class_mismatch");
}

const allowlistedTargets = new Set(stageConfig.allowlistedTargets || []);
if (!allowlistedTargets.has(stageConfig.implementationSpec)) fail("implementation_spec_not_allowlisted");
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
  targetFiles: evidence.targetFiles,
  implementationSpec: stageConfig.implementationSpec,
  nextStage: stageConfig.nextStage ?? null
};

if (!autoWrite) {
  result.action = stageConfig.changeClass === "C"
    ? "REVIEW_ONLY_PROTECTED"
    : "REVIEW_REQUIRED";
}

console.log(JSON.stringify(result));
