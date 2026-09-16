
/*
 * PACIFIC EDUCATION
 * GDP → PRICING CONNECTION TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION PRICING
 */

(function () {
    "use strict";

    const engine =
        window.PacificEducationAnnualGdpPricingEngine;

    if (!engine) {
        console.error(
            "Pacific Education GDP Pricing Engine is unavailable."
        );
        return;
    }

    /*
     * World Bank 2025 GDP per capita
     * Current US dollars.
     *
     * Test record only.
     */
    const indiaGdpRecord = {
        countryCode: "IN",
        gdpPerCapitaUsd: 2702.5,
        dataYear: 2025,
        source: "World Bank — GDP per capita",
        retrievedAt: new Date().toISOString()
    };

    const result =
        engine.calculateAnnualPrice({
            gdpRecord:
                indiaGdpRecord,

            pricingYear:
                2026,

            currencyCode:
                "USD"
        });

    console.log(
        "PACIFIC EDUCATION GDP PRICING TEST",
        result
    );

    window.PacificEducationGdpPricingTestResult =
        Object.freeze({
            testCountry: "India",
            countryCode: "IN",
            gdpDataYear: 2025,
            pricingYear: 2026,
            result: result
        });

})();
