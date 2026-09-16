/*
 * PACIFIC EDUCATION
 * GDP PRICING → PRODUCTION AUTHORIZATION → AUDIT INTEGRATION TEST
 * VERSION 1.0.1
 *
 * TEST ONLY — NOT PRODUCTION
 */

(function () {
    "use strict";

    const engine =
        window.PacificEducationAnnualGdpPricingEngine;

    const auditGuard =
        window.PacificEducationPricingAuditGuard;

    const diagnostic = {
        testName:
            "GDP Pricing → Production Authorization → Audit Integration",

        engineLoaded:
            !!engine,

        auditGuardLoaded:
            !!auditGuard,

        engineFunctionAvailable:
            !!(
                engine &&
                typeof engine.calculateAnnualPrice === "function"
            ),

        auditFunctionAvailable:
            !!(
                auditGuard &&
                typeof auditGuard.auditPlan === "function"
            )
    };

    if (!engine) {
        diagnostic.passed = false;
        diagnostic.error =
            "GDP Pricing Engine is unavailable.";

        window.PacificEducationGdpPricingProductionAuthorizationAuditIntegrationTestResult =
            Object.freeze(diagnostic);

        console.error(
            "PACIFIC EDUCATION TEST FAILED",
            diagnostic
        );

        return;
    }

    if (!auditGuard) {
        diagnostic.passed = false;
        diagnostic.error =
            "Pricing Audit Guard is unavailable.";

        window.PacificEducationGdpPricingProductionAuthorizationAuditIntegrationTestResult =
            Object.freeze(diagnostic);

        console.error(
            "PACIFIC EDUCATION TEST FAILED",
            diagnostic
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

            engineLoaded:
                true,

            auditGuardLoaded:
                true,

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
