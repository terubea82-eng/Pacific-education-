const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("breathing guide activates for a sequential teacher workspace and final sign-out", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded", timeout: 60000 });
  await expect.poll(() => page.evaluate(() => window.PacificEducationBreathingFocusGuide?.version), { timeout: 8000 }).toBe("1.2.0-mandatory-fields");

  await page.evaluate(() => {
    try {
      sessionStorage.setItem("pacificEducationPilotRegistered", "true");
      sessionStorage.setItem("pacificEducationPilotRole", "teacher");
      sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({ name: "Pilot Teacher", role: "teacher", pilotOnly: true }));
    } catch (_) {}
    window.PacificEducationSequentialRoleWorkspaces.build("teacher");
    // This test targets the guide inside the workspace. Exit the entry-only
    // registration route after creating the workspace fixture so route-isolation
    // CSS does not intentionally keep the workspace hidden.
    document.body.classList.remove("pacedu-entry-mode");
    const entryPage = document.querySelector(".pacedu-entry-page");
    if (entryPage) entryPage.hidden = true;
    const registrationPage = document.getElementById("pacificEducationIdentityRegistration");
    if (registrationPage) registrationPage.hidden = true;
    const shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    if (shell) {
      shell.hidden = false;
      shell.style.display = "block";
      shell.removeAttribute("aria-hidden");
    }
  });

  const workspace = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(workspace).toBeVisible();
  // A workspace page may be informational and have no unfinished user
  // controls. In that case the correct guidance is a green breathing Next,
  // not a blue action box. Require one of those two states.
  await expect.poll(() => page.evaluate(() => {
    const shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    if (!shell) return false;
    const blue = shell.querySelectorAll(".pacific-breathing-focus").length;
    const next = document.getElementById("peSequentialNext");
    const green = !!(next && next.classList.contains("pacific-next-breathing-ready"));
    return blue === 1 || green;
  }), { timeout: 8000 }).toBe(true);
  const firstPageGuidance = await page.evaluate(() => {
    const shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    const next = document.getElementById("peSequentialNext");
    return {
      blueActionCount: shell ? shell.querySelectorAll(".pacific-breathing-focus").length : 0,
      nextReady: !!(next && next.classList.contains("pacific-next-breathing-ready"))
    };
  });
  expect(firstPageGuidance.blueActionCount === 1 || firstPageGuidance.nextReady).toBe(true);

  // The guided sequence must reach a dedicated final Sign Out page and visually guide it.
  await page.evaluate(() => {
    const next = document.getElementById("peSequentialNext");
    const title = document.getElementById("peSequentialTitle");
    let guard = 0;
    while (next && title && !/Sign Out/.test(title.textContent) && guard++ < 30) {
      if (next.disabled) {
        const answers = document.querySelectorAll("#peSequentialPage input[data-pe-cap-answer]");
        answers.forEach(input => { input.value = input.getAttribute("data-pe-cap-answer"); input.dispatchEvent(new Event("input", { bubbles: true })); });
        const submit = Array.from(document.querySelectorAll("#peSequentialPage button")).find(button => /Submit Test/.test(button.textContent));
        if (submit) submit.click();
      }
      if (!next.disabled) next.click();
      else break;
    }
  });
  await expect(page.locator("#peSequentialTitle")).toContainText("Sign Out");
  await expect(page.locator("#peSequentialSignOutButton")).toBeVisible();
  await expect.poll(() => page.locator("#peSequentialSignOutButton.pacific-breathing-focus").count(), { timeout: 5000 }).toBe(1);
  await expect(page.locator("#peSequentialSignOutButton")).toContainText("Sign Out");
  expect(errors, "uncaught JavaScript errors").toEqual([]);
});
