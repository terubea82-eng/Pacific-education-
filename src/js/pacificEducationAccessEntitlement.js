/* Pacific Education — Access Entitlement & Sponsorship Boundary
 * Prototype architecture only.
 * Financial payment collection/verification is intentionally NOT implemented here.
 * A future approved provider adapter/server can create verified entitlements.
 */
(function (global) {
  "use strict";

  const VERSION = "1.0.0";
  const ACCESS = Object.freeze({
    UNPAID: "UNPAID",
    PAID: "PAID",
    SPONSORED: "SPONSORED",
    EXPIRED: "EXPIRED",
    SUSPENDED: "SUSPENDED"
  });

  const SOURCES = Object.freeze([
    "SELF",
    "PARENT_GUARDIAN",
    "SCHOOL",
    "NGO",
    "GOVERNMENT",
    "ORGANISATION",
    "DONOR_PROGRAMME"
  ]);

  const FREE_FEATURES = Object.freeze([
    "REGISTER",
    "VIEW_ACTIVITIES",
    "VIEW_PUBLIC_INFORMATION"
  ]);

  const PAID_FEATURES = Object.freeze([
    "FULL_LEARNING_PLATFORM",
    "FULL_DAILY_ACTIVITIES",
    "ASSESSMENTS",
    "PERSONALISED_PROGRESS",
    "PAID_PLAN_FEATURES"
  ]);

  function normalizeStatus(value) {
    const status = String(value || ACCESS.UNPAID).toUpperCase();
    return Object.prototype.hasOwnProperty.call(ACCESS, status) ? status : ACCESS.UNPAID;
  }

  function isFullAccess(entitlement) {
    const status = normalizeStatus(entitlement && entitlement.status);
    return status === ACCESS.PAID || status === ACCESS.SPONSORED;
  }

  function canUseFeature(entitlement, feature) {
    const f = String(feature || "").trim().toUpperCase();
    if (FREE_FEATURES.indexOf(f) !== -1) return true;
    if (PAID_FEATURES.indexOf(f) !== -1) return isFullAccess(entitlement);
    return false;
  }

  function createPendingEntitlement(input) {
    input = input || {};
    return {
      entitlementId: null,
      studentId: input.studentId || null,
      status: ACCESS.UNPAID,
      source: null,
      programmeId: null,
      planId: null,
      startsAt: null,
      endsAt: null,
      verifiedAt: null,
      providerReference: null,
      financialVerification: "DEFERRED_TO_APPROVED_PROVIDER",
      activation: "NOT_ACTIVE",
      prototypeOnly: true
    };
  }

  /* Called later by an approved server/provider integration.
     It accepts only a provider-verified result; the browser cannot mark
     an entitlement as paid or sponsored by itself. */
  function activateVerifiedEntitlement(input) {
    input = input || {};
    const status = normalizeStatus(input.status);
    if (status !== ACCESS.PAID && status !== ACCESS.SPONSORED) {
      return { success: false, status: "VERIFICATION_REQUIRED" };
    }
    if (!input.verifiedAt || !input.entitlementId) {
      return { success: false, status: "VERIFIED_ENTITLEMENT_REQUIRED" };
    }
    if (status === ACCESS.SPONSORED && SOURCES.indexOf(String(input.source || "").toUpperCase()) === -1) {
      return { success: false, status: "SPONSOR_SOURCE_REQUIRED" };
    }
    return {
      success: true,
      entitlement: {
        entitlementId: String(input.entitlementId),
        studentId: input.studentId || null,
        status: status,
        source: status === ACCESS.SPONSORED ? String(input.source).toUpperCase() : "SELF_OR_APPROVED_PAYER",
        programmeId: input.programmeId || null,
        planId: input.planId || null,
        startsAt: input.startsAt || null,
        endsAt: input.endsAt || null,
        verifiedAt: input.verifiedAt,
        providerReference: input.providerReference || null,
        activation: "ACTIVE",
        prototypeOnly: false
      }
    };
  }

  function publicStudentAccessView(entitlement) {
    const full = isFullAccess(entitlement);
    return {
      status: normalizeStatus(entitlement && entitlement.status),
      access: full ? "FULL_ACCESS" : "ACTIVITIES_VIEW_ONLY",
      paidOrSponsored: full,
      payerDetailsVisible: false,
      donorFinancialDetailsVisible: false
    };
  }

  function render(targetId, entitlement) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const view = publicStudentAccessView(entitlement || createPendingEntitlement());
    target.innerHTML =
      "<h2>Student Access</h2>" +
      "<p><strong>Registration:</strong> Available</p>" +
      "<p><strong>Current access:</strong> " + view.access.replace(/_/g, " ") + "</p>" +
      "<p>" + (view.paidOrSponsored
        ? "Paid or sponsored access is active. The student receives the full features included in the approved plan."
        : "Unpaid access can view activities, but the full learning platform remains locked.") + "</p>" +
      "<p><small>Payment and sponsorship verification are handled by an approved provider/server. Payer and donor financial details are not displayed to students or teachers.</small></p>";
  }

  global.PacificEducationAccessEntitlement = Object.freeze({
    version: VERSION,
    access: ACCESS,
    sources: SOURCES,
    freeFeatures: FREE_FEATURES,
    paidFeatures: PAID_FEATURES,
    normalizeStatus: normalizeStatus,
    isFullAccess: isFullAccess,
    canUseFeature: canUseFeature,
    createPendingEntitlement: createPendingEntitlement,
    activateVerifiedEntitlement: activateVerifiedEntitlement,
    publicStudentAccessView: publicStudentAccessView,
    render: render,
    financialIntegrationDeferred: true,
    browserCannotVerifyPayment: true
  });

  global.dispatchEvent(new CustomEvent("pacificEducationAccessEntitlementLoaded", {
    detail: { version: VERSION, financialIntegrationDeferred: true }
  }));
})(window);
