/*

* PACIFIC EDUCATION
* PRICING AUDIT MULTIPLE-PLANS TEST
* VERSION 1.0.0
* 
* TEST ONLY — NOT PRODUCTION
  */

(function () {
"use strict";

const auditGuard =
    window.PacificEducationPricingAuditGuard;

if (!auditGuard) {
    console.error(
        "Pricing Audit Guard is unavailable."
    );
    return;
}

const plans = [
    {
        planId:
            "TEST-INDIA-2026",

        countryCode:
            "IN",

        currency:
            "USD",

        amount:
            0.81,

        period:
            "ANNUAL"
    },

    {
        planId:
            "TEST-SECOND-VALID",

        countryCode:
            "AU",

        currency:
            "USD",

        amount:
            5,

        period:
            "ANNUAL"
    },

    {
        planId:
            "TEST-MISSING-AMOUNT",

        countryCode:
            "XX",

        currency:
            "USD",

        period:
            "ANNUAL"
    }
];

const audit =
    auditGuard.auditPlans(
        plans
    );

window.PacificEducationPricingAuditMultiplePlansTestResult =
    Object.freeze({
        testName:
            "Pricing Audit Guard — Multiple Plans",

        planCount:
            plans.length,

        auditResult:
            audit
    });

console.log(
    "PACIFIC EDUCATION PRICING AUDIT MULTIPLE-PLANS TEST",
    window.PacificEducationPricingAuditMultiplePlansTestResult
);

})();
