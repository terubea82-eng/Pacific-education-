/*
 * PACIFIC EDUCATION
 * COUNTRY REGISTRATION → GDP PRICING CONNECTION TEST
 * VERSION 1.0.1
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
     * TEST COUNTRY REGISTRATION
     *
     * Data structure matches the
     * Country Registration Bridge API.
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
                    "GDP pricing connection test."
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

    window.PacificEducationCountryGdpPricingConnectionTestResult =
        Object.freeze({

            testCountry:
                "India",

            registrationStatus:
                prepared.status,

            pricingStatus:
                pricing.status,

            countryCode:
                "IN",

            registrationPrepared:
                prepared.valid === true,

            gdpDataConnected:
                pricing.countryCode === "IN",

            pricingResult:
                pricing

        });

    console.log(
        "PACIFIC EDUCATION COUNTRY → GDP PRICING TEST",
        window.PacificEducationCountryGdpPricingConnectionTestResult
    );

})();


