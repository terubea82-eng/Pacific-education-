
/*
 * PACIFIC EDUCATION
 * MIXED MARKET PRICING TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION
 *
 * Tests:
 * 1. Fiji → Protected Market
 * 2. India → GDP Calculated Pricing
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

    function createRegistration(country) {
        const registration =
            registrationBridge.createRegistrationRecord({

                country: country,

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
                        "Mixed market pricing test."
                }

            });

        return registrationBridge.prepareForVerification(
            registration
        );
    }

    /*
     * FIJI
     */
    const fijiRegistration =
        createRegistration({

            name: "Fiji",
            alpha2: "FJ",
            alpha3: "FJI",
            numeric3: "242",
            codeStatus: "ISO_OFFICIAL",
            currencyCode: "FJD"

        });

    const fijiPricing =
        pricingEngine.calculateAnnualPrice({

            gdpRecord: {
                countryCode: "FJ",
                gdpPerCapitaUsd: 5000,
                dataYear: 2025,
                source:
                    "TEST DATA — Fiji GDP per capita",
                retrievedAt:
                    new Date().toISOString()
            },

            pricingYear: 2026,
            currencyCode: "FJD"

        });

    /*
     * INDIA
     */
    const indiaRegistration =
        createRegistration({

            name: "India",
            alpha2: "IN",
            alpha3: "IND",
            numeric3: "356",
            codeStatus: "ISO_OFFICIAL",
            currencyCode: "INR"

        });

    const indiaPricing =
        pricingEngine.calculateAnnualPrice({

            gdpRecord: {
                countryCode: "IN",
                gdpPerCapitaUsd: 2702.5,
                dataYear: 2025,
                source:
                    "World Bank — GDP per capita",
                retrievedAt:
                    new Date().toISOString()
            },

            pricingYear: 2026,
            currencyCode: "USD"

        });

    const mixedTestResult = {

        testName:
            "Fiji Protected Market + India GDP Pricing",

        pricingYear:
            2026,

        fiji: {

            registrationStatus:
                fijiRegistration.status,

            registrationPrepared:
                fijiRegistration.valid === true,

            pricingStatus:
                fijiPricing.status,

            priceCalculated:
                fijiPricing.priceUsdPerChildPerYear !== null,

            localPriceCalculated:
                fijiPricing.priceLocalCurrency !== null,

            pricingResult:
                fijiPricing

        },

        india: {

            registrationStatus:
                indiaRegistration.status,

            registrationPrepared:
                indiaRegistration.valid === true,

            pricingStatus:
                indiaPricing.status,

            priceCalculated:
                indiaPricing.priceUsdPerChildPerYear !== null,

            priceUsdPerChildPerYear:
                indiaPricing.priceUsdPerChildPerYear,

            pricingResult:
                indiaPricing

        }

    };

    window.PacificEducationMixedMarketPricingTestResult =
        Object.freeze(
            mixedTestResult
        );

    console.log(
        "PACIFIC EDUCATION MIXED MARKET PRICING TEST",
        window.PacificEducationMixedMarketPricingTestResult
    );

})();
