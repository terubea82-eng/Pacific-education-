const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";
const deviceURL = process.env.PACEDU_DEVICE_TEST_URL || "http://127.0.0.1:4173/src/device-test.html";

async function installSpeechHarness(page) {
  await page.addInitScript(() => {
    const calls = [];
    class FakeUtterance {
      constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.volume = 1; this.voice = null; }
    }
    const voices = [
      { name: "Test English Australia Voice", lang: "en-AU", default: true },
      { name: "Test English UK Voice", lang: "en-GB", default: false }
    ];
    const synth = {
      speaking: false,
      pending: false,
      paused: false,
      cancel() { this.speaking = false; },
      resume() {},
      getVoices() { return voices; },
      speak(utterance) {
        calls.push({ text: utterance.text, lang: utterance.lang, volume: utterance.volume, voice: utterance.voice ? utterance.voice.name : null });
        this.speaking = true;
        setTimeout(() => {
          this.speaking = false;
          if (typeof utterance.onstart === "function") utterance.onstart();
          if (typeof utterance.onend === "function") utterance.onend();
        }, 10);
      }
    };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
    window.__paceduSpeechCalls = calls;
  });
}

async function installMutationObserverWatchdog(page) {
  await page.addInitScript(() => {
    const NativeMutationObserver = window.MutationObserver;
    window.__paceduObserverRunaways = [];
    window.MutationObserver = class PaceduObservedMutationObserver extends NativeMutationObserver {
      constructor(callback) {
        let callbacks = 0;
        const started = Date.now();
        const stack = new Error("MutationObserver created here").stack;
        super((records, observer) => {
          callbacks += 1;
          if (callbacks > 100 && Date.now() - started < 3000) {
            window.__paceduObserverRunaways.push(stack || "unknown observer source");
            console.error("[PACEDU OBSERVER RUNAWAY] " + (stack || "unknown observer source"));
            observer.disconnect();
            return;
          }
          callback(records, observer);
        });
      }
    };
  });
}

test("first Welcome page stays isolated during startup with no legacy-page flicker", async ({ page }) => {
  await installSpeechHarness(page);
  await page.addInitScript(() => {
    window.__paceduStartupPageLeaks = [];
    const selectors = [
      "#pacificEducationWelcome", "#paceduPageVision", "#paceduPageRules", "#pacificEducationIdentityRegistration",
      "#prototypeAccess", "#levelSelection", "#subjectSelection", "#termSelection",
      "#capabilitySelection", "#dailyLesson", "#dailyLessonPracticeStage", "#assessments",
      "#teacherCalendarSection", "#learningPlatform"
    ];
    const inspect = () => {
      if (document.documentElement.getAttribute("data-pacedu-navigation-ready") === "true") return;
      const visible = selectors.filter(selector => {
        const node = document.querySelector(selector);
        if (!node) return false;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" &&
          rect.width > 0 && rect.height > 0;
      });
      if (visible.length) window.__paceduStartupPageLeaks.push(visible);
    };
    const observer = new MutationObserver(inspect);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["class", "style", "hidden", "aria-hidden", "data-pe-flow-step",
        "data-pac-edu-entry-page", "data-pacedu-navigation-ready"]
    });
    document.addEventListener("DOMContentLoaded", inspect, { once: true });
    window.__paceduStartupPageObserver = observer;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "load" });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-pacedu-navigation-ready", "true");
  await page.waitForTimeout(1400);
  const leaks = await page.evaluate(() => window.__paceduStartupPageLeaks || []);
  expect(leaks, "legacy pages must stay hidden until the Welcome route is initialized").toEqual([]);
  for (const selector of [
    "#paceduPageVision", "#paceduPageRules", "#pacificEducationIdentityRegistration",
    "#prototypeAccess", "#levelSelection", "#subjectSelection", "#termSelection",
    "#capabilitySelection", "#dailyLesson", "#dailyLessonPracticeStage", "#assessments",
    "#teacherCalendarSection", "#learningPlatform"
  ]) {
    await expect(page.locator(selector)).toBeHidden();
  }
});

test("live pilot page loads at desktop size without uncaught page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.stack || error.message));
  page.on("console", message => { if (message.type() === "error") console.log("[browser console] " + message.text()); });
  page.on("dialog", dialog => dialog.dismiss());
  await installMutationObserverWatchdog(page);
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#pacificEducationWelcome")).toBeAttached();
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("#pacificEducationVoiceStatus")).toBeAttached();
  await expect(page.locator("#welcomeNextButton")).toBeAttached();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeAttached();
  const observerRunaways = await page.evaluate(() => window.__paceduObserverRunaways || []);
  expect(observerRunaways, "MutationObserver runaway stacks").toEqual([]);
  expect(errors, "uncaught JavaScript errors").toEqual([]);
});

test("Welcome Next stays in the single-page app and reveals Vision, Rules, then Registration", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "load" });

  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageVision")).toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/src\/index\.html$/);

  await page.locator("#paceduVisionNext").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await expect(page.locator("#paceduPageVision")).toBeHidden();

  await page.locator("#paceduRulesAgreement").check();
  await expect(page.locator("#paceduRulesContinue")).toBeEnabled();
  await page.locator("#paceduRulesContinue").click();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#paceduPageRules")).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/src\/index\.html$/);

  // The delayed startup fallback must not reset an advanced route to Welcome.
  await page.waitForTimeout(1400);
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  await expect(page.locator("#paceduPageRules")).toBeHidden();
});

