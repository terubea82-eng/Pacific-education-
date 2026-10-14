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


test("mandatory fields block the green Next cue while optional fields do not", async ({ page }) => {
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
    document.body.classList.remove("pacedu-entry-mode");
    const entry = document.querySelector(".pacedu-entry-page");
    if (entry) entry.hidden = true;
    const registration = document.getElementById("pacificEducationIdentityRegistration");
    if (registration) registration.hidden = true;
    const shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    const page = document.getElementById("peSequentialPage");
    if (shell) { shell.hidden = false; shell.style.display = "block"; shell.removeAttribute("aria-hidden"); }
    if (page) {
      // Make the active page and every ancestor genuinely visible. The
      // runtime guide checks computed visibility, not only the page's own
      // hidden/aria-hidden flags, so route CSS on a wrapper can otherwise
      // leave the fixture unreachable.
      let node = page;
      while (node && node !== document.body) {
        node.hidden = false;
        node.removeAttribute("hidden");
        node.removeAttribute("aria-hidden");
        node.style.removeProperty("display");
        node.style.removeProperty("visibility");
        node = node.parentElement;
      }
      page.style.display = "block";
      page.style.visibility = "visible";
      page.innerHTML = '<label for="mandatoryProbe">Required code</label><input id="mandatoryProbe" required pattern="[A-Z]{3}" value="bad"><label for="optionalProbe">Optional note</label><input id="optionalProbe">';
    }
    // Re-run after layout has applied the visibility changes and explicitly
    // verify that the required control is visible before checking guidance.
    window.PacificEducationBreathingFocusGuide.refresh();
  });
  await expect.poll(() => page.evaluate(() => { const input = document.getElementById("mandatoryProbe"); const page = document.getElementById("peSequentialPage"); return !!((input && input.classList.contains("pacific-breathing-focus")) || (page && page.querySelector(".pacific-breathing-focus")) || (input && input.closest(".pacific-breathing-focus"))); })).toBe(true);
  await expect(page.locator("#peSequentialNext")).not.toHaveClass(/pacific-next-breathing-ready/);
  const pageTitleBeforeInvalidNext = await page.locator("#peSequentialTitle").textContent();
  await page.locator("#peSequentialNext").evaluate(button => button.click());
  await expect(page.locator("#peSequentialTitle")).toHaveText(pageTitleBeforeInvalidNext);
  await expect(page.locator("#mandatoryProbe")).toBeVisible();
  await page.locator("#mandatoryProbe").fill("ABC");
  await page.evaluate(() => window.PacificEducationBreathingFocusGuide.refresh());
  await expect(page.locator("#peSequentialNext")).toHaveClass(/pacific-next-breathing-ready/);
  await expect(page.locator("#optionalProbe")).toHaveValue("");
});
