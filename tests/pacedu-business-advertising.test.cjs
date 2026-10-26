const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const page = fs.readFileSync("src/business-advertising.html", "utf8");
const script = fs.readFileSync("src/js/paceduBusinessAdvertising.js", "utf8");

test("business advertising page explains the pilot and does not claim live payment processing", () => {
  for (const phrase of ["Business & Product Advertising", "not publish an advert", "no payment is currently processed here"]) {
    assert.ok(page.includes(phrase), "missing page safeguard: " + phrase);
  }
  assert.match(page, /paceduBusinessAdvertising\.js\?v=/);
});

test("business draft form validates web links and remains local-only", () => {
  assert.match(script, /new URL\(value\)/);
  assert.match(script, /parsed\.protocol !== "https:" && parsed\.protocol !== "http:"/);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /PENDING_OWNER_REVIEW/);
  assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|paymentIntent|stripe\.confirm/);
});

test("revenue estimator is local-only, starts at zero and excludes payment processing", () => {
  for (const id of ["estimateStarter", "estimateGrowth", "estimateProfessional", "estimateEnterprise", "estimateMonthlyRevenue", "estimateAnnualRevenue"]) {
    assert.ok(page.includes('id="' + id + '"'), "missing estimator element: " + id);
  }
  assert.match(page, /planning estimate only/);
  assert.match(script, /estimateFields/);
  assert.match(script, /monthly \* 12/);
  assert.match(page, /does not collect data or process payments/);
});

test("advertising page is easy to find from the welcome screen and app menu without entering student activities", () => {
  const repair = fs.readFileSync("src/js/pacificEducationFutureSafeFeatureRepair.js", "utf8");
  const index = fs.readFileSync("src/index.html", "utf8");
  assert.match(repair, /pacificEducationWelcomeAdvertisingLink/);
  assert.ok(index.includes("pacificEducationFutureSafeFeatureRepair.js?v=20261026-advertising-visibility"));
  assert.match(repair, /pacificEducationWelcomeAdvertisingButton/);
  assert.match(repair, /View Advertising Page/);
  assert.ok(repair.includes("./business-advertising.html"));
  assert.match(repair, /peBusinessAdvertisingMenuLink/);
  assert.ok(repair.includes("without inserting"));
  assert.ok(repair.includes("student activity pages"));
});

test("sponsor and donor leads are clearly prospective and protected from commercial influence", () => {
  for (const phrase of [
    "Sponsors, donors & education partners",
    "No organisation listed below is a confirmed PacEdu sponsor or partner",
    "Prospective lead · not a partner",
    "do not transfer PacEdu ownership, equity, voting rights, management control or intellectual property",
    "student personal information for sponsorship or advertising"
  ]) {
    assert.ok(page.includes(phrase), "missing sponsor safeguard: " + phrase);
  }
  for (const url of [
    "https://www.vodafone.com.fj/foundation",
    "https://www.westpac.com.fj/contact-us/sponsorship/",
    "https://www.fijiwaterfoundation.org/",
    "https://www.fmf.com.fj/solutions-1"
  ]) {
    assert.ok(page.includes(url), "missing official prospective funding link: " + url);
  }
  assert.match(page, /target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /assessment, student marks and teacher decisions/);
});
