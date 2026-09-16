
/*
 * PACIFIC EDUCATION
 * PRICING AUDIT GUARD TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION
 */

(function () {
    "use strict";

    const auditGuard =
        window.PacificEducationPricingAuditGuard;

    const pricingEngine =
        window.PacificEducationAnnualGdpPricingEngine;

    if (!auditGuard) {
        console.error(
            "Pricing Audit Guard is unavailable."
        );
        return;
    }

    if (!pricingEngine) {
        console.error(
            "GDP Pricing Engine is unavailable."
        );
        return;
    }

    /*
     * FIJI — PROTECTED MARKET
     */
    const fijiPricing =
        pricingEngine.calculateAnnualPrice({

            gdpRecord: {
                countryCode: "FJ",
                gdpPerCapitaUsd: 5000,
                dataYear: 2025,
                source:
                    "TEST DATA — Fiji GDP per capita"
            },

            pricingYear: 2026,
            currencyCode: "FJD"

        });

    /*
     * INDIA — CALCULATED MARKET
     */
    const indiaPricing =
        pricingEngine.calculateAnnualPrice({

            gdpRecord: {
                countryCode: "IN",
                gdpPerCapitaUsd: 2702.5,
                dataYear: 2025,
                source:
                    "World Bank — GDP per capita"
            },

            pricingYear: 2026,
            currencyCode: "USD"

        });

    /*
     * AUDIT THE ACTUAL CALCULATED INDIA PRICE.
     */
    const indiaAudit =
        auditGuard.auditPlan({

            planId:
                "TEST-INDIA-2026",

            countryCode:
                "IN",

            currency:
                indiaPricing.currency,

            amount:
                indiaPricing.priceUsdPerChildPerYear,

            period:
                "ANNUAL"

        });

    /*
     * FIJI MUST NOT BE AUDITED AS A
     * CALCULATED PRICE.
     */
    const fijiAudit =
        auditGuard.auditPlan({

            planId:
                "TEST-FIJI-2026",

            countryCode:
                "FJ",

            currency:
                fijiPricing.currency,

            amount:
                fijiPricing.priceLocalCurrency,

            period:
                "ANNUAL"

        });

    window.PacificEducationPricingAuditGuardTestResult =
        Object.freeze({

            testName:
                "Pricing Audit Guard — Fiji + India",

            pricingYear:
                2026,

            fiji: {

                pricingStatus:
                    fijiPricing.status,

                priceCalculated:
                    fijiPricing.priceLocalCurrency !== null,

                auditResult:
                    fijiAudit

            },

            india: {

                pricingStatus:
                    indiaPricing.status,

                price:
                    indiaPricing.priceUsdPerChildPerYear,

                auditResult:
                    indiaAudit

            }

        });

    console.log(
        "PACIFIC EDUCATION PRICING AUDIT GUARD TEST",
        window.PacificEducationPricingAuditGuardTestResult
    );

})();
