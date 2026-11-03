"use strict";

const PACEDU_SUBJECTS = Object.freeze([
  "English",
  "Mathematics",
  "Phonics",
  "Science",
  "Social Science",
  "Health",
  "Agriculture",
  "Arts",
  "Technology",
  "Home Economics",
  "Computer Studies",
  "Vosa Vakaviti (iTaukei)",
  "Fiji Hindi",
  "Urdu",
  "Rotuman"
]);

const CURRICULUM_LEVELS = Object.freeze([
  "ECE",
  ...Array.from({ length: 8 }, (_, index) => "Class " + (index + 1)),
  ...Array.from({ length: 5 }, (_, index) => "Form " + (index + 3))
]);

function mapCurrentAffairsSubjects(text) {
  const value = String(text || "").toLowerCase();
  const subjects = [];
  if (/literacy|reading|language|english|teacher|school|education|learning/.test(value)) subjects.push("English");
  if (/phonics|phoneme|grapheme|letter sounds?/.test(value)) subjects.push("Phonics");
  if (/math|mathematics|number|data|statistics/.test(value)) subjects.push("Mathematics");
  if (/science|climate|environment|disaster|pandemic|marine|ocean|biodiversity|wildlife|energy|water/.test(value)) subjects.push("Science");
  if (/health|disease|medicine|medical|diagnostic|donor|vaccine|vaccination|cancer|malaria|obesity|nutrition|healthcare|maternal|reproductive|cholera|public health/.test(value)) subjects.push("Health");
  if (/technology|engineering|design|innovation|manufacturing/.test(value)) subjects.push("Technology");
  if (/digital|internet|computer|artificial intelligence|\\bai\\b/.test(value)) subjects.push("Computer Studies");
  if (/agriculture|farming|farmers|crops?|soil|livestock|fisheries|fishing/.test(value)) subjects.push("Agriculture");
  if (/community|society|government|poverty|displacement|children|child rights|humanitarian|aid|conflict|war|gaza|sudan|sustainable development|development gap|food security|hunger|cities|goals|migration|place|country|history|heritage|economy|economic|business|trade|exports|jobs|employment|parliament|law|court|election|transport|infrastructure|tourism|budget|tax|public service|housing|roads?|sport|athlete/.test(value)) subjects.push("Social Science");
  if (/\\barts?\\b|artwork|music|dance|craft|performance|culture|heritage/.test(value)) subjects.push("Arts");
  if (/home economics|food preparation|sewing|household management/.test(value)) subjects.push("Home Economics");
  if (/vosa vakaviti|itaukei|i-taukei/.test(value)) subjects.push("Vosa Vakaviti (iTaukei)");
  if (/fiji hindi|hindustani/.test(value)) subjects.push("Fiji Hindi");
  if (/\\burdu\\b/.test(value)) subjects.push("Urdu");
  if (/\\brotuman\\b/.test(value)) subjects.push("Rotuman");
  if (!subjects.length) subjects.push("Social Science");
  return [...new Set(subjects)];
}

function applicableLevels(text) {
  const value = String(text || "").toLowerCase();
  const concrete = /children|school|education|food|water|farming|agriculture|soil|animal|wildlife|marine life|ocean|community|weather|health|blood donor|nutrition|environment|culture|sport/.test(value);
  const specialist = /diagnostic|diagnostics|coalition|policy|governance|diplomacy|conflict|war|humanitarian|economic|economy|research|data|traditional medicine|global development|leadership|sustainable development|technology|artificial intelligence|displacement|reproductive health/.test(value);
  if (concrete && !specialist) return CURRICULUM_LEVELS.slice(0, 7); // ECE–Class 6
  if (specialist) return CURRICULUM_LEVELS.slice(4); // Class 4–Form 7
  return CURRICULUM_LEVELS.slice(3); // Class 3–Form 7
}

function canPreserveTeacherApproval(item) {
  if (!item || item.approved !== true ||
      item.verificationStatus !== "APPROVED_BY_TEACHER" ||
      item.levelRecommendationBasis !== "TEACHER_REVIEWED") return false;
  return Array.isArray(item.subjectsApplicable) && item.subjectsApplicable.length > 0 &&
    item.subjectsApplicable.every(subject => PACEDU_SUBJECTS.includes(subject)) &&
    Array.isArray(item.levelsApplicable) && item.levelsApplicable.length > 0 &&
    item.levelsApplicable.every(level => CURRICULUM_LEVELS.includes(level));
}

module.exports = {
  PACEDU_SUBJECTS,
  CURRICULUM_LEVELS,
  mapCurrentAffairsSubjects,
  applicableLevels,
  canPreserveTeacherApproval
};
