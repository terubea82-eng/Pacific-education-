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
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("#pacificEducationVoiceStatus")).toBeAttached();
  await expect(page.locator("#welcomeNextButton")).toBeAttached();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeAttached();
  const observerRunaways = await page.evaluate(() => window.__paceduObserverRunaways || []);
  expect(observerRunaways, "MutationObserver runaway stacks").toEqual([]);
  expect(errors, "uncaught JavaScript errors").toEqual([]);
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
  expect(calls[calls.length - 1].text).toBe("Press Next to continue.");
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
    [document.documentElement, document.body].forEach(root => {
      root.classList.remove("pe-guided-flow", "pe-pilot-all-features", "pe-sequential-role-workspace-active");
      root.removeAttribute("data-pe-active-guided-page");
      root.removeAttribute("data-pe-flow-step");
    });
    window.PacificEducationSequentialRoleWorkspaces.build("teacher");
  });

  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(shell).toBeVisible();
  await expect(page.locator("#peSequentialTitle")).toContainText("teacher Workspace");
  await expect(page.locator("#teacherDashboard")).toBeVisible();
  await expect(page.locator("#learningPlatform")).toBeHidden();
  await expect(page.locator("#parentDashboard")).toBeHidden();
  await expect(page.locator("#pacificEducationAIConversation")).toBeHidden();
  await expect(page.locator("#pacificEducationStudentProgressDashboard")).toBeHidden();
  await expect(page.locator("#peSequentialSignOutButton")).toBeHidden();

  /* Sign Out is available only after the role sequence reaches its final page.
     Regression: Teacher Workspace Next must change the active page, not leave
     the teacher dashboard displayed. The capability test is the required step 2. */
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 1 OF 11");
  await page.locator("#peSequentialNext").click();
  await expect(page.locator("#peSequentialTitle")).toContainText("Teacher Capability & Platform Test");
  await expect(page.locator("#peSequentialProgress")).toContainText("STEP 2 OF 11");
  await expect(page.locator("#peSequentialPage h3")).toContainText("Teacher Capability & Platform Test");
  await expect(page.locator("#peSequentialNext")).toBeDisabled();
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
  await teacher.click({ force: true });
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


test("Page 4 isolation keeps only the active page visible and preserves nested page ancestors", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  // Reproduce the reported conflict: Welcome/Prototype are made visible while
  // Registration is the declared active page. The repair must restore isolation.
  await page.evaluate(() => {
    document.body.classList.add("pe-guided-flow");
    document.body.setAttribute("data-pe-flow-step", "3");
    document.body.setAttribute("data-pe-active-guided-page", "pacificEducationIdentityRegistration");
    for (const id of ["pacificEducationWelcome", "paceduPageVision", "paceduPageRules", "prototypeAccess"]) {
      const node = document.getElementById(id);
      if (node) { node.hidden = false; node.style.setProperty("display", "block", "important"); }
    }
    window.dispatchEvent(new Event("pageshow"));
  });
  await page.waitForTimeout(1100);
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  for (const id of ["pacificEducationWelcome", "paceduPageVision", "paceduPageRules", "prototypeAccess"]) {
    const node = page.locator("#" + id);
    if (await node.count()) await expect(node).toBeHidden();
  }
  const overlayState = await page.evaluate(() => {
    const overlay = document.getElementById("pacificEducationStepGuide");
    return overlay ? getComputedStyle(overlay).display : "not-present";
  });
  expect(overlayState).not.toBe("block");

  // Coverage Dashboard is a nested page; its Teacher Calendar ancestor must not
  // be hidden by the isolation repair.
  const nested = await page.evaluate(() => {
    const dashboard = document.getElementById("pacificEducationCoverageDashboard");
    const parent = document.getElementById("teacherCalendarSection");
    if (!dashboard || !parent || !parent.contains(dashboard)) return { available: false };
    document.body.setAttribute("data-pe-flow-step", "12");
    document.body.setAttribute("data-pe-active-guided-page", "pacificEducationCoverageDashboard");
    window.dispatchEvent(new Event("pageshow"));
    return { available: true };
  });
  if (nested.available) {
    await page.waitForTimeout(1100);
    const ancestor = page.locator("#teacherCalendarSection");
    await expect(ancestor).toBeVisible();
    await expect(page.locator("#pacificEducationCoverageDashboard")).toBeVisible();
  }
});



