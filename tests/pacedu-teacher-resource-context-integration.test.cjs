const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const downloads = fs.readFileSync("src/js/paceduSeparateDailyResourceDownloads.js", "utf8");
const workspace = fs.readFileSync("src/js/paceduTeacherTwoResourceWorkspace.js", "utf8");

test("Teacher Workspace mounts activity downloads using its selected subject and class", () => {
  assert.match(workspace, /dailyDownloadsApi\.renderControls\(dailyDownloadsHost,\{level:levelValue,subject:subject,term:dailyDownloadTerm,useSelectedContext:true\}\)/);
  assert.match(workspace, /Daily downloads and teaching aids stay linked to the selected subject and class/);
});

test("embedded daily downloads do not add duplicate subject or class selectors", () => {
  assert.match(downloads, /context\.useSelectedContext\?null:select\("Class \/ level:"/);
  assert.match(downloads, /context\.useSelectedContext\?null:select\("Subject:"/);
  assert.match(downloads, /function selectedOptions\(\)\{return \{level:context\.useSelectedContext\?context\.level:level\.value,subject:context\.useSelectedContext\?context\.subject:subject\.value/);
});

test("student, classwork and teacher downloads all use the shared selected context", () => {
  assert.match(downloads, /var o=selectedOptions\(\);learnerDownload\(o,g,commonData\(o\)\)/);
  assert.match(downloads, /var o=selectedOptions\(\);var result=weeklyBookDownload\(\{level:o\.level,subject:o\.subject,term:o\.term,week:o\.week\},g\)/);
  assert.match(downloads, /var o=selectedOptions\(\);teacherDownload\(o,f,commonData\(o\)\)/);
});

test("term-specific week limits initialise correctly and review status remains pending", () => {
  assert.match(downloads, /function updateWeeks\(\).*term\.value==="T3"\?5:9/);
  assert.match(downloads, /term\.addEventListener\("change",updateWeeks\);updateWeeks\(\)/);
  assert.match(downloads, /var rawTerm=String\(context\.term\|\|\(global\.localStorage&&global\.localStorage\.getItem\("pacificEducationTerm"\)\)\|\|"T1"\)/);
  assert.match(downloads, /"Term 1":"T1","Term 2":"T2","Term 3":"T3"/);
  assert.match(downloads, /select\("Day:"/);
  assert.match(downloads, /PENDING_TEACHER_REVIEW/);
});
