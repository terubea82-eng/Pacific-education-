/*
 * PACIFIC EDUCATION
 * GDP PRICING → PRODUCTION AUTHORIZATION GUARD TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION
 */

(function () {
    "use strict";

    const engine =
        window.PacificEducationAnnualGdpPricingEngine;

    if (!engine) {
        console.error(
            "GDP Pricing Engine is unavailable."
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

    const productionBlocked =
        pricing.status ===
            "PRODUCTION_REQUIRED";

    const priceUnavailable =
        pricing.priceUsdPerChildPerYear ===
            null ||
        typeof pricing.priceUsdPerChildPerYear ===
            "undefined";

    window.PacificEducationGdpPricingProductionAuthorizationGuardTestResult =
        Object.freeze({

            testName:
                "GDP Pricing → Production Authorization Guard",

            pricingStatus:
                pricing.status,

            productionBlocked:
                productionBlocked,

            priceUnavailable:
                priceUnavailable,

            pricingResult:
                pricing,

            passed:
                productionBlocked &&
                priceUnavailable

        });

    console.log(
        "PACIFIC EDUCATION GDP PRICING → PRODUCTION AUTHORIZATION GUARD TEST",
        window.PacificEducationGdpPricingProductionAuthorizationGuardTestResult
    );

})();
