/*

* PACIFIC EDUCATION
* INDIA REGISTRATION → GDP PRICING → AUDIT END-TO-END TEST
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

const auditGuard =
    window.PacificEducationPricingAuditGuard;

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

if (!auditGuard) {
    console.error(
        "Pricing Audit Guard is unavailable."
    );
    return;
}

const registration =
    registrationBridge.createRegistrationRecord({
        country: {
            name:
                "India",

            alpha2:
                "IN",

            alpha3:
                "IND",

            numeric3:
                "356",

            codeStatus:
                "ISO_OFFICIAL",

            currencyCode:
                "INR"
        },

        authority: {
            name:
                "TEST AUTHORITY",

            officialWebsite:
                ""
        },

        contact: {
            name:
                "TEST USER",

            email:
                "test@example.com"
        },

        request: {
            type:
                "NEW_COUNTRY_REGISTRATION",

            supportingInformation:
                "India end-to-end registration, GDP pricing and audit test."
        }
    });

const prepared =
    registrationBridge.prepareForVerification(
        registration
    );

const gdpRecord = {
    countryCode:
        "IN",

    gdpPerCapitaUsd:
        2702.5,

    dataYear:
        2025,

    source:
        "World Bank — GDP per capita"
};

const pricing =
    pricingEngine.calculateAnnualPrice({
        gdpRecord:
            gdpRecord,

        pricingYear:
            2026,

        currencyCode:
            "USD"
    });

const audit =
    auditGuard.auditPlan({
        planId:
            "INDIA-END-TO-END-2026",

        countryCode:
            "IN",

        currency:
            pricing.currency,

        amount:
            pricing.priceUsdPerChildPerYear,

        period:
            "ANNUAL"
    });

window.PacificEducationIndiaRegistrationGdpPricingAuditEndToEndTestResult =
    Object.freeze({

        testName:
            "India Registration → GDP Pricing → Audit End-to-End",

        registrationStatus:
            prepared.status,

        registrationPrepared:
            prepared.valid === true,

        pricingStatus:
            pricing.status,

        calculatedPrice:
            pricing.priceUsdPerChildPerYear,

        auditValid:
            audit.valid,

        auditErrors:
            audit.errors,

        passed:
            prepared.valid === true &&
            prepared.status === "PENDING_REVIEW" &&
            pricing.status === "CALCULATED" &&
            pricing.priceUsdPerChildPerYear !== null &&
            audit.valid === true &&
            audit.errors.length === 0

    });

console.log(
    "PACIFIC EDUCATION INDIA REGISTRATION → GDP PRICING → AUDIT END-TO-END TEST",
    window.PacificEducationIndiaRegistrationGdpPricingAuditEndToEndTestResult
);

})();
