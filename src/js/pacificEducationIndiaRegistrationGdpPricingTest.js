/*
 * PACIFIC EDUCATION
 * INDIA REGISTRATION → GDP PRICING TEST
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
     * TEST INDIA REGISTRATION
     */
    const registration =
        registrationBridge.createRegistrationRecord({

            country: {
                name: "India",
                alpha2: "IN",
                alpha3: "IND",
                numeric3: "356",
                codeStatus: "ISO_OFFICIAL",
                currencyCode: "INR"
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
                    "India registration → GDP pricing connection test."
            }

        });

    const prepared =
        registrationBridge.prepareForVerification(
            registration
        );

    /*
     * TEST GDP DATA
     *
     * World Bank 2025 GDP per capita,
     * current US dollars.
     */
    const indiaGdpRecord = {
        countryCode: "IN",
        gdpPerCapitaUsd: 2702.5,
        dataYear: 2025,
        source:
            "World Bank — GDP per capita",
        retrievedAt:
            new Date().toISOString()
    };

    const pricing =
        pricingEngine.calculateAnnualPrice({

            gdpRecord:
                indiaGdpRecord,

            pricingYear:
                2026,

            currencyCode:
                "USD"

        });

    window.PacificEducationIndiaRegistrationGdpPricingTestResult =
        Object.freeze({

            testCountry:
                "India",

            countryCode:
                "IN",

            registrationStatus:
                prepared.status,

            registrationPrepared:
                prepared.valid === true,

            pricingStatus:
                pricing.status,

            priceCalculated:
                pricing.priceUsdPerChildPerYear !== null,

            priceUsdPerChildPerYear:
                pricing.priceUsdPerChildPerYear,

            pricingResult:
                pricing

        });

    console.log(
        "PACIFIC EDUCATION INDIA REGISTRATION → GDP PRICING TEST",
        window.PacificEducationIndiaRegistrationGdpPricingTestResult
    );

})();
