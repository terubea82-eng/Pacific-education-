
/*
 * PACIFIC EDUCATION
 * FIJI REGISTRATION → PROTECTED PRICING TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION
 */

(function () {
    "use strict";

    const registrationBridge =
        window.PacificEducationCountryRegistrationBridge;

    const pricingEngine =
        window.PacificEducationAnnualGdpPricingEngine;

    if (!registrationBridge) {
        console.error(
            "Country Registration Bridge is unavailable."
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
     * TEST FIJI REGISTRATION
     */
    const registration =
        registrationBridge.createRegistrationRecord({

            country: {
                name: "Fiji",
                alpha2: "FJ",
                alpha3: "FJI",
                numeric3: "242",
                codeStatus: "ISO_OFFICIAL",
                currencyCode: "FJD"
            },

            authority: {
                name: "TEST AUTHORITY",
                officialWebsite: ""
            },

            contact: {
                name: "TEST USER",
                email: "test@example.com"
            },

            request: {
                type:
                    "NEW_COUNTRY_REGISTRATION",

                supportingInformation:
                    "Fiji protected pricing connection test."
            }

        });

    const prepared =
        registrationBridge.prepareForVerification(
            registration
        );

    /*
     * TEST GDP DATA
     *
     * The value is intentionally supplied only
     * to confirm that Fiji remains protected.
     */
    const fijiGdpRecord = {
        countryCode: "FJ",
        gdpPerCapitaUsd: 5000,
        dataYear: 2025,
        source:
            "TEST DATA — Fiji GDP per capita",
        retrievedAt:
            new Date().toISOString()
    };

    const pricing =
        pricingEngine.calculateAnnualPrice({

            gdpRecord:
                fijiGdpRecord,

            pricingYear:
                2026,

            currencyCode:
                "FJD"

        });

    window.PacificEducationFijiRegistrationProtectedPricingTestResult =
        Object.freeze({

            testCountry:
                "Fiji",

            countryCode:
                "FJ",

            registrationStatus:
                prepared.status,

            registrationPrepared:
                prepared.valid === true,

            pricingStatus:
                pricing.status,

            priceCalculated:
                pricing.priceUsdPerChildPerYear !== null,

            localPriceCalculated:
                pricing.priceLocalCurrency !== null,

            pricingResult:
                pricing

        });

    console.log(
        "PACIFIC EDUCATION FIJI REGISTRATION → PROTECTED PRICING TEST",
        window.PacificEducationFijiRegistrationProtectedPricingTestResult
    );

})();
