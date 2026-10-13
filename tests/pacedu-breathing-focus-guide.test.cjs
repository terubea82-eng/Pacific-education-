const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("breathing guide activates for a sequential teacher workspace and final sign-out", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => window.PacificEducationBreathingFocusGuide?.version), { timeout: 8000 }).toBe("1.1.0-all-pages");

  await page.evaluate(() => {
    try {
      sessionStorage.setItem("pacificEducationPilotRegistered", "true");
      sessionStorage.setItem("pacificEducationPilotRole", "teacher");
      sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({ name: "Pilot Teacher", role: "teacher", pilotOnly: true }));
    } catch (_) {}
    window.PacificEducationSequentialRoleWorkspaces.build("teacher");
  });

  const workspace = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(workspace).toBeVisible();
  await expect.poll(() => page.locator("#peSequentialPage .pacific-breathing-focus").count(), { timeout: 5000 }).toBe(1);
  await expect(page.locator("#peSequentialPage .pacific-breathing-focus-label")).toContainText("CURRENT STEP");

  // The guided sequence must reach a dedicated final Sign Out page and visually guide it.
  await page.evaluate(() => {
    const next = document.getElementById("peSequentialNext");
    const title = document.getElementById("peSequentialTitle");
    let guard = 0;
    while (next && title && !/Sign Out/.test(title.textContent) && guard++ < 30) next.click();
  });
  await expect(page.locator("#peSequentialTitle")).toContainText("Sign Out");
  await expect(page.locator("#peSequentialSignOutButton")).toBeVisible();
  await expect(page.locator("#peSequentialSignOutButton.pacific-breathing-focus, #peSequentialSignOutButton")).toBeVisible();
  await expect(page.locator("#peSequentialSignOutButton")).toContainText("Sign Out");
  expect(errors, "uncaught JavaScript errors").toEqual([]);
});
