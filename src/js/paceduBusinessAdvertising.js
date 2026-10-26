/* PacEdu Business Advertising — controlled pilot draft only.
 * No public publishing, network submission, payment collection, or payment verification.
 */
(function (window, document) {
  "use strict";
  var STORAGE_KEY = "paceduBusinessAdvertisingDraftV1";
  var form = document.getElementById("paceduBusinessAdvertForm");
  var status = document.getElementById("paceduBusinessFormStatus");
  var clear = document.getElementById("paceduBusinessClearDraft");
  if (!form || !status || !clear) return;

  function safeHttpUrl(value, label) {
    if (!value) return "";
    var parsed;
    try { parsed = new URL(value); } catch (_) { throw new Error(label + " must be a complete web link."); }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(label + " must begin with https:// or http://.");
    }
    return parsed.href;
  }
  function getValues() {
    var data = new FormData(form);
    return {
      businessName: String(data.get("businessName") || "").trim(),
      contactName: String(data.get("contactName") || "").trim(),
      category: String(data.get("category") || "").trim(),
      location: String(data.get("location") || "").trim(),
      description: String(data.get("description") || "").trim(),
      website: safeHttpUrl(String(data.get("website") || "").trim(), "Website link"),
      paymentLink: safeHttpUrl(String(data.get("paymentLink") || "").trim(), "Payment link"),
      email: String(data.get("email") || "").trim(),
      status: "PENDING_OWNER_REVIEW",
      savedAt: new Date().toISOString()
    };
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      var draft = getValues();
      if (!draft.businessName || !draft.category || !draft.location || !draft.description) {
        throw new Error("Complete all required fields before saving.");
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      status.textContent = "Draft saved on this device only. It is not submitted, approved, published or paid. PacEdu owner review and a secure submission service are still required.";
    } catch (error) {
      status.textContent = error && error.message ? error.message : "Draft could not be saved on this device.";
    }
  });
  clear.addEventListener("click", function () {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    form.reset();
    status.textContent = "This device's saved draft was cleared.";
  });
  try {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.status === "PENDING_OWNER_REVIEW") {
      ["businessName","contactName","category","location","description","website","paymentLink","email"].forEach(function (key) {
        var field = form.elements.namedItem(key);
        if (field && typeof saved[key] === "string") field.value = saved[key];
      });
      status.textContent = "Your unsent draft was restored from this device. Review it before saving again.";
    }
  } catch (_) {
    status.textContent = "Local draft storage is unavailable in this browser. You can still review this page, but drafts may not persist.";
  }
})(window, document);
