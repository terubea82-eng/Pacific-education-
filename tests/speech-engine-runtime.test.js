const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function createSpeechHarness(options = {}) {
  const utterances = [];
  const status = { textContent: "" };
  const listeners = {};
  const documentListeners = {};
  const voices = [
    { name: "English Australia Natural", lang: "en-AU" },
    { name: "English United States", lang: "en-US" }
  ];
  const synth = {
    speaking: false,
    cancelled: 0,
    resumed: 0,
    getVoices: () => voices,
    cancel() { this.cancelled += 1; this.speaking = false; },
    resume() { this.resumed += 1; },
    speak(utterance) { utterances.push(utterance); this.speaking = true; }
  };
  function SpeechSynthesisUtterance(text) {
    this.text = text;
    this.voice = null;
    this.lang = "";
    this.rate = 0;
    this.pitch = 0;
    this.volume = 0;
  }
  const document = {
    readyState: "loading",
    visibilityState: "visible",
    body: { classList: { contains: () => false }, getAttribute: () => null, setAttribute() {} },
    addEventListener(name, fn) { (documentListeners[name] ||= []).push(fn); },
    getElementById(id) { return id === "pacificEducationVoiceStatus" ? status : null; },
    querySelectorAll() { return []; }
  };
  const window = {
    navigator: undefined,
    speechSynthesis: options.noEngine ? undefined : synth,
    SpeechSynthesisUtterance: options.noEngine ? undefined : SpeechSynthesisUtterance,
    localStorage: {
      values: new Map(),
      getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
      setItem(key, value) { this.values.set(key, String(value)); },
      removeItem(key) { this.values.delete(key); }
    },
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    setTimeout() { return 1; },
    clearTimeout() {},
    console
  };
  const context = {
    window, document, navigator: { userAgent: "Android" }, console,
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    Date, JSON, Math, String, Number, Array, Object, RegExp, isFinite
  };
  vm.runInNewContext(
    fs.readFileSync("src/js/pacificEducationSpeechVoice.js", "utf8"),
    context,
    { filename: "pacificEducationSpeechVoice.js" }
  );
  return { window, document, synth, utterances, status, listeners, documentListeners };
}

test("speech engine queues audible utterances and chooses an English voice", () => {
  const h = createSpeechHarness();
  assert.equal(h.window.PacificEducationSpeech.getEngine(), "web-speech");
  assert.equal(h.window.PacificEducationSpeech.speakText("Test the Pacedu speaker.", { allowRepeat: true }), true);
  assert.equal(h.utterances.length, 1);
  assert.equal(h.utterances[0].text, "Test the Pacedu speaker.");
  assert.equal(h.utterances[0].lang, "en-AU");
  assert.equal(h.utterances[0].volume, 1);
  h.utterances[0].onstart();
  assert.equal(h.status.textContent, "Voice playing.");
});

test("AI Playback queues two-person dialogue with alternating distinct voices", () => {
  const h = createSpeechHarness();
  const lines = [
    { speaker: "1", text: "Welcome to Pacific Education." },
    { speaker: "2", text: "Learning should be accessible to everyone." }
  ];
  assert.equal(h.window.PacificEducationSpeech.speakConversation(lines), true);
  assert.equal(h.utterances.length, 1);
  assert.equal(h.utterances[0].text, lines[0].text);
  assert.equal(h.utterances[0].voice.name, "English Australia Natural");
  h.utterances[0].onstart();
  assert.match(h.status.textContent, /Speaker 1 is speaking/);
  h.utterances[0].onend();
  assert.equal(h.utterances.length, 2);
  assert.equal(h.utterances[1].text, lines[1].text);
  assert.equal(h.utterances[1].voice.name, "English United States");
  h.utterances[1].onstart();
  assert.match(h.status.textContent, /Speaker 2 is speaking/);
  h.utterances[1].onend();
  assert.equal(h.status.textContent, "AI Playback conversation complete.");
  assert.equal(h.window.localStorage.getItem("pacificEducationVoiceResume"), null);
});

test("Stop Speech cancels pending browser speech and clears saved dialogue", () => {
  const h = createSpeechHarness();
  h.window.PacificEducationSpeech.speakConversation([
    { speaker: "1", text: "First line." },
    { speaker: "2", text: "Second line." }
  ]);
  assert.notEqual(h.window.localStorage.getItem("pacificEducationVoiceResume"), null);
  h.window.PacificEducationSpeech.stopSpeech();
  assert.equal(h.synth.cancelled, 2, "conversation start and Stop Speech both cancel queued audio");
  assert.equal(h.status.textContent, "Voice stopped.");
  assert.equal(h.window.localStorage.getItem("pacificEducationVoiceResume"), null);
});

test("software test reports missing speech engine instead of falsely claiming audio played", () => {
  const h = createSpeechHarness({ noEngine: true });
  assert.equal(h.window.PacificEducationSpeech.getEngine(), "unavailable");
  assert.equal(h.window.PacificEducationSpeech.speakText("Must not pretend to play.", { allowRepeat: true }), false);
  assert.match(h.status.textContent, /Voice engine unavailable/);
});
