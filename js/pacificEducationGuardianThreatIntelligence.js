/**
 * Pacific Education — Pacific Guardian Threat Intelligence
 * Defensive threat-learning and incident-evidence layer.
 * Prototype/pilot only. Does not attack, probe, or retaliate against systems.
 * Production use requires server-side controls, authorized review, and legal/privacy review.
 */
(function (root) {
  "use strict";

  var VERSION = "1.0.0";
  var MAX_EVENTS = 500;
  var STORAGE_KEY = "pacificEducationGuardianThreatIntelligence";
  var SEVERITY_ORDER = { info: 1, warning: 2, critical: 3 };

  function now() { return new Date().toISOString(); }
  function clamp(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function safeText(value, max) {
    var text = String(value == null ? "" : value);
    return text.slice(0, max || 500);
  }
  function load() {
    try { return JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (_) { return []; }
  }
  function save(events) {
    try { root.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS))); }
    catch (_) {}
  }
  function record(event) {
    var events = load();
    var item = Object.assign({
      eventId: "PG-TI-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      recordedAt: now(),
      prototypeOnly: true
    }, event || {});
    events.push(item);
    save(events);
    return item;
  }

  function normalizeSignal(signal) {
    signal = signal || {};
    return {
      category: safeText(signal.category || "unknown", 100),
      indicator: safeText(signal.indicator || "", 300),
      source: safeText(signal.source || "local_security_event", 200),
      confidence: clamp(signal.confidence),
      severity: ["info", "warning", "critical"].indexOf(signal.severity) >= 0 ? signal.severity : "warning",
      relatedEventId: safeText(signal.relatedEventId || "", 120)
    };
  }

  function ingest(signal) {
    var item = normalizeSignal(signal);
    return record({ type: "threat_signal", signal: item, action: "record_and_correlate" });
  }

  function correlate(signals) {
    var list = Array.isArray(signals) ? signals.map(normalizeSignal) : [];
    var score = list.reduce(function (total, s) {
      return total + (s.confidence * (SEVERITY_ORDER[s.severity] || 1));
    }, 0);
    var risk = Math.min(1, score / Math.max(1, list.length * 3));
    return record({
      type: "threat_correlation",
      signalCount: list.length,
      riskScore: risk,
      action: risk >= 0.95 ? "escalate_for_authorized_security_review" : "continue_monitoring"
    });
  }

  function historicalSummary(events) {
    var list = Array.isArray(events) ? events : load();
    var counts = {};
    list.forEach(function (e) {
      var category = e && e.signal && e.signal.category || e.category || "unknown";
      counts[category] = (counts[category] || 0) + 1;
    });
    return { eventCount: list.length, categories: counts };
  }

  function forecast(signals) {
    var list = Array.isArray(signals) ? signals.map(normalizeSignal) : [];
    var recurring = {};
    list.forEach(function (s) {
      recurring[s.category] = (recurring[s.category] || 0) + 1;
    });
    return record({
      type: "emerging_threat_assessment",
      basis: "observed defensive security signals only",
      recurringCategories: recurring,
      status: "forecast_requires_authorized_human_review",
      automaticDeployment: false,
      automaticProductionApproval: false,
      action: "prepare_defensive_controls_for_testing"
    });
  }

  function createEvidencePacket(eventIds) {
    var wanted = Array.isArray(eventIds) ? eventIds : [];
    var events = load().filter(function (e) { return wanted.indexOf(e.eventId) >= 0; });
    return {
      packetId: "PG-EVIDENCE-" + Date.now(),
      createdAt: now(),
      purpose: "authorized security incident reporting",
      events: events,
      privacyNote: "Use only lawfully collected information and disclose only what is necessary and authorized.",
      authorityReviewRequired: true,
      directInvestigationByGuardian: false,
      retaliation: false
    };
  }

  function getStatus() {
    return {
      version: VERSION,
      eventCount: load().length,
      historicalAnalysis: true,
      currentCorrelation: true,
      emergingThreatAssessment: true,
      automaticAttack: false,
      automaticRetaliation: false,
      automaticProductionDeployment: false,
      serverSideSecurityRequired: true,
      authorizedHumanReviewRequired: true
    };
  }

  root.PacificEducationGuardianThreatIntelligence = {
    version: VERSION,
    ingest: ingest,
    correlate: correlate,
    historicalSummary: historicalSummary,
    forecast: forecast,
    createEvidencePacket: createEvidencePacket,
    getStatus: getStatus
  };
})(window);
