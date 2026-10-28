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
  function findApprovedLesson(active, options) {
    var pack = active && active.content;
    if (!pack || pack.releaseStatus !== "approved" || pack.studentReady !== true ||
        String(pack.countryCode || "").toUpperCase() !== String(active.countryCode || "").toUpperCase() ||
        String(pack.frameworkVersion || "") !== String(active.frameworkVersion || "")) return null;
    var lessons = Array.isArray(pack.dailyLessons) ? pack.dailyLessons : [];
    var match = lessons.find(function (lesson) {
      return lesson && lesson.approvedForStudents === true &&
        String(lesson.classLevel || "") === String(options.level || "") &&
        String(lesson.subjectName || "") === String(options.subject || "") &&
        String(lesson.term || "T1").toUpperCase() === String(options.term || "T1").toUpperCase() &&
        Number(lesson.week) === Number(options.week || 1) &&
        Number(lesson.day) === Number(options.day || 1) &&
        String(lesson.ability || "developing") === String(options.ability || "developing");
    });
    return match && match.worksheet && typeof match.worksheet === "object" ? match.worksheet : null;
  }
  function blockedWorksheet(active) {
    return {
      status: "CURRICULUM_PACK_REQUIRED",
      title: "Curriculum content update required",
      message: "PacEdu has selected " + (active.countryName || active.countryCode) + " framework " +
        (active.frameworkVersion || "unverified") + ", but a matching approved lesson is not available for this class and subject. Ask the teacher/administrator to finish curriculum mapping and approval. Old-country or old-framework content will not be substituted.",
      level: "", subject: "", questions: [], answerKey: [],
      curriculumSchedule: { teachingTheme: "Approved curriculum pack required" },
      curriculumAlignment: { verificationStatus: "REVIEW_REQUIRED" }
    };
  }
  function installWorksheetGuard() {
    var api = window.PacEduDailyWorksheetContent;
    if (!api || typeof api.getCurriculumWorksheet !== "function" || api.__curriculumAutoSwitchGuard) return;
    var original = api.getCurriculumWorksheet;
    var enhanced = {};
    Object.keys(api).forEach(function (key) { enhanced[key] = api[key]; });
    enhanced.getCurriculumWorksheet = function (options) {
      options = options || {};
      var active = window.PacEduActiveCurriculum;
      if (!active) return original(options);
      var newFramework = String(active.frameworkVersion || "") !== "2013";
      var nonFiji = String(active.countryCode || "").toUpperCase() !== "FJ";
      if (active.content) {
        var approvedLesson = findApprovedLesson(active, options);
        return approvedLesson || blockedWorksheet(active);
      }
      if (nonFiji || newFramework) return blockedWorksheet(active);
      return original(options);
    };
    enhanced.__curriculumAutoSwitchGuard = true;
    window.PacEduDailyWorksheetContent = Object.freeze(enhanced);
  }
  function renderFrameworkStatus(active) {
    var host = document.getElementById("paceduTeacherDailyLearningOnlyShell") ||
      document.getElementById("paceduRoleActivityPack");
    if (!host) return;
    var status = document.getElementById("paceduActiveCurriculumStatus");
    if (!status) {
      status = document.createElement("p");
      status.id = "paceduActiveCurriculumStatus";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.style.cssText = "font-size:0.9em;margin:6px 0;padding:6px 0;border-bottom:1px solid #d7dfe5;";
      host.insertBefore(status, host.firstChild);
    }
    status.textContent = "Curriculum: " + (active.countryName || active.countryCode) + " — " +
      (active.frameworkName || "Framework") + " " + (active.frameworkVersion || "unverified") +
      " · " + (active.mappingStatus || "mapping status unknown") +
      (active.content ? " · approved content pack loaded" : "");
  }
  function normalizeCountry(value, manifest) {
    var raw = String(value || manifest.defaultCountry || "FJ").trim();
    var upper = raw.toUpperCase();
    if (manifest.countries && manifest.countries[upper]) return upper;
    var codes = Object.keys(manifest.countries || {});
    for (var i = 0; i < codes.length; i += 1) {
      var profile = manifest.countries[codes[i]];
      if (String(profile.countryName || "").trim().toUpperCase() === upper) return codes[i];
    }
    return upper;
  }
  function activate(manifest, requestedCountry) {
    var code = normalizeCountry(requestedCountry, manifest);
    var profile = manifest.countries && manifest.countries[code];
    if (!profile || profile.enabled !== true) {
      var missing = { countryCode: code, status: "country-curriculum-not-configured", frameworkVersion: null, content: null };
      window.PacEduActiveCurriculum = missing;
      installWorksheetGuard();
      renderFrameworkStatus(missing);
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
    installWorksheetGuard();
    renderFrameworkStatus(active);
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
        installWorksheetGuard();
        renderFrameworkStatus(active);
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
    if (lastManifest) code = normalizeCountry(code, lastManifest);
    if (!/^[A-Z]{2,3}$/.test(code)) return Promise.reject(new Error("Use a valid ISO country code or a country configured in PacEdu."));
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
  window.PacEduActiveCurriculum = { countryCode: readCountry(), frameworkVersion: null, mappingStatus: "loading", status: "loading" };
  installWorksheetGuard();
  bindCountrySelectors();
  load("startup");
  window.addEventListener("focus", function () { load("window-focus"); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) load("page-visible"); });
  if (window.MutationObserver && document.body) {
    var statusObserver = new MutationObserver(function () {
      if (window.PacEduActiveCurriculum && !document.getElementById("paceduActiveCurriculumStatus")) renderFrameworkStatus(window.PacEduActiveCurriculum);
    });
    statusObserver.observe(document.body, { childList: true, subtree: true });
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (window.PacEduActiveCurriculum) renderFrameworkStatus(window.PacEduActiveCurriculum);
  });
})(window, document);
