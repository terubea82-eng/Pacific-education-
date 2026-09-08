/*
 * Pacific Education — Pacific Guardian
 * Version: 1.0.0
 *
 * Purpose:
 * - Safety and security gate for Pacific Education.
 * - Detects high-confidence malicious activity.
 * - Blocks unsafe actions without hacking back.
 * - Preserves audit evidence.
 * - Protects children, students, parents, teachers and organizations.
 */

(function () {
  "use strict";

  const VERSION = "1.0.0";

  const state = {
    locked: false,
    reason: null,
    events: []
  };

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

  function audit(event) {
    const record = {
      id: "guardian-" + Date.now(),
      timestamp: new Date().toISOString(),
      type: event && event.type
        ? event.type
        : "guardian_event",
      severity: event && event.severity
        ? event.severity
        : "information",
      details: event && event.details
        ? event.details
        : null
    };

    state.events.push(record);

    const core = getCore();

    if (
      core &&
      typeof core.audit === "object" &&
      typeof core.audit.record === "function"
    ) {
      core.audit.record(record);
    }

    return record;
  }

  function checkAccess() {
    if (state.locked) {
      return {
        allowed: false,
        reason: "pacific_guardian_lock"
      };
    }

    if (!isAuthorized()) {
      return {
        allowed: false,
        reason: "authorization_required"
      };
    }

    return {
      allowed: true,
      reason: null
    };
  }

  function reportThreat(threat) {
    if (!threat || typeof threat !== "object") {
      return {
        success: false,
        reason: "invalid_threat"
      };
    }

    const confidence =
      typeof threat.confidence === "number"
        ? threat.confidence
        : 0;

    if (confidence < 0.95) {
      audit({
        type: "threat_review_required",
        severity: "warning",
        details: {
          category: threat.category || "unknown",
          confidence: confidence
        }
      });

      return {
        success: true,
        locked: false,
        action: "review_required"
      };
    }

    state.locked = true;
    state.reason = threat.category || "high_confidence_malicious_activity";

    audit({
      type: "security_lock",
      severity: "critical",
      details: {
        category: state.reason,
        confidence: confidence,
        action: "lock_quarantine_revoke_preserve_escalate",
        retaliation: false
      }
    });

    window.dispatchEvent(
      new CustomEvent("pacificEducationGuardianLock", {
        detail: {
          version: VERSION,
          reason: state.reason
        }
      })
    );

    return {
      success: true,
      locked: true,
      action: "lock_quarantine_revoke_preserve_escalate"
    };
  }

  function unlock() {
    return {
      success: false,
      reason: "owner_or_authorized_security_review_required"
    };
  }

  function getStatus() {
    return {
      version: VERSION,
      locked: state.locked,
      reason: state.reason,
      events: state.events.slice()
    };
  }

  window.PacificEducationPacificGuardian = Object.freeze({
    version: VERSION,
    checkAccess: checkAccess,
    reportThreat: reportThreat,
    unlock: unlock,
    getStatus: getStatus
  });

  window.dispatchEvent(
    new CustomEvent("pacificEducationPacificGuardianLoaded", {
      detail: {
        version: VERSION
      }
    })
  );

})();
