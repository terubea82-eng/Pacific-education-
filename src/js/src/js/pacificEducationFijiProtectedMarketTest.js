/*
 * PACIFIC EDUCATION
 * FIJI PROTECTED-MARKET TEST
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

    const fijiGdpRecord = {
        countryCode: "FJ",
        gdpPerCapitaUsd: 5000,
        dataYear: 2025,
        source: "TEST DATA — Fiji GDP per capita",
        retrievedAt:
            new Date().toISOString()
    };

    const result =
        engine.calculateAnnualPrice({
            gdpRecord:
                fijiGdpRecord,

            pricingYear:
                2026,

            currencyCode:
                "FJD"
        });

    window.PacificEducationFijiProtectedMarketTestResult =
        Object.freeze({
            testCountry: "Fiji",
            countryCode: "FJ",
            pricingYear: 2026,
            result: result
        });

    console.log(
        "PACIFIC EDUCATION FIJI PROTECTED-MARKET TEST",
        window.PacificEducationFijiProtectedMarketTestResult
    );

})();
