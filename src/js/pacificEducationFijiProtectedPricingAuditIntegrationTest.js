
/*

* PACIFIC EDUCATION
* FIJI PROTECTED PRICING → AUDIT GUARD INTEGRATION TEST
* VERSION 1.0.0
* 
* TEST ONLY — NOT PRODUCTION
  */

(function () {
"use strict";

const pricingEngine =
    window.PacificEducationAnnualGdpPricingEngine;

const auditGuard =
    window.PacificEducationPricingAuditGuard;

if (!pricingEngine) {
    console.error(
        "GDP Pricing Engine is unavailable."
    );
    return;
}

if (!auditGuard) {
    console.error(
        "Pricing Audit Guard is unavailable."
    );
    return;
}

const pricing =
    pricingEngine.calculateAnnualPrice({
        gdpRecord: {
            countryCode:
                "FJ",

            gdpPerCapitaUsd:
                5000,

            dataYear:
                2025,

            source:
                "TEST DATA — Fiji GDP per capita"
        },

        pricingYear:
            2026,

        currencyCode:
            "FJD"
    });

const audit =
    auditGuard.auditPlan({
        planId:
            "GDP-FIJI-2026",

        countryCode:
            "FJ",

        currency:
            pricing.currency,

        amount:
            pricing.priceLocalCurrency,

        period:
            "ANNUAL"
    });

window.PacificEducationFijiProtectedPricingAuditIntegrationTestResult =
    Object.freeze({

        testName:
            "Fiji Protected Pricing → Audit Guard Integration",

        pricingStatus:
            pricing.status,

        calculatedPrice:
            pricing.priceLocalCurrency,

        auditValid:
            audit.valid,

        auditErrors:
            audit.errors,

        protectedMarketPreserved:
            pricing.status === "PROTECTED_MARKET" &&
            pricing.priceLocalCurrency === null,

        auditRejectedUnpricedPlan:
            audit.valid === false,

        passed:
            pricing.status === "PROTECTED_MARKET" &&
            pricing.priceLocalCurrency === null &&
            audit.valid === false

    });

console.log(
    "PACIFIC EDUCATION FIJI PROTECTED PRICING → AUDIT GUARD INTEGRATION TEST",
    window.PacificEducationFijiProtectedPricingAuditIntegrationTestResult
);

})();
