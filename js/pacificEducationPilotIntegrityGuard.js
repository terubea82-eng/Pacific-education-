/*
 * Pacific Education — Pilot Integrity Guard
 * Version: 1.0.0
 *
 * This is a client-side pilot boundary helper, NOT a production security boundary.
 * Production authorization, authentication, payments and data access must remain
 * server-side and fail-closed.
 *
 * Purpose:
 * - Keep the controlled pilot explicitly non-production.
 * - Give every pilot module one consistent boundary contract.
 * - Prevent pilot evidence, review, dashboard actions or links from being treated
 *   as production authority.
 */
(function (window) {
  "use strict";

  var VERSION = "1.0.0";

  var CONTRACT = Object.freeze({
    pilotOnly: true,
    productionAuthority: false,
    productionApproval: false,
    productionEligible: false,
    userDataMode: "synthetic-or-pilot-only",
    productionSecurityBoundary: "server-side-required"
  });

  function snapshot() {
    return {
      version: VERSION,
      pilotOnly: true,
      productionAuthority: false,
      productionApproval: false,
      productionEligible: false,
      userDataMode: CONTRACT.userDataMode,
      productionSecurityBoundary: CONTRACT.productionSecurityBoundary
    };
  }

  function assertPilotOnly(record) {
    var value = record && typeof record === "object" ? record : {};
    return Object.assign({}, value, {
      pilotOnly: true,
      productionAuthority: false,
      productionApproval: false,
      productionEligible: false
    });
  }

  function isProductionAuthorized() {
    return false;
  }

  window.PacificEducationPilotIntegrityGuard = Object.freeze({
    version: VERSION,
    contract: CONTRACT,
    snapshot: snapshot,
    assertPilotOnly: assertPilotOnly,
    isProductionAuthorized: isProductionAuthorized
  });

  window.dispatchEvent(new CustomEvent("pacificEducationPilotIntegrityReady", {
    detail: snapshot()
  }));
})(window);
