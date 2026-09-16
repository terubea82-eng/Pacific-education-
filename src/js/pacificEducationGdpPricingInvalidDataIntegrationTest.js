/*
 * PACIFIC EDUCATION
 * GDP PRICING → INVALID DATA → AUDIT INTEGRATION TEST
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

    const invalidGdpRecord = {
        countryCode:
            "IN",

        gdpPerCapitaUsd:
            -2702.5,

        dataYear:
            2025,

        source:
            "TEST DATA — INVALID GDP VALUE"
    };

    const pricing =
        pricingEngine.calculateAnnualPrice({
            gdpRecord:
                invalidGdpRecord,

            pricingYear:
                2026,

            currencyCode:
                "USD"
        });

    const audit =
        auditGuard.auditPlan({
            planId:
                "INVALID-GDP-INTEGRATION-2026",

            countryCode:
                "IN",

            currency:
                pricing.currency || "USD",

            amount:
                pricing.priceUsdPerChildPerYear,

            period:
                "ANNUAL"
        });

    window.PacificEducationGdpPricingInvalidDataIntegrationTestResult =
        Object.freeze({

            testName:
                "GDP Pricing → Invalid Data → Audit Integration",

            pricingStatus:
                pricing.status,

            calculatedPrice:
                pricing.priceUsdPerChildPerYear,

            auditValid:
                audit.valid,

            auditErrors:
                audit.errors,

            invalidDataRejected:
                pricing.status === "DATA_INVALID",

            auditRejectedInvalidPrice:
                audit.valid === false,

            passed:
                pricing.status === "DATA_INVALID" &&
                pricing.priceUsdPerChildPerYear === null &&
                audit.valid === false

        });

    console.log(
        "PACIFIC EDUCATION GDP PRICING → INVALID DATA → AUDIT INTEGRATION TEST",
        window.PacificEducationGdpPricingInvalidDataIntegrationTestResult
    );

})();
