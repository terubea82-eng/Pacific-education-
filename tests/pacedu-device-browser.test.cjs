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
  await expect(page.locator("#pacificEducationVoiceStatus")).toBeAttached();
  await expect(page.locator("#welcomeNextButton")).toBeAttached();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeAttached();
  const observerRunaways = await page.evaluate(() => window.__paceduObserverRunaways || []);
  expect(observerRunaways, "MutationObserver runaway stacks").toEqual([]);
  expect(errors, "uncaught JavaScript errors").toEqual([]);
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
  await expect.poll(() => page.evaluate(() => typeof window.PacificEducationSpeech?.speakConversation), { timeout: 8000 }).toBe("function");
  // Reproduce the reported defect: the direct Page 4 entry must not start or resume
  // the Page 1 welcome/Owner narration, but page-specific Registration speech stays on.
  await page.waitForTimeout(1500);
  const welcomeCallsOnRegistration = await page.evaluate(() => window.__paceduSpeechCalls
    .filter(call => /welcome to (?:pacific education|pacedu)|owner.?s experience|21 years.*classroom teaching/i.test(call.text))
    .map(call => call.text));
  expect(welcomeCallsOnRegistration, "Page 1 welcome narration must never play on Registration").toEqual([]);

  await page.evaluate(() => window.PacificEducationSpeech.speakConversation([
    { speaker: "Narrator", text: "Welcome to User Registration. Complete each required box carefully, one box at a time." }
  ]));

  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length), { timeout: 5000 }).toBeGreaterThan(0);
  const spoken = await page.evaluate(() => window.__paceduSpeechCalls.map(call => call.text).join(" "));
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
  console.log("[mobile flow] registration visible");

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
  console.log("[mobile flow] role cards visible; tap Teacher");
  await teacher.tap();
  await expect(teacher).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#pilotRoleRegistrationFields")).toBeVisible();
  await expect(page.locator("#registrationNextButton")).toBeEnabled();
  console.log("[mobile flow] Teacher selected; tap Next to name");

  await page.locator("#registrationNextButton").tap();
  await page.locator("#pilotRegistrationName").fill("Phone Pilot Test");
  await expect(page.locator("#registrationNextButton")).toBeEnabled();
  console.log("[mobile flow] name filled; tap Save/Next");
  await page.locator("#registrationNextButton").tap();
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
  await expect(page.locator("#prototypeAccess")).toBeVisible({ timeout: 5000 });
  await expect(registration).toBeHidden();
  console.log("[mobile flow] Prototype Access visible and registration hidden");
  const savedRole = await page.evaluate(() => sessionStorage.getItem("pacificEducationPilotRole"));
  expect(savedRole).toBe("Teacher");
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

test("AI Playback completes a two-speaker Pacific Education conversation", async ({ page }) => {
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
    expect(calls[i].voice, "each dialogue line must alternate voices").not.toBe(calls[i - 1].voice);
  }
  expect(calls.some(call => call.text.includes("Let us learn, discover, practise, and grow together."))).toBe(true);
  expect(calls[calls.length - 1].text).toBe("Press Next to continue.");
});

test("automatic welcome starts with two-person AI Playback before page guidance", async ({ page }) => {
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
    return status && /Speaker 1 is speaking|Speaker 2 is speaking|conversation complete/i.test(status.textContent);
  }), { timeout: 8000 }).toBeTruthy();
  await expect.poll(() => page.locator("#report").textContent()).toContain("lifecycleEvents");
  const calls = await page.evaluate(() => window.__paceduSpeechCalls);
  expect(calls[0].text).toContain("Pacific Education speaker test");
  expect(calls[1].text).toContain("If you can hear this sentence");
  expect(calls[0].voice).not.toBe(calls[1].voice);
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
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — My Child");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 1 OF 4");
  await expect(page.locator("#peSequentialPage")).toBeVisible();
  await trace("initial page");

  await trace("before Next 1");
  await page.locator("#peSequentialNext").click();
  await trace("after Next 1");
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — Teacher Communication");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 2 OF 4");

  await trace("before Next 2");
  await page.locator("#peSequentialNext").click();
  await trace("after Next 2");
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — Child Progress");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 3 OF 4");

  await trace("before Next 3");
  await page.locator("#peSequentialNext").click();
  await trace("after Next 3");
  await expect(page.locator("#peSequentialTitle")).toContainText("parent Workspace — Sign Out");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 4 OF 4");
  await expect(page.locator("#peSequentialNext")).toBeHidden();
  await expect(page.locator("#peSequentialSignOutButton")).toBeVisible();

  await trace("before Sign Out");
  await page.locator("#peSequentialSignOutButton").click();
  await trace("after Sign Out");
  await expect(page.locator("#peSequentialSignOutConfirm")).toBeVisible();
  // The handler removes the clicked button and its parent workspace immediately.
  // Dispatch directly so Playwright does not wait on a locator being detached.
  await page.locator("#peSequentialSignOutYes").dispatchEvent("click");
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
  await teacher.click({ force: true });
  await page.locator("#registrationNextButton").click();
  await expect(registration, "Role Next must stay on Registration").toBeVisible();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
  await page.locator("#pilotRegistrationName").fill("Unsaved Pilot Test");
  await page.locator("#registrationNextButton").click();
  await page.waitForTimeout(700);
  await expect(registration).toBeVisible();
  await expect(page.locator("#prototypeAccess")).toBeHidden();
  await expect(page.locator("#peBoxSequenceProgress")).toContainText(/not been confirmed|not saved/i);
});


test("integrated Welcome → Vision → Rules → Registration flow never replays the welcome narration", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();

  // Use the real page links: Vision and Rules are separate HTML entry pages,
  // not panels embedded in index.html. Do not treat missing panels as hidden.
  await expect.poll(() => page.evaluate(() => window.__pacificEducationWelcomeCompleted), { timeout: 10000 }).toBe(true);
  await page.locator("#welcomeNextButton").click();
  await expect(page).toHaveURL(/\/vision\.html(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: /Vision.*Mission.*Purpose/i })).toBeVisible();

  await page.getByRole("link", { name: /Next.*Rules/i }).click();
  await expect(page).toHaveURL(/\/rules\.html(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: /Rules.*Conditions/i })).toBeVisible();
  await page.locator("#rulesAgreement").check();
  await page.locator("#continueButton").click();

  await expect(page).toHaveURL(/\/index\.html\?entry=registration$/);
  const registration = page.locator("#pacificEducationIdentityRegistration");
  await expect(registration).toBeVisible();
  await expect(page.locator("#welcomeNextWrapper")).toBeHidden();
  await page.waitForTimeout(1500);
  const welcomeCalls = await page.evaluate(() => (window.__paceduSpeechCalls || [])
    .filter(call => /welcome to (?:pacific education|pacedu)|owner.?s experience|owner of pacific education|21 years.*classroom teaching/i.test(call.text))
    .map(call => call.text));
  expect(welcomeCalls, "the Welcome/Owner narration must not start on direct Registration entry").toEqual([]);
  await expect(page.locator("#registrationNextButton")).toBeVisible();
});
