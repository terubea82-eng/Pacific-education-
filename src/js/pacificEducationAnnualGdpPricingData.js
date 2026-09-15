
/* =========================================================
   PACIFIC EDUCATION
   ANNUAL GDP PRICING DATA

   File:
   src/js/pacificEducationAnnualGdpPricingData.js

   Purpose:
   - Store approved international GDP pricing records.
   - Supply data to the Annual GDP Pricing Engine.
   - Keep Fiji pricing separate.
   - Never process payments.
   - Never store payment secrets.

   SECURITY:
   - This client-side data is NOT a security boundary.
   - Production pricing approval must be verified server-side.
   - Do not place API keys, passwords, payment credentials,
     bank credentials, card details, or provider secrets here.

   IMPORTANT:
   - No country price is invented in this file.
   - Records must be populated only from an approved GDP
     source and owner-approved pricing rule.
   - Fiji pricing remains controlled by buyPlans.js.
   ========================================================= */

(function () {
    "use strict";

    const DATA_VERSION = "1.0.0";

    const DATA_STATUS = Object.freeze({
        READY: "READY",
        NOT_CONFIGURED: "NOT_CONFIGURED"
    });

    /*
     * ---------------------------------------------------------
     * APPROVED GDP RECORDS
     * ---------------------------------------------------------
     *
     * Add only verified records.
     *
     * Expected structure:
     *
     * {
     *     countryCode: "XX",
     *     countryName: "Country",
     *     gdpDataYear: 2025,
     *     gdpPerCapita: 0,
     *     annualPriceUsdPerChild: 0,
     *     gdpSource: "Approved source"
     * }
     *
     * No placeholder price is treated as an approved price.
     */

    const GDP_RECORDS = Object.freeze({});

    /*
     * ---------------------------------------------------------
     * COUNTRY LOOKUP
     * ---------------------------------------------------------
     */

    function getRecord(countryCode) {
        const code =
            String(countryCode || "")
                .trim()
                .toUpperCase();

        if (!code) {
            return null;
        }

        return GDP_RECORDS[code] || null;
    }

    /*
     * ---------------------------------------------------------
     * LIST RECORDS
     * ---------------------------------------------------------
     */

    function getRecords() {
        return Object.values(
            GDP_RECORDS
        ).map(function (record) {
            return Object.assign(
                {},
                record
            );
        });
    }

    /*
     * ---------------------------------------------------------
     * DATA STATUS
     * ---------------------------------------------------------
     */

    function getStatus() {
        const count =
            Object.keys(
                GDP_RECORDS
            ).length;

        return {
            status:
                count > 0
                    ? DATA_STATUS.READY
                    : DATA_STATUS.NOT_CONFIGURED,

            dataVersion:
                DATA_VERSION,

            recordCount:
                count
        };
    }

    /*
     * ---------------------------------------------------------
     * PUBLIC API
     * ---------------------------------------------------------
     */

    const PacificEducationAnnualGdpPricingData =
        Object.freeze({

            version:
                DATA_VERSION,

            status:
                DATA_STATUS,

            getRecord:
                getRecord,

            getRecords:
                getRecords,

            getStatus:
                getStatus
        });

    /*
     * ---------------------------------------------------------
     * GLOBAL EXPORT
     * ---------------------------------------------------------
     */

    window.PacificEducationAnnualGdpPricingData =
        PacificEducationAnnualGdpPricingData;

    /*
     * ---------------------------------------------------------
     * LOAD EVENT
     * ---------------------------------------------------------
     */

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationAnnualGdpPricingDataLoaded",
            {
                detail: {
                    version:
                        DATA_VERSION,

                    status:
                        getStatus()
                }
            }
        )
    );

})();
