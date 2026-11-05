const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher dashboard shows the teaching-aid gate and blocks an activity with missing aids", async ({ page }) => {
  await page.route("**/src/index.html*", route => route.fulfill({
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"></head><body><main><section id=\"teacherDashboard\" aria-label=\"Teacher Daily Activities\"></section></main></body></html>"
  }));
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  // Load only the two test-branch scripts into an isolated dashboard fixture.
  await page.addScriptTag({ url: "./js/paceduTeachingAidQualityGate.js" });
  await page.addScriptTag({ url: "./js/paceduTeachingAidQualityGateTestUI.js" });

  const panel = page.locator("#paceduTeachingAidGateTest");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Teaching-Aid Quality Gate — TEST" })).toBeVisible();

  const input = panel.locator("#paceduTeachingAidGateJson");
  await expect(input).toBeVisible();
  await expect(panel.getByRole("button", { name: "Check Activity Package", exact: true })).toBeVisible();

  // The supplied sample intentionally has no teaching aids and an unverified source.
  await panel.getByRole("button", { name: "Check Activity Package", exact: true }).click();

  const output = panel.locator("#paceduTeachingAidGateOutput");
  await expect(output).toContainText("Status: PENDING_TEACHING_AID");
  await expect(output).toContainText("At least one relevant teaching aid");
  await expect(output).toContainText("Blocked. Complete the listed requirements before teacher review.");
  await expect(output).toContainText("READY_FOR_TEACHER_REVIEW is not Ministry approval or automatic student release.");
});
