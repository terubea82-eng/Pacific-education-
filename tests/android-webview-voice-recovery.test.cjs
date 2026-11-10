const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("android/app/src/main/java/fj/pacificeducation/app/MainActivity.java", "utf8");

test("native TTS errors release the active flag but preserve saved resume position", () => {
  assert.match(source, /private void handleNativeConversationSpeechError\(\)[\s\S]*?nativeConversationActive = false;[\s\S]*?Your saved place is kept/);
  assert.match(source, /onError\(String utteranceId\)\s*\{\s*handleNativeConversationSpeechError\(\);/);
  assert.match(source, /onError\(String utteranceId, int errorCode\)\s*\{\s*handleNativeConversationSpeechError\(\);/);
  const helper = source.match(/private void handleNativeConversationSpeechError\(\)[\s\S]*?\n    \}/)?.[0] || "";
  assert.doesNotMatch(helper, /clearNativeConversationResume/);
});

test("WebView load failures are limited to the main frame and offer retry or safe home", () => {
  assert.match(source, /request\.isForMainFrame\(\)/);
  assert.match(source, /onReceivedHttpError/);
  assert.match(source, /setPositiveButton\("Retry"/);
  assert.match(source, /setNegativeButton\("Return to PacEdu Home"/);
  assert.match(source, /Your learning data on this device has not been cleared/);
});

test("WebView certificate errors are cancelled, never bypassed", () => {
  assert.match(source, /onReceivedSslError[\s\S]*?handler\.cancel\(\)/);
  assert.doesNotMatch(source, /handler\.proceed\(\)/);
});
