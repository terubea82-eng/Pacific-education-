/*
 * Pacific Education — Pacific Guardian
 * Version: 1.1.0
 *
 * Purpose:
 * - Safety and security gate for Pacific Education.
 * - Detects high-confidence malicious activity.
 * - Persists a local quarantine state across page reloads.
 * - Preserves security evidence through Core audit where available.
 * - Never hacks back or retaliates.
 * - Does not claim client-side actions are server-side credential revocation.
 */

(function (window) {
  "use strict";

  const VERSION = "1.1.0";
  const STORAGE_KEY = "pacificEducationGuardianState";
  const LOCK_THRESHOLD = 0.95;

  const state = {
    locked: false,
    reason: null,
    lockedAt: null,
    events: []
  };

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return null;
    }
  }

  function getCore() {
    return window.PacificEducationCore || null;
  }

  function isAuthorized() {
    const core = getCore();

    return !!(
      core &&
      core.identity &&
      typeof core.identity.isAuthorized === "function" &&
      core.identity.isAuthorized()
    );
  }

  function loadPersistedState() {
    try {
      if (!window.localStorage) {
        return;
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const saved = JSON.parse(raw);

      if (!saved || typeof saved !== "object") {
        return;
      }

      state.locked = saved.locked === true;
      state.reason = saved.reason || null;
      state.lockedAt = saved.lockedAt || null;
      state.events = Array.isArray(saved.events)
        ? saved.events.slice(-200)
        : [];
    } catch (error) {
      state.locked = false;
      state.reason = null;
      state.lockedAt = null;
      state.events = [];
    }
  }

  function persistState() {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state)
        );
      }
    } catch (error) {
      /* Persistence failure must never crash the application. */
    }
  }

  function audit(event) {
    const record = {
      id:
        "guardian-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 8),

      timestamp: new Date().toISOString(),

      type:
        event && event.type
          ? String(event.type)
          : "guardian_event",

      severity:
        event && event.severity
          ? String(event.severity)
          : "information",

      details:
        event && event.details
          ? clone(event.details)
          : null
    };

    state.events.push(record);
    state.events = state.events.slice(-200);

    persistState();

    const core = getCore();

    if (
      core &&
      core.audit &&
      typeof core.audit.record === "function"
    ) {
      try {
        core.audit.record(record);
      } catch (error) {
        /* Guardian must remain operational if audit integration fails. */
      }
    }

    return record;
  }

  function checkAccess() {
    if (state.locked) {
      return {
        allowed: false,
        reason: "pacific_guardian_lock",
        locked: true
      };
    }

    if (!isAuthorized()) {
      return {
        allowed: false,
        reason: "authorization_required",
        locked: false
      };
    }

    return {
      allowed: true,
      reason: null,
      locked: false
    };
  }

  function reportThreat(threat) {
    if (!threat || typeof threat !== "object") {
      return {
        success: false,
        reason: "invalid_threat"
      };
    }

    const confidence = Number(threat.confidence);

    const safeConfidence = Number.isFinite(confidence)
      ? Math.max(0, Math.min(1, confidence))
      : 0;

    const category =
      threat.category ||
      "high_confidence_malicious_activity";

    if (safeConfidence < LOCK_THRESHOLD) {
      audit({
        type: "threat_review_required",
        severity: "warning",
        details: {
          category: category,
          confidence: safeConfidence,
          action: "review_only",
          retaliation: false
        }
      });

      return {
        success: true,
        locked: false,
        action: "review_required"
      };
    }

    state.locked = true;
    state.reason = String(category);
    state.lockedAt = new Date().toISOString();

    audit({
      type: "security_lock",
      severity: "critical",
      details: {
        category: state.reason,
        confidence: safeConfidence,
        action:
          "local_quarantine_and_security_escalation",
        retaliation: false,
        serverSideRevocationRequired: true
      }
    });

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationGuardianLock",
        {
          detail: {
            version: VERSION,
            reason: state.reason,
            confidence: safeConfidence
          }
        }
      )
    );

    return {
      success: true,
      locked: true,
      action:
        "local_quarantine_and_security_escalation",
      serverSideRevocationRequired: true
    };
  }

  function unlock() {
    audit({
      type: "unlock_attempt_blocked",
      severity: "warning",
      details: {
        reason:
          "owner_or_authorized_security_review_required"
      }
    });

    return {
      success: false,
      reason:
        "owner_or_authorized_security_review_required"
    };
  }

  function getStatus() {
    return {
      version: VERSION,
      locked: state.locked,
      reason: state.reason,
      lockedAt: state.lockedAt,
      events: state.events.slice()
    };
  }

  loadPersistedState();

  window.PacificEducationPacificGuardian =
    Object.freeze({
      version: VERSION,
      checkAccess: checkAccess,
      reportThreat: reportThreat,
      unlock: unlock,
      getStatus: getStatus
    });

  window.dispatchEvent(
    new CustomEvent(
      "pacificEducationPacificGuardianLoaded",
      {
        detail: {
          version: VERSION,
          locked: state.locked
        }
      }
    )
  );

})(window);
