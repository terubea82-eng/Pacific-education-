/*

* PACIFIC EDUCATION
* GDP PRICING → AUDIT GUARD INTEGRATION TEST
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
                "IN",

            gdpPerCapitaUsd:
                2702.5,

            dataYear:
                2025,

            source:
                "World Bank — GDP per capita"
        },

        pricingYear:
            2026,

        currencyCode:
            "USD"
    });

const audit =
    auditGuard.auditPlan({
        planId:
            "GDP-INDIA-2026",

        countryCode:
            "IN",

        currency:
            pricing.currency,

        amount:
            pricing.priceUsdPerChildPerYear,

        period:
            "ANNUAL"
    });

window.PacificEducationGdpPricingAuditIntegrationTestResult =
    Object.freeze({

        testName:
            "GDP Pricing → Audit Guard Integration",

        pricingStatus:
            pricing.status,

        calculatedPrice:
            pricing.priceUsdPerChildPerYear,

        auditValid:
            audit.valid,

        auditErrors:
            audit.errors,

        passed:
            pricing.status === "CALCULATED" &&
            pricing.priceUsdPerChildPerYear !== null &&
            audit.valid === true &&
            audit.errors.length === 0

    });

console.log(
    "PACIFIC EDUCATION GDP PRICING → AUDIT GUARD INTEGRATION TEST",
    window.PacificEducationGdpPricingAuditIntegrationTestResult
);

})();
