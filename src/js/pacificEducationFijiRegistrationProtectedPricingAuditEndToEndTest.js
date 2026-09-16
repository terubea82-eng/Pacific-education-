
/*

* PACIFIC EDUCATION
* FIJI REGISTRATION → PROTECTED PRICING → AUDIT END-TO-END TEST
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
                "Fiji",

            alpha2:
                "FJ",

            alpha3:
                "FJI",

            numeric3:
                "242",

            codeStatus:
                "ISO_OFFICIAL",

            currencyCode:
                "FJD"
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
                "Fiji protected-market end-to-end registration, pricing and audit test."
        }
    });

const prepared =
    registrationBridge.prepareForVerification(
        registration
    );

const gdpRecord = {
    countryCode:
        "FJ",

    gdpPerCapitaUsd:
        5000,

    dataYear:
        2025,

    source:
        "TEST DATA — Fiji GDP per capita"
};

const pricing =
    pricingEngine.calculateAnnualPrice({
        gdpRecord:
            gdpRecord,

        pricingYear:
            2026,

        currencyCode:
            "FJD"
    });

const audit =
    auditGuard.auditPlan({
        planId:
            "FIJI-PROTECTED-END-TO-END-2026",

        countryCode:
            "FJ",

        currency:
            pricing.currency,

        amount:
            pricing.priceLocalCurrency,

        period:
            "ANNUAL"
    });

window.PacificEducationFijiRegistrationProtectedPricingAuditEndToEndTestResult =
    Object.freeze({

        testName:
            "Fiji Registration → Protected Pricing → Audit End-to-End",

        registrationStatus:
            prepared.status,

        registrationPrepared:
            prepared.valid === true,

        pricingStatus:
            pricing.status,

        calculatedPrice:
            pricing.priceLocalCurrency,

        auditValid:
            audit.valid,

        auditErrors:
            audit.errors,

        protectedMarketPreserved:
            pricing.status === "PROTECTED_MARKET" &&
            pricing.priceLocalCurrency === null,

        auditRejectedUnpricedPlan:
            audit.valid === false,

        passed:
            prepared.valid === true &&
            prepared.status === "PENDING_REVIEW" &&
            pricing.status === "PROTECTED_MARKET" &&
            pricing.priceLocalCurrency === null &&
            audit.valid === false

    });

console.log(
    "PACIFIC EDUCATION FIJI REGISTRATION → PROTECTED PRICING → AUDIT END-TO-END TEST",
    window.PacificEducationFijiRegistrationProtectedPricingAuditEndToEndTestResult
);

})();