test("gateway Next follows Welcome → Vision → Rules → Registration without stale pages", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  // These gateway steps are real HTML entry pages, not panels in index.html.
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("#welcomeNextWrapper")).toBeVisible();
  await page.locator("#welcomeNextButton").click();
  await expect(page).toHaveURL(/\/vision\.html(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: /Vision.*Mission.*Purpose/i })).toBeVisible();

  await page.getByRole("link", { name: /Next.*Rules/i }).click();
  await expect(page).toHaveURL(/\/rules\.html(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: /Rules.*Conditions/i })).toBeVisible();

  await page.locator("#rulesAgreement").check();
  await expect(page.locator("#continueButton")).toBeEnabled();
  await page.locator("#continueButton").click();
  await expect(page).toHaveURL(/\/index\.html\?entry=registration$/);
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#welcomeNextWrapper")).toBeHidden();
  await expect(page.locator("#registrationNextButton")).toBeVisible();
});

test("Rules Next opens Registration without briefly restoring Welcome", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });

  // The supported entry journey uses separate vision.html and rules.html pages.
  // Watch the destination document from document start so a brief Welcome flash
  // during the registration page's initialization cannot be missed.
  await page.addInitScript(() => {
    window.__paceduWelcomeFlashDetected = false;
    window.__paceduLearningToolsFlashDetected = false;
    const isVisible = node => !!node && !node.hidden &&
      node.getAttribute("aria-hidden") !== "true" &&
      getComputedStyle(node).display !== "none" &&
      getComputedStyle(node).visibility !== "hidden" &&
      node.getClientRects().length > 0;
    const inspect = () => {
      if (!/entry=registration(?:&|$)/.test(location.search)) return;
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
  await expect(page).toHaveURL(/\/vision\.html(?:\?.*)?$/);
  await page.getByRole("link", { name: /Next.*Rules/i }).click();
  await expect(page).toHaveURL(/\/rules\.html(?:\?.*)?$/);
  await page.locator("#rulesAgreement").check();
  await expect(page.locator("#continueButton")).toBeEnabled();
  await page.locator("#continueButton").click();

  await expect(page).toHaveURL(/\/index\.html\?entry=registration$/);
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

    if (expectedWorkspace === "student") {
      const title = page.locator("#peSequentialTitle");
      const nextStep = page.locator("#peSequentialNext");
      await expect(title).toContainText("Capability & Ability Test");
      await expect(nextStep).toBeDisabled();

      await page.locator('input[data-pe-cap-answer="a"]').fill("A");
      await page.locator('input[data-pe-cap-answer="5"]').fill("5");
      await page.locator('input[data-pe-cap-answer="cat"]').fill("cat");
      await page.locator('button[aria-label="✓ Submit Test"]').click();
      await expect(nextStep).toBeEnabled();
      await nextStep.click();
      await expect(title).toContainText("Capability Result");
      await expect(nextStep).toBeEnabled();
      await nextStep.click();
      await expect(title).toContainText("Class / Level");
      await expect(nextStep).toBeEnabled();
      await nextStep.click();
      await expect(title).toContainText("Subject");
      await nextStep.click();
      await expect(title).toContainText("Term");
      await nextStep.click();
      await expect(title).toContainText("Learning Capability");
      await nextStep.click();
      await expect(title).toContainText("Day 1 of 365");
      await nextStep.click();
      await expect(title).toContainText("Practice");
      await nextStep.click();
      await expect(title).toContainText("Assessments");
      await nextStep.click();
      await expect(title).toContainText("Curriculum Coverage");
      await nextStep.click();
      await expect(title).toContainText("My Progress");
      await nextStep.click();
      await expect(title).toContainText("Day 2 of 365");
    }
  }
});


test("student registration handoff shows workspace navigation and daily activities", async ({ page }) => {
  await installSpeechHarness(page);
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
  await expect(page.locator("#pacificEducationWelcomeVoiceButton")).toBeHidden();
  await expect(page.locator("#pacificEducationAIPlaybackButton")).toBeHidden();

  // Complete the first capability check, then advance through the student
  // sequence to Daily Activities. Assert rendered controls and content, not CSS text.
  await expect(shell.locator("[data-pe-cap-answer]")).toHaveCount(3);
  await shell.locator('[data-pe-cap-answer="a"]').fill("a");
  await shell.locator('[data-pe-cap-answer="5"]').fill("5");
  await shell.locator('[data-pe-cap-answer="cat"]').fill("cat");
  await shell.getByRole("button", { name: /Submit Test/ }).click();
  await shell.locator("#peSequentialNext").click();
  await shell.locator("#peSequentialNext").click();

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
