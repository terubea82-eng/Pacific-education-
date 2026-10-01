[object Object]

test("service worker precaches the current accessibility runtime", () => {
  assert.match(serviceWorker, /CACHE_NAME="pacific-education-shell-v7"/);
  assert.match(serviceWorker, /pacificEducationAccessibilityRuntime\.js/);
});