test("Back returns to the immediately previous guided page with a matching flow step", async ({ page }) => {
  // This test exercises eleven pages while the isolation observer and legacy handlers settle.
  // Give the full sequence enough time on shared/slow CI runners.
  test.setTimeout(90000);
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "load" });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();

  const pageIds = [
    "pacificEducationWelcome", "paceduPageVision", "paceduPageRules",
    "pacificEducationIdentityRegistration", "prototypeAccess", "levelSelection",
    "subjectSelection", "termSelection", "capabilitySelection", "dailyLesson",
    "dailyLessonPracticeStage", "assessments", "pacificEducationCoverageDashboard",
    "teacherCalendarSection"
  ];
  const cases = [
    { current: "pacificEducationIdentityRegistration", step: 3, previous: "paceduPageRules", previousStep: null },
    { current: "prototypeAccess", step: 4, previous: "pacificEducationIdentityRegistration", previousStep: 3 },
    { current: "levelSelection", step: 5, previous: "prototypeAccess", previousStep: 4 },
    { current: "subjectSelection", step: 6, previous: "levelSelection", previousStep: 5 },
    { current: "termSelection", step: 7, previous: "subjectSelection", previousStep: 6 },
    { current: "capabilitySelection", step: 8, previous: "termSelection", previousStep: 7 },
    { current: "dailyLesson", step: 9, previous: "capabilitySelection", previousStep: 8 },
    { current: "dailyLessonPracticeStage", step: 10, previous: "dailyLesson", previousStep: 9 },
    { current: "assessments", step: 11, previous: "dailyLessonPracticeStage", previousStep: 10 },
    { current: "pacificEducationCoverageDashboard", step: 12, previous: "assessments", previousStep: 11 },
    { current: "teacherCalendarSection", step: 13, previous: "pacificEducationCoverageDashboard", previousStep: 12 }
  ];

  for (const item of cases) {
    console.log("[guided Back diagnostic] enter:", item.current, "step:", item.step);
    const entered = await page.evaluate(({ step, current }) =>
      window.PacificEducationSingleNavigation.go(step, current), item);
    console.log("[guided Back diagnostic] entered:", item.current, "result:", entered);
    expect(entered, "controller must enter " + item.current).toBe(true);
    await expect(page.locator("#" + item.current)).toBeVisible();
    console.log("[guided Back diagnostic] click Back:", item.current);
    if (item.current === "pacificEducationIdentityRegistration") {
      await expect(page.locator("#registrationBackButton")).toBeVisible();
      await expect(page.locator("#pacificEducationBack_pacificEducationIdentityRegistration")).toBeHidden();
      await page.locator("#registrationBackButton").click();
    } else {
      const back = page.locator("#pacificEducationBack_" + item.current);
      await expect(back).toBeVisible({ timeout: 5000 });
      /* This regression checks the controller's Back routing. Dispatch the
         click event directly so a separate pilot-entry disabled-state guard
         cannot stall the route test; real enabled/touch behavior is exercised
         by the dedicated mobile-flow tests. */
      await back.evaluate(button => button.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      ));
    }
    console.log("[guided Back diagnostic] waiting for previous:", item.previous);
    await expect(page.locator("#" + item.previous)).toBeVisible();
    if (item.previousStep === null) {
      await expect(page.locator("body")).toHaveAttribute("data-pac-edu-entry-page", "3");
    } else {
      await expect(page.locator("body")).toHaveAttribute("data-pe-flow-step", String(item.previousStep));
    }
    await page.waitForTimeout(180);
    const visiblePages = await page.evaluate(ids => ids.filter(id => {
      const node = document.getElementById(id);
      if (!node || node.hidden || node.getAttribute("aria-hidden") === "true") return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }), pageIds);
    /* Coverage Dashboard is nested inside Teacher Calendar in the legacy DOM.
       At guided step 12 its wrapper must remain displayed to contain the dashboard;
       count the nested dashboard as the page, not its required ancestor wrapper. */
    const independentVisiblePages = visiblePages.filter(id =>
      !(item.previous === "pacificEducationCoverageDashboard" && id === "teacherCalendarSection"));
    expect(independentVisiblePages, "only the destination page may remain visible after Back from " + item.current)
      .toEqual([item.previous]);
  }
});

test("blank startup recovery returns to Welcome through the single navigation controller", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  /* Recreate the reported conflict after the normal startup controller runs,
     but before the 1.2-second safety net fires. */
  await page.addInitScript(() => {
    window.addEventListener("load", () => {
      window.setTimeout(() => {
        const welcome = document.getElementById("pacificEducationWelcome");
        if (!welcome) return;
        document.body.classList.add("pe-guided-flow");
        document.body.setAttribute("data-pe-flow-step", "3");
        document.body.setAttribute("data-pe-active-guided-page", "pacificEducationIdentityRegistration");
        welcome.hidden = true;
        welcome.setAttribute("aria-hidden", "true");
        welcome.style.setProperty("display", "none", "important");
      }, 0);
    });
  });
  await page.goto(baseURL, { waitUntil: "load" });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("body")).toHaveAttribute("data-pac-edu-entry-page", "1");
  await expect(page.locator("#welcomeNextWrapper")).toBeVisible();
});

test("Registration voice removes the legacy welcome phrase before speech playback", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  // The entry route is intentionally gated by the accepted pilot rules. Set that
  // state before navigation, matching the real flow and the mobile registration test.
  await page.addInitScript(() => {
    try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {}
  });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#pacificEducationWelcomeVoiceButton")).toBeHidden();
  await expect(page.locator("#pacificEducationAIPlaybackButton")).toBeHidden();
  await expect(page.locator("#pacificEducationWelcomeVoiceButton")).toBeDisabled();
  await expect(page.locator("#pacificEducationAIPlaybackButton")).toBeDisabled();
  await expect.poll(() => page.evaluate(() => typeof window.PacificEducationSpeech?.speakConversation), { timeout: 8000 }).toBe("function");
  // Reproduce the reported defect: the direct Page 4 entry must not start or resume
  // the Page 1 welcome/Owner narration, but page-specific Registration speech stays on.
  await page.waitForTimeout(1500);
  const welcomeCallsOnRegistration = await page.evaluate(() => window.__paceduSpeechCalls
    .filter(call => /welcome to (?:pacific education|pacedu)|owner.?s experience|21 years.*classroom teaching/i.test(call.text))
    .map(call => call.text));
  expect(welcomeCallsOnRegistration, "Page 1 welcome narration must never play on Registration").toEqual([]);

  // Automatic registration-box narration must remain silent. The user may still
  // request page-specific help explicitly using Hear Instructions / AI Playback.
  await page.evaluate(() => window.PacificEducationSpeech.speakConversation([
    { speaker: "Narrator", text: "Registration step 1 of 4. Country. Complete this box, then press Next." }
  ]));
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => window.__paceduSpeechCalls.length), "Registration must not auto-speak").toBe(0);

  await page.evaluate(() => {
    const manual = document.createElement("button");
    manual.textContent = "Hear Instructions";
    document.body.appendChild(manual);
    manual.click();
    manual.remove();
    window.PacificEducationSpeech.speakConversation([
      { speaker: "Narrator", text: "Welcome to User Registration. Complete each required box carefully, one box at a time." }
    ]);
  });

  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length), { timeout: 5000 }).toBeGreaterThan(0);
  const spoken = await page.evaluate(() => window.__paceduSpeechCalls.map(call => call.text).join(" "));
  expect(spoken).not.toMatch(/Welcome to (?:Pacific Education|Pacedu)/i);
  expect(spoken).not.toMatch(/Owner.?s experience|21 years.*classroom teaching/i);
  expect(spoken).not.toMatch(/Welcome to User Registration/i);
  expect(spoken).toMatch(/User Registration instructions/i);
  expect(spoken).toMatch(/Complete each required box carefully/i);
});

