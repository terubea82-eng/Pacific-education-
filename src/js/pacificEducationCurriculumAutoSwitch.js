(function (window, document) {
  "use strict";
  var MANIFEST_URL = "./data/curriculum/active-frameworks.json";
  var STATE_KEY = "paceduCurriculumSelectionV1";
  var lastManifest = null;

  function safeJson(value) {
    try { return JSON.parse(value); } catch (error) { return null; }
  }
  function readCountry() {
    var saved = safeJson(window.localStorage.getItem(STATE_KEY));
    if (saved && saved.countryCode) return String(saved.countryCode).toUpperCase();
    var selectors = document.querySelectorAll("[name='country'], [name='countryCode'], #country, #countrySelect, [data-country-selector]");
    for (var i = 0; i < selectors.length; i += 1) {
      var value = String(selectors[i].value || selectors[i].getAttribute("data-country") || "").trim();
      if (value) return value.length === 2 ? value.toUpperCase() : value;
    }
    var keys = ["pacificEducationCoreState", "pacificEducationRegistration", "paceduRegistration", "pacificEducationUserProfile"];
    for (var k = 0; k < keys.length; k += 1) {
      var data = safeJson(window.localStorage.getItem(keys[k]));
      if (!data || typeof data !== "object") continue;
      var candidate = data.countryCode || data.country_code || data.country || (data.identity && (data.identity.countryCode || data.identity.country));
      if (candidate) return String(candidate).trim().toUpperCase();
    }
    return "FJ";
  }
  function emit(name, detail) {
    var event;
    try { event = new CustomEvent(name, { detail: detail }); }
    catch (error) { event = document.createEvent("CustomEvent"); event.initCustomEvent(name, false, false, detail); }
    window.dispatchEvent(event);
  }
  function setStatus(status, message) {
    document.documentElement.setAttribute("data-pacedu-curriculum-status", status);
    if (message) document.documentElement.setAttribute("data-pacedu-curriculum-message", message);
    else document.documentElement.removeAttribute("data-pacedu-curriculum-message");
  }
  function activate(manifest, requestedCountry) {
    var code = String(requestedCountry || manifest.defaultCountry || "FJ").toUpperCase();
    var profile = manifest.countries && manifest.countries[code];
    if (!profile || profile.enabled !== true) {
      var missing = { countryCode: code, status: "country-curriculum-not-configured", frameworkVersion: null, content: null };
      window.PacEduActiveCurriculum = missing;
      setStatus("country-curriculum-not-configured", "Curriculum setup is required for " + code + ".");
      emit("pacedu:curriculum-ready", missing);
      return missing;
    }
    var active = {
      countryCode: code,
      countryName: profile.countryName,
      frameworkName: profile.frameworkName,
      frameworkVersion: profile.frameworkVersion,
      frameworkStatus: profile.frameworkStatus,
      effectiveFrom: profile.effectiveFrom || null,
      mappingStatus: profile.mappingStatus || "outcome-mapping-pending",
      sourceUrl: profile.officialSourceUrl || null,
      releaseStatus: profile.releaseStatus || "baseline",
      loadedAt: new Date().toISOString(),
      content: null
    };
    window.PacEduActiveCurriculum = active;
    document.documentElement.setAttribute("data-pacedu-country", code);
    document.documentElement.setAttribute("data-pacedu-framework-version", active.frameworkVersion || "unverified");
    setStatus(active.mappingStatus, active.frameworkName + " " + active.frameworkVersion + " — " + active.mappingStatus + ".");
    emit("pacedu:curriculum-framework-changing", active);
    var packUrl = profile.approvedContentPackUrl;
    if (profile.releaseStatus === "approved" && packUrl) {
      return window.fetch(packUrl, { cache: "no-store", credentials: "same-origin" }).then(function (response) {
        if (!response.ok) throw new Error("Approved curriculum pack could not be fetched: HTTP " + response.status);
        return response.json();
      }).then(function (pack) {
        if (pack.countryCode !== code || String(pack.frameworkVersion) !== String(active.frameworkVersion) || pack.releaseStatus !== "approved") {
          throw new Error("Curriculum pack country, version, or release status does not match the active manifest.");
        }
        active.content = pack;
        window.PacEduActiveCurriculum = active;
        setStatus(active.mappingStatus, active.frameworkName + " " + active.frameworkVersion + " loaded.");
        emit("pacedu:curriculum-ready", active);
        return active;
      }).catch(function (error) {
        setStatus("approved-pack-load-failed", "Curriculum update could not be loaded. The last approved local content remains in place.");
        emit("pacedu:curriculum-load-error", { countryCode: code, error: String(error && error.message || error) });
        return active;
      });
    }
    emit("pacedu:curriculum-ready", active);
    return Promise.resolve(active);
  }
  function load(reason) {
    return window.fetch(MANIFEST_URL, { cache: "no-store", credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("Curriculum manifest fetch failed: HTTP " + response.status);
        return response.json();
      })
      .then(function (manifest) {
        if (!manifest || manifest.schemaVersion !== 1 || !manifest.countries || !manifest.defaultCountry) {
          throw new Error("Curriculum manifest schema is invalid.");
        }
        lastManifest = manifest;
        return activate(manifest, readCountry());
      })
      .catch(function (error) {
        setStatus("manifest-unavailable", "Curriculum update check is unavailable. Existing approved content was not replaced.");
        emit("pacedu:curriculum-load-error", { reason: reason || "startup", error: String(error && error.message || error) });
        return null;
      });
  }
  function chooseCountry(countryCode) {
    var code = String(countryCode || "").trim().toUpperCase();
    if (!/^[A-Z]{2,3}$/.test(code)) return Promise.reject(new Error("Use a valid ISO country code."));
    try { window.localStorage.setItem(STATE_KEY, JSON.stringify({ countryCode: code, selectedAt: new Date().toISOString() })); }
    catch (error) { /* Session may be private; still attempt a runtime switch. */ }
    if (lastManifest) return Promise.resolve(activate(lastManifest, code));
    return load("country-selection");
  }
  function bindCountrySelectors() {
    document.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !(target.matches && target.matches("[name='country'], [name='countryCode'], #country, #countrySelect, [data-country-selector]"))) return;
      if (target.value) chooseCountry(target.value).catch(function () {});
    });
    window.addEventListener("pacedu:country-selected", function (event) {
      var detail = event && event.detail || {};
      if (detail.countryCode) chooseCountry(detail.countryCode).catch(function () {});
    });
  }
  window.PacEduCurriculumAutoSwitch = Object.freeze({
    version: "1.0.0",
    refresh: function () { return load("manual-refresh"); },
    chooseCountry: chooseCountry,
    getActive: function () { return window.PacEduActiveCurriculum || null; }
  });
  bindCountrySelectors();
  load("startup");
  window.addEventListener("focus", function () { load("window-focus"); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) load("page-visible"); });
})(window, document);
