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

  function activatePilotFeature(feature) {
    var allowed = [
      "registration","prototypeAccess","learningLevel","subject","term",
      "capability","dailyActivities","practice","assessment","coverage",
      "alphabetAssessment","phonicsAssessment","teacherDashboard",
      "parentDashboard","specialEducation","reviewer","voice","accessibility",
      "mailbox","progress","countryLanguage","teacherDailyActivities","blindAttempts",
      "curriculumCoverage","dailyProgress","teacherReview","studentProgress","aiPlayback",
      "externalReviewer","connectivity","offlineSync","pwaInstall","futureSafeRepair"
    ];
    var protectedFeatures = [
      "productionAuth","productionPayments","buyPlans","ownerPaymentControl",
      "productionDatabase","productionEntitlements"
    ];
    feature = String(feature || "").trim();
    if (protectedFeatures.indexOf(feature) !== -1 || allowed.indexOf(feature) === -1) {
      return {active:false, feature:feature, reason:"Pilot integrity boundary blocked this feature activation."};
    }
    return {
      active:true,
      feature:feature,
      pilotOnly:true,
      productionAuthority:false,
      productionEligible:false
    };
  }

  function activationSnapshot() {
    return {
      state:"secure-pilot-active",
      requiredSequence:[
        "welcome","registration","prototypeAccess","learningLevel","subject",
        "term","capability","dailyActivities","practice","assessment","coverage"
      ],
      questionTypes:[
        "multiple_choice","true_false","matching","short_answer","long_answer",
        "text_response","audio_response","answer_space"
      ],
      allClassesEnabled:true,
      pilotOnly:true,
      productionEligible:false
    };
  }

  window.PacificEducationPilotIntegrityGuard = Object.freeze({
    version: VERSION,
    contract: CONTRACT,
    snapshot: snapshot,
    activatePilotFeature: activatePilotFeature,
    activationSnapshot: activationSnapshot,
    assertPilotOnly: assertPilotOnly,
    isProductionAuthorized: isProductionAuthorized
  });

  window.dispatchEvent(new CustomEvent("pacificEducationPilotIntegrityReady", {
    detail: snapshot()
  }));
})(window);