test("mobile touch can complete registration and select a role before Next advances", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.setDefaultTimeout(7000);
  page.on("pageerror", error => errors.push(error.stack || error.message));
  page.on("console", message => { if (message.type() === "error") console.log("[mobile browser console] " + message.text()); });
  await installSpeechHarness(page);
  await page.addInitScript(() => {
    try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {}
  });
  console.log("[mobile flow] opening registration entry");
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  // Keep real touch hit-testing, but remove perpetual breathing transforms from this
  // automated interaction test: Playwright requires a stationary target before tap().
  // The production UI animations remain unchanged for actual phone users.
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }" });
  const registration = page.locator("#pacificEducationIdentityRegistration");
  await expect(registration).toBeVisible();
  await expect(page.locator("#registrationNextWrapper .pe-green-guide")).toContainText("Registration setup");
  await expect(page.locator("#registrationNextWrapper .pe-green-guide")).not.toContainText("Student Workspace");
  console.log("[mobile flow] registration visible with registration-specific green guidance");

  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  console.log("[mobile flow] country selected; tap Next");
  await page.locator("#registrationNextButton").tap();
  await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();
  console.log("[mobile flow] language box visible");

  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  console.log("[mobile flow] language selected; tap Next");
  await page.locator("#registrationNextButton").tap();
  const teacher = page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Teacher"]');
  await expect(teacher).toBeVisible();
  const teacherBox = await teacher.boundingBox();
  expect(teacherBox, "Teacher role must have a measurable tap target").not.toBeNull();
  expect(teacherBox.height, "Teacher role tap target must be at least 88px tall on mobile").toBeGreaterThanOrEqual(88);
  expect(teacherBox.width, "Teacher role must provide a broad phone tap target").toBeGreaterThanOrEqual((page.viewportSize()?.width || 360) * 0.65);
  await expect(teacher).toHaveCSS("pointer-events", "auto");
  console.log("[mobile flow] large Teacher role card visible; tap Teacher");
  await teacher.tap();
  await expect(teacher).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#pilotRoleRegistrationFields")).toBeVisible();
  await expect(page.locator("#registrationNextButton")).toBeEnabled();
  console.log("[mobile flow] Teacher selected; tap Next to name");

  await page.locator("#registrationNextButton").tap();
  await page.locator("#pilotRegistrationName").fill("Phone Pilot Test");
  await expect(page.locator("#registrationNextButton")).toBeDisabled();
  console.log("[mobile flow] name filled; Next stays disabled until Save Pilot Registration is confirmed");
  await page.locator("#pilotRegistrationSaveButton").tap();
  await page.waitForTimeout(700);
  const handoffDiagnostic = await page.evaluate(() => {
    const read = key => { try { return sessionStorage.getItem(key); } catch (_) { return "sessionStorage-unavailable"; } };
    const page = document.querySelector("#prototypeAccess");
    const registrationPage = document.querySelector("#pacificEducationIdentityRegistration");
    const status = document.querySelector("#pacificEducationInteractionStatus") || document.querySelector("#pacificEducationVoiceStatus");
    return {
      registeredFlag: read("pacificEducationPilotRegistered"),
      registrationRecord: read("pacificEducationPilotRegistration"),
      selectedRole: read("pacificEducationPilotRole"),
      flowStep: document.body.getAttribute("data-pe-flow-step"),
      activeGuidedPage: document.body.getAttribute("data-pe-active-guided-page"),
      prototypeHidden: !!(page && page.hidden),
      prototypeDisplay: page ? getComputedStyle(page).display : "missing",
      registrationHidden: !!(registrationPage && registrationPage.hidden),
      statusText: status ? status.textContent : "",
      nextButtonText: (document.querySelector("#registrationNextButton") || {}).textContent || "",
      nextButtonDisabled: !!(document.querySelector("#registrationNextButton") || {}).disabled,
      roleFieldValue: (document.querySelector("#pilotRegistrationRole") || {}).value || "",
      roleCards: Array.from(document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card")).map(card => ({role:card.getAttribute("data-role"),pressed:card.getAttribute("aria-pressed"),disabled:!!card.disabled})),
      nameValue: (document.querySelector("#pilotRegistrationName") || {}).value || "",
      saveButtonDisabled: !!(document.querySelector("#pilotRegistrationSaveButton") || {}).disabled,
      sequenceProgress: (document.querySelector("#peBoxSequenceProgress") || {}).textContent || "",
      sequenceTitle: (document.querySelector("#peBoxSequenceTitle") || {}).textContent || "",
      registrationBoxHidden: !!(document.querySelector("#pacificEducationRegistrationBox") || {}).hidden,
      url: location.href
    };
  });
  console.log("[mobile flow] post-save handoff diagnostic " + JSON.stringify(handoffDiagnostic));
  /* Save must confirm the profile without changing the guided page. */
  await expect(registration).toBeVisible();
  await expect(page.locator("#prototypeAccess")).toBeHidden();
  await expect(page.locator("#registrationNextButton")).toContainText(/Open Teacher Workspace/);
  await expect(page.locator("#registrationNextButton")).toBeEnabled();
  console.log("[mobile flow] registration remains visible after save; waiting for explicit Next tap");
  await page.locator("#registrationNextButton").tap();
  const teacherWorkspace = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(teacherWorkspace).toBeVisible({ timeout: 5000 });
  await expect(teacherWorkspace).toHaveAttribute("data-pe-role", "teacher");
  console.log("[mobile flow] explicit Next tap opened Teacher Workspace");
  const savedRegistration = await page.evaluate(() => ({
    registered: sessionStorage.getItem("pacificEducationPilotRegistered"),
    role: sessionStorage.getItem("pacificEducationPilotRole"),
    record: JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration") || "null")
  }));
  expect(savedRegistration.registered, "confirmed registration must set the shared registered flag").toBe("true");
  expect(savedRegistration.role).toBe("Teacher");
  expect(savedRegistration.record).toMatchObject({name:"Phone Pilot Test",role:"Teacher",pilotOnly:true});
  expect(errors, "uncaught JavaScript errors").toEqual([]);
  await context.close();
});

test("Pacedu welcome voice control invokes the protected speech engine", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const voiceButton = page.locator("#pacificEducationWelcomeVoiceButton");
  await expect(voiceButton).toBeAttached();
  await voiceButton.click({ force: true });
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.some(call => /Pacific Education|Welcome/i.test(call.text))), { timeout: 8000 }).toBe(true);
  const call = await page.evaluate(() => window.__paceduSpeechCalls.find(call => /Pacific Education|Welcome/i.test(call.text)));
  expect(call.text).toMatch(/Pacific Education|Welcome/i);
  expect(call.volume).toBe(1);
});

test("AI Playback completes the Pacific Education welcome with one narrator voice", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const playback = page.locator("#pacificEducationAIPlaybackButton");
  await expect(playback).toBeAttached();
  expect(await page.evaluate(() => window.__paceduSpeechCalls.length)).toBe(0);
  expect(await page.evaluate(() => window.__pacificEducationWelcomeCompleted)).toBe(false);
  await playback.click({ force: true });
  await expect.poll(() => page.evaluate(() =>
    window.__paceduSpeechCalls.some(call => call.text.includes("Let us learn, discover, practise, and grow together."))
  ), { timeout: 8000 }).toBe(true);
  const calls = await page.evaluate(() => window.__paceduSpeechCalls);
  const question = calls.findIndex(call => call.text === "Why was Pacific Education built?");
  const answer = calls.findIndex(call => call.text.startsWith("Because it grew from real classroom experience"));
  expect(calls.length).toBeGreaterThanOrEqual(10);
  expect(calls[0].text).toMatch(/^Welcome to Pacific Education/);
  expect(question).toBeGreaterThanOrEqual(0);
  expect(answer).toBeGreaterThan(question);
  for (let i = 1; i < calls.length; i += 1) {
    expect(calls[i].voice, "every welcome line must use the same narrator voice").toBe(calls[0].voice);
  }
  expect(calls.some(call => call.text.includes("Let us learn, discover, practise, and grow together."))).toBe(true);
  expect(calls.some(call => call.text === "Press Next to continue.")).toBe(true);
});

test("automatic welcome starts with single-narrator AI Playback before page guidance", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length), { timeout: 8000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() =>
    window.__paceduSpeechCalls.some(call => call.text === "Press Next to continue.")
  ), { timeout: 8000 }).toBe(true);
  const calls = await page.evaluate(() => window.__paceduSpeechCalls);
  expect(calls[0].text).toMatch(/^Welcome to Pacific Education\. I am Tion Terubea/);
  expect(calls.some(call => call.text.startsWith("Registration step"))).toBe(false);
  expect(calls[calls.length - 1].text).toBe("Press Next to continue.");
  expect(await page.evaluate(() => window.__pacificEducationWelcomeCompleted)).toBe(true);
});

test("live pilot page fits a narrow phone viewport without document-level horizontal overflow", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("dialog", dialog => dialog.dismiss());
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(dimensions.page, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 2);
  expect(errors, "uncaught JavaScript errors").toEqual([]);
});

