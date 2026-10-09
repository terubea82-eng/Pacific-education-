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
        calls.push({ text: utterance.text, lang: utterance.lang, volume: utterance.volume });
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

test("live pilot page loads at desktop size without uncaught page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#pacificEducationWelcome")).toBeAttached();
  await expect(page.locator("#pacificEducationVoiceStatus")).toBeAttached();
  await expect(page.locator("#welcomeNextButton")).toBeAttached();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeAttached();
  expect(errors, "uncaught JavaScript errors").toEqual([]);
});

test("Pacedu welcome voice control invokes the protected speech engine", async ({ page }) => {
  await installSpeechHarness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const voiceButton = page.locator("#pacificEducationWelcomeVoiceButton");
  await expect(voiceButton).toBeAttached();
  await voiceButton.click({ force: true });
  await expect.poll(() => page.evaluate(() => window.__paceduSpeechCalls.length), { timeout: 8000 }).toBeGreaterThan(0);
  const call = await page.evaluate(() => window.__paceduSpeechCalls[0]);
  expect(call.text).toMatch(/Pacific Education|Welcome/i);
  expect(call.volume).toBe(1);
});

test("live pilot page fits a narrow phone viewport without document-level horizontal overflow", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
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
  await expect(page.locator("#status")).toContainText("Browser speech finished");
  await expect(page.locator("#speechFacts")).toContainText("Browser speech started and finished");
  await expect(page.locator("#speechFacts")).toContainText("Yes, I heard the sound");
  const call = await page.evaluate(() => window.__paceduSpeechCalls[0]);
  expect(call.text).toContain("Pacific Education speaker test");
  expect(call.volume).toBe(1);
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
