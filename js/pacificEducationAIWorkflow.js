/*
 * Pacific Education — AI Workflow
 * Version: 1.1.0
 *
 * Safe coordination layer only. Human review remains mandatory.
 */
(function () {
  "use strict";

  const VERSION = "1.1.0";
  const AUDIT_KEY = "pacificEducationAIWorkflowAudit";
  const MAX_AUDIT = 200;

  function getCore() {
    return window.PacificEducationCore || null;
  }

  function getGuardian() {
    return window.PacificEducationPacificGuardian || null;
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

  function guardianCheck() {
    const guardian = getGuardian();

    if (!guardian || typeof guardian.checkAccess !== "function") {
      return {
        allowed: false,
        reason: "pacific_guardian_unavailable"
      };
    }

    const result = guardian.checkAccess();

    return result && typeof result === "object"
      ? result
      : {
          allowed: false,
          reason: "pacific_guardian_check_failed"
        };
  }

  function readAudit() {
    try {
      const raw = window.localStorage.getItem(AUDIT_KEY);
      const data = raw ? JSON.parse(raw) : [];

      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function writeAudit(records) {
    try {
      window.localStorage.setItem(
        AUDIT_KEY,
        JSON.stringify(records.slice(-MAX_AUDIT))
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  function audit(type, details) {
    const record = {
      id:
        "ai-workflow-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      type: type,
      severity: "information",
      details: details || null
    };

    const records = readAudit();

    records.push(record);
    writeAudit(records);

    return record;
  }

  function getAudit() {
    return readAudit();
  }

  function start(request) {
    if (!isAuthorized()) {
      audit("ai_workflow_blocked", {
        reason: "authorization_required"
      });

      return {
        success: false,
        status: "blocked",
        reason: "authorization_required"
      };
    }

    const guardian = guardianCheck();

    if (!guardian.allowed) {
      audit("ai_workflow_blocked", {
        reason: guardian.reason
      });

      return {
        success: false,
        status: "blocked",
        reason: guardian.reason
      };
    }

    if (
      !request ||
      typeof request !== "object" ||
      Array.isArray(request)
    ) {
      audit("ai_workflow_blocked", {
        reason: "invalid_request"
      });

      return {
        success: false,
        status: "blocked",
        reason: "invalid_request"
      };
    }

    audit("ai_workflow_started", {
      requestType:
        request.type || "education_assistance"
    });

    return {
      success: true,
      status: "review_required",

      workflow: [
        "request",
        "authorization_verified",
        "pacific_guardian_verified",
        "ai_assistance",
        "human_review",
        "approval",
        "output",
        "secure_handoff",
        "audit"
      ],

      aiDecision: null,
      officialDecision: false,
      teacherReviewRequired: true
    };
  }

  function assist(request) {
    const result = start(request);

    if (!result.success) {
      return result;
    }

    audit("ai_assistance_prepared", {
      requestType:
        request.type || "education_assistance"
    });

    return Object.assign({}, result, {
      assistance: {
        status: "assistive_only",
        message:
          "AI assistance prepared for authorized human review.",
        mayAutoApprove: false,
        mayGuessUnclearEvidence: false
      }
    });
  }

  function approve() {
    audit("ai_approval_blocked", {
      reason: "authorized_human_approval_required"
    });

    return {
      success: false,
      status: "review_required",
      reason: "authorized_human_approval_required"
    };
  }

  function getStatus() {
    return {
      version: VERSION,
      available: true,
      authorized: isAuthorized(),
      guardianAvailable: !!getGuardian(),
      humanReviewRequired: true,
      automaticOfficialApproval: false,

      auditPersistence:
        "local_browser_only",

      serverAuditRequiredForProduction: true
    };
  }

  window.PacificEducationAIWorkflow = Object.freeze({
    version: VERSION,
    isAuthorized: isAuthorized,
    start: start,
    assist: assist,
    approve: approve,
    getAudit: getAudit,
    getStatus: getStatus
  });

  window.dispatchEvent(
    new CustomEvent(
      "pacificEducationAIWorkflowLoaded",
      {
        detail: {
          version: VERSION
        }
      }
    )
  );
})();