test("device speaker diagnostic invokes speech and presents an honest result", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(deviceURL, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Test this phone or computer" })).toBeVisible();
  await expect(page.locator("#deviceFacts")).toContainText("Speech API: available");
  await page.getByRole("button", { name: "Test this device's speaker" }).click();
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length)).toBe(1);
  await expect(page.locator("#status")).toContainText("Pacedu voice engine request sent");
  await expect(page.locator("#speechFacts")).toContainText("Yes, I heard the sound");
  await expect(page.locator("#speechFacts")).toContainText("No sound heard");
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length)).toBe(2);
  await expect.poll(() => page.evaluate(() => {
    const status = document.querySelector("#pacificEducationVoiceStatus");
    return status && /AI Playback narrator is speaking|conversation complete/i.test(status.textContent);
  }), { timeout: 8000 }).toBeTruthy();
  await expect.poll(() => page.locator("#report").textContent()).toContain("lifecycleEvents");
  const calls = await page.evaluate(() => window.__paceduSpeechCalls);
  expect(calls[0].text).toContain("Pacific Education speaker test");
  expect(calls[1].text).toContain("If you can hear this sentence");
  expect(calls[0].voice).toBe(calls[1].voice);
  expect(calls[0].volume).toBe(1);
});

test("device report is local, includes device facts, and stop control works", async ({ page }) => {
  await installSpeechHarness(page);
  await page.goto(deviceURL, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Test this device's speaker" }).click();
  await expect(page.locator("#report")).toContainText('"device"');
  await expect(page.locator("#report")).toContainText('"speechSynthesisAvailable": true');
  await page.getByRole("button", { name: "Stop speech" }).click();
  await expect(page.locator("#status")).toContainText("Speech stopped");
});


test("device speaker diagnostic checks the browser speech start/end lifecycle on fallback", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(deviceURL, { waitUntil: "domcontentloaded" });
  // Exercise the browser fallback explicitly instead of Pacedu's wrapped conversation path.
  await page.evaluate(() => { window.PacificEducationSpeech = undefined; });
  await page.getByRole("button", { name: "Test this device's speaker" }).click();
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length)).toBe(1);
  await expect(page.locator("#status")).toContainText("Browser reports speech finished", { timeout: 5000 });
  await expect(page.locator("#speechFacts")).toContainText("Yes, I heard the sound");
  const report = JSON.parse(await page.locator("#report").textContent());
  expect(report.speech.result).toBe("ended");
  expect(report.speech.startedAt).toBeTruthy();
  expect(report.speech.endedAt).toBeTruthy();
  expect(report.humanHeard).toBeNull();
});

test("device speaker diagnostic fails honestly when no speech engine exists", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(deviceURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => { window.PacificEducationSpeech = undefined; });
  await page.getByRole("button", { name: "Test this device's speaker" }).click();
  await expect(page.locator("#status")).toContainText("FAIL — speech engine unavailable");
  const report = JSON.parse(await page.locator("#report").textContent());
  expect(report.speech.result).toBe("fail");
  expect(report.speech.reason).toBe("Speech Synthesis API unavailable");
  await expect(page.locator("#speechFacts")).not.toContainText("Yes, I heard the sound");
});

test("device speaker diagnostic surfaces a browser speech exception as a blocker", async ({ page }) => {
  await page.addInitScript(() => {
    class ThrowingUtterance {
      constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.volume = 1; this.voice = null; }
    }
    const synth = {
      speaking: false,
      pending: false,
      paused: false,
      cancel() {},
      resume() {},
      getVoices() { return []; },
      speak() { throw new Error("synthetic device output failure"); }
    };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: ThrowingUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(deviceURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => { window.PacificEducationSpeech = undefined; });
  await page.getByRole("button", { name: "Test this device's speaker" }).click();
  await expect(page.locator("#status")).toContainText("FAIL — could not start speech");
  const report = JSON.parse(await page.locator("#report").textContent());
  expect(report.speech.result).toBe("exception");
  expect(report.speech.error).toContain("synthetic device output failure");
  await expect(page.locator("#speechFacts")).not.toContainText("Yes, I heard the sound");
});


test("sequential Parent workspace advances one page at a time through confirmed Sign Out", async ({ page }) => {
  test.setTimeout(60000);
  const trace = async label => console.log("[Parent workspace trace]", label, await page.evaluate(() => ({title:document.getElementById("peSequentialTitle")?.textContent, progress:document.getElementById("peSequentialProgress")?.textContent, nextDisabled:document.getElementById("peSequentialNext")?.disabled, nextHidden:document.getElementById("peSequentialNext")?.hidden, nextDisplay:document.getElementById("peSequentialNext") ? getComputedStyle(document.getElementById("peSequentialNext")).display : null, signOutVisible:!!document.getElementById("peSequentialSignOutButton") && !!document.getElementById("peSequentialSignOutButton").getClientRects().length, status:document.getElementById("peSequentialStatus")?.textContent})));
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  // This is a focused controller test: prevent the separate guided-page controller
  // from racing the workspace controller while this test verifies its own pages.
  await page.route("**/src/js/pacificEducationSingleNavigationController.js*", route => route.abort());
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem("pacificEducationPilotRegistered", "true");
    sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({name:"Parent Pilot Test",role:"parent",pilotOnly:true}));
    sessionStorage.setItem("pacificEducationPilotRole", "parent");
    // Exercise the workspace controller independently of the page-isolation
    // controller, which intentionally keeps non-active app pages hidden.
    window.PacificEducationSingleNavigation = undefined;
    // This focused test intentionally disables the route controller; release its startup-only CSS guard so the workspace controller can be tested independently.
    document.documentElement.setAttribute("data-pacedu-navigation-ready", "true");
    // The page-isolation controller may put its state on either the document
    // root or body. Clear both so its CSS cannot hide the focused controller test.
    [document.documentElement, document.body].forEach(root => {
      root.classList.remove("pe-guided-flow", "pe-pilot-all-features");
      root.removeAttribute("data-pe-active-guided-page");
      root.removeAttribute("data-pe-flow-step");
    });
    const app = document.getElementById("app");
    if (app) {
      let node = app;
      while (node && node !== document.body) {
        node.hidden = false;
        node.removeAttribute("aria-hidden");
        if (node.style && node.style.display === "none") node.style.removeProperty("display");
        node = node.parentElement;
      }
    }
    window.PacificEducationSequentialRoleWorkspaces.build("parent");
    const shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    if (shell) {
      shell.hidden = false;
      shell.removeAttribute("aria-hidden");
    }
  });
  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(shell).toBeVisible();
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — My Workspace");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 1 OF 5");
  await expect(page.locator("#peSequentialWorkspaceHome")).toBeVisible();
  await page.locator("#peSequentialNext").click();
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — My Child");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 2 OF 5");
  await expect(page.locator("#peSequentialPage")).toBeVisible();
  await trace("initial page");

  await trace("before Next 1");
  await page.locator("#peSequentialNext").click();
  await trace("after Next 1");
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — Teacher Communication");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 3 OF 5");

  await trace("before Next 2");
  await page.locator("#peSequentialNext").click();
  await trace("after Next 2");
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — Child Progress");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 4 OF 5");

  // Detect the original regression: the focus guide must not call scrollIntoView
  // for the final Sign Out control when it appears.
  await page.evaluate(() => {
    window.__paceduSignOutScrollIntoViewCalls = 0;
    const nativeScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(...args) {
      if (this && (this.id === "peSequentialSignOutButton" || this.id === "peSequentialSignOutYes")) {
        window.__paceduSignOutScrollIntoViewCalls += 1;
      }
      return nativeScrollIntoView.apply(this, args);
    };
  });
  await trace("before Next 3");
  await page.locator("#peSequentialNext").click();
  await trace("after Next 3");
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — Sign Out");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 5 OF 5");
  await expect(page.locator("#peSequentialNext")).toBeHidden();
  await expect(shell.locator("#peSequentialBack")).toBeHidden();
  await expect(shell.locator("#peSequentialSignOutInformation")).toBeVisible();
  await expect(shell.locator("#peSequentialSignOutInformation")).toContainText("Your workspace is complete");
  await expect(shell.locator("#peSequentialSignOutInformation")).toContainText("Saved pilot registration details");
  await expect(shell.locator("#peSequentialSignOutInformation")).toContainText("select Cancel to close the confirmation");
  await expect(shell.locator("#peSequentialSignOutButton")).toBeVisible();
  expect(await page.evaluate(() => window.__paceduSignOutScrollIntoViewCalls),
    "the focus guide must not auto-scroll the final Sign Out control into view").toBe(0);

  // Final-page reading and scrolling must remain user-controlled; completion
  // must not automatically focus the Sign Out button and jump the viewport.
  await page.evaluate(() => {
    window.__paceduSignOutFocusCalls = 0;
    const nativeFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function(...args) {
      if (this && this.id === "peSequentialSignOutButton") window.__paceduSignOutFocusCalls += 1;
      return nativeFocus.apply(this, args);
    };
  });
  await page.evaluate(() => {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo(0, max);
  });
  await page.waitForTimeout(180);
  const bottomScrollY = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollTo(0, Math.max(0, window.scrollY - 120)));
  await page.waitForTimeout(180);
  const scrollState = await page.evaluate(() => ({
    y: window.scrollY,
    focusCalls: window.__paceduSignOutFocusCalls
  }));
  expect(scrollState.focusCalls, "final Sign Out must not be focused automatically").toBe(0);
  expect(scrollState.y, "user scrolling upward on the final page must not snap back").toBeLessThan(bottomScrollY);

  await trace("before Sign Out");
  await shell.locator("#peSequentialSignOutButton").click();
  await trace("after Sign Out");
  await expect(shell.locator("#peSequentialSignOutConfirm")).toBeVisible();

  // Cancel must leave the user's current workspace and active session untouched.
  await shell.locator("#peSequentialSignOutNo").click();
  await expect(shell.locator("#peSequentialSignOutConfirm")).toBeHidden();
  await expect(shell).toBeVisible();
  const stillActive = await page.evaluate(() => ({
    registered: sessionStorage.getItem("pacificEducationPilotRegistered"),
    role: sessionStorage.getItem("pacificEducationPilotRole"),
    registration: sessionStorage.getItem("pacificEducationPilotRegistration")
  }));
  expect(stillActive.registered).toBe("true");
  expect(stillActive.role).toBe("parent");
  expect(JSON.parse(stillActive.registration)).toMatchObject({name:"Parent Pilot Test",role:"parent",pilotOnly:true});

  // Only a second, explicit Sign Out followed by Confirm may end the session.
  await shell.locator("#peSequentialSignOutButton").click();
  await expect(shell.locator("#peSequentialSignOutConfirm")).toBeVisible();
  await shell.locator("#peSequentialSignOutYes").dispatchEvent("click");
  await trace("after confirm sign out");
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toHaveCount(0);
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  const cleared = await page.evaluate(() => ({
    registered: sessionStorage.getItem("pacificEducationPilotRegistered"),
    registration: sessionStorage.getItem("pacificEducationPilotRegistration"),
    role: sessionStorage.getItem("pacificEducationPilotRole")
  }));
  expect(cleared).toEqual({ registered: null, registration: null, role: null });
});


