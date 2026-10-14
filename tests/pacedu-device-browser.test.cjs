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
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length)).toBe(2);
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
