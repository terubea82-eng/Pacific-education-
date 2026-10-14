const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("student registration handoff shows workspace navigation and daily activities", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({
        name: "Pilot Test Learner",
        role: "Student",
        country: "Fiji",
        language: "en-AU"
      }));
      sessionStorage.setItem("pacificEducationPilotRegistered", "true");
      sessionStorage.setItem("pacificEducationPilotRole", "Student");
    } catch (_) {}
  });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() =>
    typeof window.PacificEducationSequentialRoleWorkspaces?.build
  ), { timeout: 10000 }).toBe("function");

  await page.evaluate(() => window.PacificEducationSequentialRoleWorkspaces.build("student"));

  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(shell).toBeVisible();
  await expect(shell.locator("#peSequentialTitle")).toContainText("Student Workspace");
  await expect(shell.locator("#peSequentialBack")).toBeVisible();
  await expect(shell.locator("#peSequentialNext")).toBeVisible();
  await expect(shell.locator("#peSequentialHear")).toBeVisible();

  // Complete the first capability check, then advance through the student
  // sequence to the real Daily Activities page. The test checks rendered UI,
  // not merely that source files contain expected CSS strings.
  await expect(shell.locator("[data-pe-cap-answer]")).toHaveCount(3);
  await shell.locator('[data-pe-cap-answer="a"]').fill("a");
  await shell.locator('[data-pe-cap-answer="5"]').fill("5");
  await shell.locator('[data-pe-cap-answer="cat"]').fill("cat");
  await shell.getByRole("button", { name: /Submit Test/ }).click();
  await shell.locator("#peSequentialNext").click();
  await shell.locator("#peSequentialNext").click();

  // The following selector/context steps are sequential and should advance
  // only after their own pages are displayed.
  for (let i = 0; i < 4; i += 1) {
    const next = shell.locator("#peSequentialNext");
    if (await next.isDisabled()) {
      const selects = shell.locator("#peSequentialPage select");
      const count = await selects.count();
      for (let j = 0; j < count; j += 1) {
        const select = selects.nth(j);
        const options = await select.locator("option").evaluateAll(nodes =>
          nodes.map(node => node.value).filter(Boolean)
        );
        if (options.length) await select.selectOption(options[0]).catch(() => {});
      }
    }
    await expect(next).toBeVisible();
    await next.click();
  }

  await expect(shell.locator("#peStudentDailyActivityStarter")).toBeVisible();
  await expect(shell.locator("#peStudentDailySubject")).toBeVisible();
  await expect(shell.locator("#peStudentDailyComplete")).toBeVisible();
  await expect(shell.locator("#peSequentialBack")).toBeVisible();
  await expect(shell.locator("#peSequentialNext")).toBeVisible();
});