test("active teacher workspace hides unrelated student, parent and AI sections", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/src/js/pacificEducationSingleNavigationController.js*", route => route.abort());
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem("pacificEducationPilotRegistered", "true");
    sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({name:"Teacher Isolation Test",role:"teacher",pilotOnly:true}));
    sessionStorage.setItem("pacificEducationPilotRole", "teacher");
    window.PacificEducationSingleNavigation = undefined;
    // This focused test intentionally disables the route controller; release its startup-only CSS guard so the workspace controller can be tested independently.
    document.documentElement.setAttribute("data-pacedu-navigation-ready", "true");
    [document.documentElement, document.body].forEach(root => {
      root.classList.remove("pe-guided-flow", "pe-pilot-all-features", "pe-sequential-role-workspace-active");
      root.removeAttribute("data-pe-active-guided-page");
      root.removeAttribute("data-pe-flow-step");
    });
    window.PacificEducationSequentialRoleWorkspaces.build("teacher");
  });

  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(shell).toBeVisible();
  await expect(page.locator("#peSequentialTitle")).toContainText("teacher Workspace — My Workspace");
  await expect(page.locator("#peSequentialWorkspaceHome")).toBeVisible();
  await expect(page.locator("#teacherDashboard")).toBeHidden();
  await page.locator("#peSequentialNext").click();
  await expect(page.locator("#peSequentialTitle")).toContainText("teacher Workspace");
  await expect(page.locator("#teacherDashboard")).toBeVisible();
  await expect(page.locator("#learningPlatform")).toBeHidden();
  await expect(page.locator("#parentDashboard")).toBeHidden();
  await expect(page.locator("#pacificEducationAIConversation")).toBeHidden();
  await expect(page.locator("#pacificEducationStudentProgressDashboard")).toBeHidden();
  await expect(page.locator("#peSequentialSignOutButton")).toBeVisible();

  /* The active Teacher Workspace contains required actions. The mandatory-field
     guide must keep Next blocked until those required actions are completed;
     this isolation test does not fabricate teacher work merely to advance. */
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 2 OF 10");
  await expect(page.locator("#peSequentialTitle")).toContainText("Teacher Workspace");
  await expect(page.locator("#peSequentialNext")).toBeEnabled();
});

test("verified registration role overrides a stale pilot role marker", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/src/js/pacificEducationSingleNavigationController.js*", route => route.abort());
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem("pacificEducationPilotRegistered", "true");
    sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({name:"Blind Learner Isolation Test",role:"Blind Learner",pilotOnly:true}));
    sessionStorage.setItem("pacificEducationPilotRole", "teacher");
    window.PacificEducationSingleNavigation = undefined;
    // This focused test intentionally disables the route controller; release its startup-only CSS guard so the workspace controller can be tested independently.
    document.documentElement.setAttribute("data-pacedu-navigation-ready", "true");
    [document.documentElement, document.body].forEach(root => {
      root.classList.remove("pe-guided-flow", "pe-pilot-all-features", "pe-sequential-role-workspace-active");
      root.removeAttribute("data-pe-active-guided-page");
      root.removeAttribute("data-pe-flow-step");
    });
    // Simulate a stale role argument: the saved registration must win.
    window.PacificEducationSequentialRoleWorkspaces.build("teacher");
  });

  await expect(page.locator("#peSequentialTitle")).toContainText("Blind Learner Workspace");
  await expect(page.locator("#learningPlatform")).toBeVisible();
  await expect(page.locator("#teacherDashboard")).toBeHidden();
});

