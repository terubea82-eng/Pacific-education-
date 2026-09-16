/*
 * PACIFIC EDUCATION
 * GDP PRICING → PRODUCTION AUTHORIZATION → AUDIT INTEGRATION TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION
 */

(function () {
    "use strict";

    const engine =
        window.PacificEducationAnnualGdpPricingEngine;

    const auditGuard =
        window.PacificEducationPricingAuditGuard;

    if (!engine) {
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

    const gdpRecord = {
        countryCode:
            "IN",

        gdpPerCapitaUsd:
            2702.5,

        dataYear:
            2025,

        source:
            "TEST DATA — World Bank GDP per capita"
    };

    const pricing =
        engine.calculateAnnualPrice({
            gdpRecord:
                gdpRecord,

            pricingYear:
                2026,

            currencyCode:
                "USD",

            productionAuthorization:
                true
        });

    const audit =
        auditGuard.auditPlan({
            planId:
                "INDIA-PRODUCTION-AUTH-AUDIT-2026",

            countryCode:
                "IN",

            currency:
                pricing.currency,

            amount:
                pricing.priceUsdPerChildPerYear,

            period:
                "ANNUAL"
        });

    const productionBlocked =
        pricing.status ===
            "PRODUCTION_REQUIRED";

    const priceUnavailable =
        pricing.priceUsdPerChildPerYear ===
            null ||
        typeof pricing.priceUsdPerChildPerYear ===
            "undefined";

    const auditRejected =
        audit.valid === false;

    window.PacificEducationGdpPricingProductionAuthorizationAuditIntegrationTestResult =
        Object.freeze({

            testName:
                "GDP Pricing → Production Authorization → Audit Integration",

            pricingStatus:
                pricing.status,

            productionBlocked:
                productionBlocked,

            priceUnavailable:
                priceUnavailable,

            auditValid:
                audit.valid,

            auditErrors:
                audit.errors,

            auditRejected:
                auditRejected,

            pricingResult:
                pricing,

            auditResult:
                audit,

            passed:
                productionBlocked &&
                priceUnavailable &&
                auditRejected

        });

    console.log(
        "PACIFIC EDUCATION GDP PRICING → PRODUCTION AUTHORIZATION → AUDIT INTEGRATION TEST",
        window.PacificEducationGdpPricingProductionAuthorizationAuditIntegrationTestResult
    );

})();
