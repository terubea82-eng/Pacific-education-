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
  var targetCountryField = document.getElementById("advertTargetCountry");
  var languageGuidance = document.getElementById("paceduLanguageGuidance");
  var verifiedLanguageNotes = {
    "Fiji": "Verified constitutional status: English, Fijian (iTaukei) and Hindustani have equal status. This does not establish that all three must appear in every private advert. Check product-specific and sector rules. Source: Fiji Constitution, section 4 — https://www.fiji.gov.fj/fijian-constitution/",
    "France": "Verified rule: French is required for public-facing inscriptions and announcements placed on public roads, in places open to the public or on public transport. This specific rule should not be treated as a complete rule for every online advert. Check the applicable consumer, product and digital-advertising rules. Source: French Language Law, Article 3 — https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006421211/",
    "South Africa": "Verified constitutional status: 12 official languages — Sepedi, Sesotho, Setswana, siSwati, Tshivenda, Xitsonga, Afrikaans, English, isiNdebele, isiXhosa and isiZulu. This does not mean every private advert must use all 12. Check audience, province and applicable consumer rules. Source: Constitution, section 6 — https://www.justice.gov.za/legislation/constitution/chp01.html",
    "United Arab Emirates": "Verified consumer-information rules: Arabic is required on invoices and specified e-commerce product/service information. Dubai has a separate outdoor-advertising decree requiring Arabic as the main language for covered adverts. Do not apply the Dubai rule automatically to every advert or emirate. Sources: UAE Government consumer protection — https://u.ae/en/information-and-services/justice-safety-and-the-law/consumer-protection ; Dubai Decree 6/2020 — https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Decree%20No.%20%286%29%20of%202020%20Regulating%20Advertisements%20in%20the%20Emirate%20of%20Dubai.pdf",
    "Canada": "Verified national status: English and French are Canada's federal official languages; this does not by itself mean every private advertisement must be bilingual. Province-specific rules matter. If targeting Québec, check its French-language requirements separately. Sources: Government of Canada — https://www.canada.ca/en/canadian-heritage/services/how-rights-protected/guide-canadian-charter-rights-freedoms.html ; Québec Government — https://www.quebec.ca/en/culture/langue-francaise",
    "Other country or territory": "No verified country-specific language note is currently available in this PacEdu pilot. Do not guess. Check the relevant government, consumer-protection and advertising regulator sources before submitting."
  };
  function updateLanguageGuidance() {
    if (!languageGuidance || !targetCountryField) return;
    var country = targetCountryField.value;
    languageGuidance.textContent = verifiedLanguageNotes[country] ||
      (country ? "No country-specific legal advertising-language note has been verified in this PacEdu pilot yet. Do not assume the country's official language is legally required for every private advert. Check current national and local laws, product labelling rules and advertising-regulator guidance before submitting." :
      "Choose a target country to view PacEdu's currently verified language notes. A country's official languages are not automatically mandatory for every private advertisement. If your advert targets a province, state, emirate or region, enter that area in the business location and check its local rules.");
  }
  if (targetCountryField) targetCountryField.addEventListener("change", updateLanguageGuidance);
  updateLanguageGuidance();

  function getValues() {
    var data = new FormData(form);
    return {
      businessName: String(data.get("businessName") || "").trim(),
      contactName: String(data.get("contactName") || "").trim(),
      category: String(data.get("category") || "").trim(),
      location: String(data.get("location") || "").trim(),
      targetCountry: String(data.get("targetCountry") || "").trim(),
      otherTargetCountry: String(data.get("otherTargetCountry") || "").trim(),
      requiredAdLanguages: String(data.get("requiredAdLanguages") || "").trim(),
      legalAdLanguages: String(data.get("legalAdLanguages") || "").trim(),
      languageRespectConfirmation: form.elements.namedItem("languageRespectConfirmation").checked,
      otherAdLanguages: String(data.get("otherAdLanguages") || "").trim(),
      description: String(data.get("description") || "").trim(),
      englishInterpretation: String(data.get("englishInterpretation") || "").trim(),
      translationMethod: String(data.get("translationMethod") || "").trim(),
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
      if (!draft.businessName || !draft.category || !draft.location || !draft.targetCountry || !draft.requiredAdLanguages || !draft.languageRespectConfirmation || !draft.description || !draft.englishInterpretation || !draft.translationMethod) {
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
  var estimateFields = [
    { id: "estimateStarter", price: 5 },
    { id: "estimateGrowth", price: 15 },
    { id: "estimateProfessional", price: 39 },
    { id: "estimateEnterprise", price: 99 }
  ];
  var monthlyOutput = document.getElementById("estimateMonthlyRevenue");
  var annualOutput = document.getElementById("estimateAnnualRevenue");
  function updateRevenueEstimate() {
    if (!monthlyOutput || !annualOutput) return;
    var monthly = 0;
    estimateFields.forEach(function (item) {
      var field = document.getElementById(item.id);
      if (!field) return;
      var count = Number(field.value);
      if (!Number.isFinite(count) || count < 0) count = 0;
      count = Math.min(1000000, Math.floor(count));
      monthly += count * item.price;
    });
    var formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    monthlyOutput.textContent = "US$" + formatter.format(monthly);
    annualOutput.textContent = "US$" + formatter.format(monthly * 12);
  }
  estimateFields.forEach(function (item) {
    var field = document.getElementById(item.id);
    if (field) field.addEventListener("input", updateRevenueEstimate);
  });
  updateRevenueEstimate();

  try {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.status === "PENDING_OWNER_REVIEW") {
      ["businessName","contactName","category","location","targetCountry","otherTargetCountry","requiredAdLanguages","legalAdLanguages","languageRespectConfirmation","otherAdLanguages","description","englishInterpretation","translationMethod","website","paymentLink","email"].forEach(function (key) {
        var field = form.elements.namedItem(key);
        if (field && typeof saved[key] === "string") field.value = saved[key];
        if (field && field.type === "checkbox") field.checked = saved[key] === true;
      });
      status.textContent = "Your unsent draft was restored from this device. Review it before saving again.";
    }
  } catch (_) {
    status.textContent = "Local draft storage is unavailable in this browser. You can still review this page, but drafts may not persist.";
  }
})(window, document);