test("registration must remain on Page 4 when the real save does not persist", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {}
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (["pacificEducationPilotRegistered", "pacificEducationPilotRegistration", "pacificEducationPilotRole"].includes(String(key))) return;
      return original.call(this, key, value);
    };
  });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }" });
  const registration = page.locator("#pacificEducationIdentityRegistration");
  await expect(registration).toBeVisible();
  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  await page.locator("#registrationNextButton").click();
  await expect(registration, "Country Next must stay on Registration").toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();
  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await page.locator("#registrationNextButton").click();
  await expect(registration, "Language Next must stay on Registration").toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  const teacher = page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Teacher"]');
  await expect(teacher, "Teacher role must be visible before the registration test selects it").toBeVisible();
  await teacher.click();
  await expect(teacher).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#registrationNextButton"), "Next must enable after a real role selection").toBeEnabled();
  await page.locator("#registrationNextButton").click();
  await expect(registration, "Role Next must stay on Registration").toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  await page.locator("#pilotRegistrationName").fill("Unsaved Pilot Test");
  const saveButton = page.locator("#pilotRegistrationSaveButton");
  const nextButton = page.locator("#registrationNextButton");
  await expect(saveButton).toBeEnabled();
  await expect(nextButton).toBeDisabled();
  await saveButton.click();
  await page.waitForTimeout(700);
  await expect(registration).toBeVisible();
  await expect(page.locator("#prototypeAccess")).toBeHidden();
  await expect(nextButton).toBeDisabled();
  await expect(page.locator("#peBoxSequenceProgress")).toContainText(/not been confirmed|not saved/i);
});


test("integrated Welcome → Vision → Rules → Registration flow never replays the welcome narration", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__pacificEducationWelcomeCompleted), { timeout: 10000 }).toBe(true);

  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageVision")).toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  await page.locator("#paceduVisionNext").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await expect(page.locator("#paceduPageVision")).toBeHidden();
  await page.locator("#paceduRulesAgreement").check();
  const speechCountBeforeRegistration = await page.evaluate(() => (window.__paceduSpeechCalls || []).length);
  await page.locator("#paceduRulesContinue").click();

  const registration = page.locator("#pacificEducationIdentityRegistration");
  await expect(registration).toBeVisible();
  await expect(page.locator("#paceduPageRules")).toBeHidden();
  await expect(page.locator("#welcomeNextWrapper")).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/src\/index\.html$/);
  await page.waitForTimeout(1500);
  const welcomeCalls = await page.evaluate((startIndex) => (window.__paceduSpeechCalls || [])
    .slice(startIndex)
    .filter(call => /welcome to (?:pacific education|pacedu)|owner.?s experience|owner of pacific education|21 years.*classroom teaching/i.test(call.text))
    .map(call => call.text), speechCountBeforeRegistration);
  expect(welcomeCalls, "the Welcome/Owner narration must not start on Registration").toEqual([]);
  await expect(page.locator("#registrationNextButton")).toBeVisible();
});


test("Page isolation keeps the Coverage Dashboard independent from Teacher Calendar", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  // The Coverage Dashboard is a separate guided page, not a child of the
  // Teacher Calendar panel. This lets the single-page controller hide either
  // destination without exposing unrelated teacher tools.
  const structure = await page.evaluate(() => {
    const dashboard = document.getElementById("pacificEducationCoverageDashboard");
    const teacher = document.getElementById("teacherCalendarSection");
    return {
      available: Boolean(dashboard && teacher),
      sameParent: Boolean(dashboard && teacher && dashboard.parentElement === teacher.parentElement),
      teacherContainsDashboard: Boolean(dashboard && teacher && teacher.contains(dashboard))
    };
  });
  expect(structure.available).toBe(true);
  expect(structure.sameParent).toBe(true);
  expect(structure.teacherContainsDashboard).toBe(false);

  // Reproduce stale panels while Coverage is active. Only Coverage may remain
  // visible; Teacher Calendar must stay hidden as an independent page.
  await page.evaluate(() => {
    document.body.classList.add("pe-guided-flow");
    document.body.setAttribute("data-pe-flow-step", "12");
    document.body.setAttribute("data-pe-active-guided-page", "pacificEducationCoverageDashboard");
    for (const id of ["teacherCalendarSection", "pacificEducationWelcome", "paceduPageVision", "paceduPageRules"]) {
      const node = document.getElementById(id);
      if (node) { node.hidden = false; node.style.setProperty("display", "block", "important"); }
    }
    window.dispatchEvent(new Event("pageshow"));
  });
  await page.waitForTimeout(1100);
  await expect(page.locator("#pacificEducationCoverageDashboard")).toBeVisible();
  await expect(page.locator("#teacherCalendarSection")).toBeHidden();
  for (const id of ["pacificEducationWelcome", "paceduPageVision", "paceduPageRules"]) {
    const node = page.locator("#" + id);
    if (await node.count()) await expect(node).toBeHidden();
  }
});


test("gateway Next follows Welcome → Vision → Rules → Registration without stale pages", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("#welcomeNextWrapper")).toBeVisible();
  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageVision")).toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/src\/index\.html$/);

  await page.locator("#paceduVisionNext").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await expect(page.locator("#paceduPageVision")).toBeHidden();
  await page.locator("#paceduRulesAgreement").check();
  await expect(page.locator("#paceduRulesContinue")).toBeEnabled();
  await page.locator("#paceduRulesContinue").click();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#paceduPageRules")).toBeHidden();
  await expect(page.locator("#welcomeNextWrapper")).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/src\/index\.html$/);
  await expect(page.locator("#registrationNextButton")).toBeVisible();
});


test("Rules Next opens Registration without briefly restoring Welcome", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.__paceduWelcomeFlashDetected = false;
    window.__paceduLearningToolsFlashDetected = false;
    window.__paceduObserveRegistrationTransition = false;
    const isVisible = node => !!node && !node.hidden &&
      node.getAttribute("aria-hidden") !== "true" &&
      getComputedStyle(node).display !== "none" &&
      getComputedStyle(node).visibility !== "hidden" &&
      node.getClientRects().length > 0;
    const inspect = () => {
      if (!window.__paceduObserveRegistrationTransition) return;
      const welcome = document.getElementById("pacificEducationWelcome");
      const learningTools = document.getElementById("learningPlatform");
      if (isVisible(welcome)) window.__paceduWelcomeFlashDetected = true;
      if (isVisible(learningTools)) window.__paceduLearningToolsFlashDetected = true;
    };
    const start = () => {
      if (!document.documentElement) return;
      new MutationObserver(inspect).observe(document.documentElement, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ["hidden", "style", "aria-hidden", "class", "data-pe-flow-step", "data-pe-active-guided-page"]
      });
      inspect();
    };
    if (document.documentElement) start();
    else document.addEventListener("DOMContentLoaded", start, { once: true });
  });

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageVision")).toBeVisible();
  await page.locator("#paceduVisionNext").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await page.locator("#paceduRulesAgreement").check();
  await expect(page.locator("#paceduRulesContinue")).toBeEnabled();
  await page.evaluate(() => { window.__paceduObserveRegistrationTransition = true; });
  await page.locator("#paceduRulesContinue").click();

  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#welcomeNextWrapper")).toBeHidden();
  await page.waitForTimeout(1100);
  const flashDetected = await page.evaluate(() => window.__paceduWelcomeFlashDetected);
  const learningToolsFlashDetected = await page.evaluate(() => window.__paceduLearningToolsFlashDetected);
  expect(flashDetected, "Welcome must remain hidden throughout Rules → Registration").toBe(false);
  expect(learningToolsFlashDetected, "Learning Tools must remain hidden throughout Rules → Registration").toBe(false);
});


test("Page 4 registration guidance has one clear green-step banner and no injected role hint", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => { try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {} });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  const registration = page.locator("#pacificEducationIdentityRegistration");
  await expect(registration).toBeVisible();
  await expect(page.locator("#registrationNextWrapper .pe-green-guide")).toHaveCount(1);
  await expect(page.locator("#registrationNextWrapper .pe-green-guide")).toContainText("Registration setup");
  await expect(page.locator("#userRegistrationForm .pe-green-role-hint")).toHaveCount(0);
  const saveButton = page.locator("#pilotRegistrationSaveButton");
  await expect(saveButton).toHaveText(/Save Pilot Registration/);
  await expect(page.locator("#registrationNextButton")).toBeVisible();
  const backButton = page.locator("#registrationBackButton");
  await expect(backButton).toBeVisible();
  await expect(backButton).toContainText("Back");
  // Save is correctly hidden until the user completes setup and selects a role.
  await expect(saveButton).toBeHidden();
  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  await page.locator("#registrationNextButton").click();
  await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();
  await backButton.click();
  await expect(page.locator("#pacificEducationCountriesBox")).toBeVisible();
  await page.locator("#registrationNextButton").click();
  await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();
  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await page.locator("#registrationNextButton").click();
  const teacher = page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Teacher"]');
  await expect(teacher).toBeVisible();
  await teacher.click();
  await expect(saveButton).toBeVisible();
  await page.locator("#registrationNextButton").click(); // confirm role, then enter the name step
  await page.locator("#pilotRegistrationName").fill("Teacher Pilot Test");
  const nextButton = page.locator("#registrationNextButton");
  await expect(saveButton).toBeEnabled();
  await expect(nextButton).toBeDisabled();
  await saveButton.click();
  await expect(saveButton).toHaveText(/Registration Saved/);
  await expect(nextButton).toBeEnabled();
  await expect(nextButton).toContainText(/Open Teacher Workspace/);
  await nextButton.click();
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toHaveAttribute("data-pe-role", "teacher");
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
});



test("save confirmation then Next opens the selected role workspace for every registration role", async ({ page }) => {
  test.setTimeout(90000);
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const roles = [
    ["Student", "student"],
    ["Blind Learner", "blind-learner"],
    ["Deaf Learner", "deaf-learner"],
    ["Teacher", "teacher"],
    ["Parent/Caregiver", "parent"],
    ["Professional Reviewer", "professional"],
    ["NGO/Organization", "ngo"],
    ["Education/Government", "education"],
    ["Community/Partner", "community"],
    ["Technician", "technician"],
    ["Owner/Control", "owner"]
  ];

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  for (const [role, expectedWorkspace] of roles) {
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.removeItem("pacificEducationPilotRegistration");
      localStorage.removeItem("pacificEducationPilotRole");
      sessionStorage.setItem("pacificEducationRulesAccepted", "yes");
    });
    if (expectedWorkspace === "student") {
      // A stale locally saved sequence must not bypass mandatory Student steps.
      await page.evaluate(() => localStorage.setItem("paceduSequenceAdjustmentsV1", JSON.stringify({
        version: "1.0.0",
        roles: { student: [["dailyLesson", "Day 1"], ["pacificEducationInitialCapabilityTest", "Test"]] }
      })));
    }
    await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
    await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
    await page.locator("#registrationNextButton").click();
    await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();
    await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
    await page.locator("#registrationNextButton").click();

    const roleCard = page.locator("#pilotUserRoleCards .pe-user-role-card[data-role=\"" + role + "\"]");
    await roleCard.click();
    await expect(page.locator("#pilotRoleRegistrationFields")).toBeVisible();
    await page.locator("#registrationNextButton").click(); // confirm role and open the name step
    await page.locator("#pilotRegistrationName").fill("Role Pilot Test");
    const save = page.locator("#pilotRegistrationSaveButton");
    const next = page.locator("#registrationNextButton");
    await expect(save).toBeEnabled();
    await expect(next).toBeDisabled();
    await save.click();
    await expect(save).toHaveText(/Registration Saved/);
    await expect(next).toBeEnabled();
    await next.click();
    const workspace = page.locator("#pacificEducationSequentialRoleWorkspace");
    await expect(workspace).toBeVisible();
    await expect(workspace).toHaveAttribute("data-pe-role", expectedWorkspace);
    await expect(page.locator("body")).not.toHaveClass(/(?:^|\s)pe-guided-flow(?:\s|$)/);
    await expect(page.locator("body")).not.toHaveAttribute("data-pe-flow-step");
    await expect(page.locator("#peSequentialBack")).toBeVisible();
    await expect(page.locator("#peSequentialNext")).toBeVisible();
    await expect(page.locator("#peSequentialWorkspaceHome")).toBeVisible();
    await expect(page.locator("#peSequentialTitle")).toContainText("My Workspace");
    if (expectedWorkspace === "student") {
      await page.locator("#peStudentWorkspaceIdentity").fill("Role Pilot Test");
      await page.locator("#peStudentWorkspaceClass").selectOption("Class 1");
      await page.locator("#peStudentWorkspaceEntry button:not(.pacific-voice-speaker)").click();
      await expect(page.locator("#peSequentialNext")).toBeEnabled();
    }
    await page.locator("#peSequentialNext").click();
    await expect(page.locator("#peSequentialTitle")).not.toContainText("My Workspace");

    const roleActivityTitles = {
      teacher: "Teacher Daily Planning & Review",
      parent: "Family Learning Support",
      professional: "Professional Reviewer Activity",
      ngo: "NGO / Organisation Support Activity",
      education: "Education / Government Curriculum Review",
      community: "Community / Partner Learning Support",
      owner: "Owner — Pilot Governance Review",
      technician: "Technician — Read-only Diagnostics"
    };
    if (roleActivityTitles[expectedWorkspace]) {
      await expect(workspace.locator("#paceduRoleActivityPack")).toBeVisible();
      await expect(workspace.locator("#paceduRoleActivityPack")).toContainText(roleActivityTitles[expectedWorkspace]);
    }

    if (expectedWorkspace === "student") {
      const title = page.locator("#peSequentialTitle");
      const nextStep = page.locator("#peSequentialNext");
      await expect(title).toContainText("Day 1 of 365");
      await expect(nextStep).toBeDisabled();
      await page.locator("#paceduRoleActivityResponse").fill("I completed today's task and can explain my answer.");
      await page.locator("#paceduRoleActivityDone").check();
      await page.getByRole("button", { name: "Save Activity on This Device", exact: true }).click();
      await expect(nextStep).toBeEnabled();
      await nextStep.click();
      await expect(title).toContainText("Practice");
      await nextStep.click();
      await expect(title).toContainText("Daily Assessment Record");
      await nextStep.click();
      await expect(title).toContainText("Learning Coverage");
      await nextStep.click();
      await expect(title).toContainText("My Progress");
      await nextStep.click();
      await expect(title).toContainText("Day 2 of 365");
    }
  }
});


test("student workspace entry requires a session identity and class and carries context forward", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/src/js/pacificEducationSingleNavigationController.js*", route => route.abort());
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => typeof window.PacificEducationSequentialRoleWorkspaces?.build), { timeout: 10000 }).toBe("function");
  await page.evaluate(() => window.PacificEducationSequentialRoleWorkspaces.build("student"));

  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(shell.locator("#peStudentWorkspaceEntry")).toBeVisible();
  await expect(shell.locator("#peSequentialNext")).toBeDisabled();
  await shell.locator("#peStudentWorkspaceEntry button:not(.pacific-voice-speaker)").click();
  await expect(shell.locator("#peStudentWorkspaceEntry [role=status]")).toContainText("Enter a student name");

  await shell.locator("#peStudentWorkspaceIdentity").fill("Entry Gate Learner");
  await shell.locator("#peStudentWorkspaceClass").selectOption("Class 5");
  await shell.locator("#peStudentWorkspaceEntry button:not(.pacific-voice-speaker)").click();
  await expect(shell.locator("#peSequentialNext")).toBeEnabled();
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("Entry Gate Learner");
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("Class 5");
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("not verified");

  await shell.locator("#peSequentialNext").click();
  await expect(shell.locator("#peSequentialTitle")).toContainText("Day 1 of 365");
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("Entry Gate Learner");
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("Class 5");

  await expect(shell.locator("#dailyLesson")).toBeVisible();
  await expect(shell.locator("#peSequentialTitle")).toContainText("Day 1 of 365");
  await expect(shell.locator("#pacificEducationClassReference")).toBeHidden();

  // The selected class travels forward as read-only context; daily activity
  // pages must not show a second class selector.
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("Class 5");
  await expect(shell.locator("#peSequentialPage select")).toHaveCount(0);
});

test("student registration handoff shows workspace navigation and daily activities", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try {
      localStorage.setItem("pacificEducationLevel", "Class 1");
      localStorage.setItem("pacificEducationSubject", "English");
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
  await expect(shell.locator("#peSequentialWorkspaceHome")).toBeVisible();
  await expect(shell.locator("#peSequentialNext")).toBeDisabled();
  await shell.locator("#peStudentWorkspaceIdentity").fill("Pilot Test Learner");
  await shell.locator("#peStudentWorkspaceClass").selectOption("Class 1");
  await shell.locator("#peStudentWorkspaceEntry button:not(.pacific-voice-speaker)").click();
  await expect(shell.locator("#peSequentialNext")).toBeEnabled();
  await shell.locator("#peSequentialNext").click();
  await expect(shell.locator("#peSequentialTitle")).toContainText("Day 1 of 365");
  await expect(page.locator("#pacificEducationWelcomeVoiceButton")).toBeHidden();
  await expect(page.locator("#pacificEducationAIPlaybackButton")).toBeHidden();

  await expect(shell.locator("#paceduRoleActivityPack")).toBeVisible();
  await expect(shell.locator("#paceduRoleActivityPack")).toContainText("Fiji Year 1 English — Who am I?");
  await expect(shell.locator("#paceduRoleActivityResponse")).toBeVisible();
  await expect(shell.locator("#paceduRoleActivityDone")).toBeVisible();
  await shell.locator("#paceduRoleActivityResponse").fill("Good morning. My name is Pilot Learner. The first letter is P.");
  await shell.locator("#paceduRoleActivityDone").check();
  await shell.getByRole("button", { name: "Save Activity on This Device", exact: true }).click();
  await expect(shell.locator("#paceduRoleActivityStatus")).toContainText("PENDING_TEACHER_REVIEW");
  const savedActivity = await page.evaluate(() => JSON.parse(localStorage.getItem("pacificEducationRoleActivityEvidenceV1") || "{}"));
  expect(Object.values(savedActivity).some(entry => entry.role === "student" && entry.completed && entry.response.includes("Good morning"))).toBe(true);
  await expect(shell.locator("#peSequentialBack")).toBeVisible();
  await expect(shell.locator("#peSequentialNext")).toBeVisible();
});

test("student workspace skips redundant setup pages and opens daily activity directly", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try {
      localStorage.setItem("pacificEducationLevel", "Class 1");
      localStorage.setItem("pacificEducationSubject", "English");
      sessionStorage.setItem("pacificEducationPilotRegistration", JSON.stringify({
        name: "Class Level Repair Test",
        role: "Student",
        country: "Fiji",
        language: "en-AU"
      }));
      sessionStorage.setItem("pacificEducationPilotRegistered", "true");
      sessionStorage.setItem("pacificEducationPilotRole", "Student");
    } catch (_) {}
  });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => typeof window.PacificEducationSequentialRoleWorkspaces?.build), { timeout: 10000 }).toBe("function");
  await page.evaluate(() => window.PacificEducationSequentialRoleWorkspaces.build("student"));

  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(shell.locator("#peSequentialWorkspaceHome")).toBeVisible();
  await shell.locator("#peStudentWorkspaceIdentity").fill("Class Level Repair Test");
  await shell.locator("#peStudentWorkspaceClass").selectOption("Class 1");
  await shell.locator("#peStudentWorkspaceEntry button:not(.pacific-voice-speaker)").click();
  await expect(shell.locator("#peSequentialNext")).toBeEnabled();
  await shell.locator("#peSequentialNext").click();

  await expect(shell.locator("#peSequentialTitle")).toContainText("Day 1 of 365");
  await expect(shell.locator("#dailyLesson")).toBeVisible();
  await expect(shell.locator("#peSequentialPage [data-pe-cap-answer]")).toHaveCount(0);
  await expect(shell.locator("[data-pe-student-context-banner]")).toContainText("Class 1");
  await expect(shell.locator("#paceduRoleActivityPack")).toBeVisible();
});


test("registration save keeps Page 4 visible until Next, then recovers the role workspace", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
      sessionStorage.setItem("pacificEducationRulesAccepted", "yes");
      localStorage.removeItem("pacificEducationPilotRegistration");
      localStorage.removeItem("pacificEducationPilotRole");
    } catch (_) {}
  });

  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.stack || error.message));
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });

  const registration = page.locator("#pacificEducationIdentityRegistration");
  const save = page.locator("#pilotRegistrationSaveButton");
  const next = page.locator("#registrationNextButton");
  await expect(registration).toBeVisible();

  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  await next.click();
  await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();
  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await next.click();

  const roleCard = page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Teacher"]');
  await roleCard.click();
  await next.click();
  await page.locator("#pilotRegistrationName").fill("Registration Handoff Diagnostic");
  await expect(save).toBeEnabled();
  await expect(next).toBeDisabled();

  await save.click();
  await expect(save).toHaveText(/Registration Saved/);
  await expect(next).toBeEnabled();
  await expect(registration).toBeVisible();

  // A delayed startup/visibility guard must not blank Page 4 after a successful save.
  await page.waitForTimeout(1600);
  await expect(registration).toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  await expect(page.locator("#paceduPageRules")).toBeHidden();

  const visibleGuidedPages = await page.evaluate(() => {
    const ids = [
      "pacificEducationWelcome", "paceduPageVision", "paceduPageRules",
      "pacificEducationIdentityRegistration", "prototypeAccess", "levelSelection",
      "subjectSelection", "termSelection", "capabilitySelection", "dailyLesson",
      "dailyLessonPracticeStage", "assessments", "teacherCalendarSection"
    ];
    return ids.filter(id => {
      const node = document.getElementById(id);
      if (!node || node.hidden || node.getAttribute("aria-hidden") === "true") return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    });
  });
  expect(visibleGuidedPages, "exactly Registration should be visible after saving, before Next")
    .toEqual(["pacificEducationIdentityRegistration"]);

  await next.click();
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toHaveAttribute("data-pe-role", "teacher");
  await page.waitForTimeout(1400);
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  expect(pageErrors, "registration-to-workspace handoff must not throw uncaught errors").toEqual([]);
});
