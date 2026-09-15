/* =========================================================
   PACIFIC EDUCATION
   ANNUAL GDP PRICING ENGINE

   File:
   src/js/pacificEducationAnnualGdpPricingEngine.js

   Purpose:
   - Provide annual international pricing data to buyPlans.js
   - Keep Fiji pricing completely separate
   - Use an approved GDP pricing record
   - Never store payment secrets
   - Never process payments
   - Never confirm payment
   - Never grant subscription access

   SECURITY:
   - This client-side engine is NOT a security boundary.
   - Production pricing approval must be verified server-side.
   - Payment processing and payment verification MUST remain
     server-side or with an approved payment provider.
   - No passwords, API keys, card details, bank credentials,
     payment secrets, or provider secrets belong in this file.

   IMPORTANT:
   - Fiji pricing is NOT calculated here.
   - Fiji pricing remains controlled by buyPlans.js.
   - This engine supplies INTERNATIONAL annual pricing only.
   ========================================================= */

(function () {
    "use strict";

    const ENGINE_VERSION = "1.0.0";

    const FORMULA_VERSION =
        "GDP_OWNER_APPROVED_BASE_V1";

    const STATUS = Object.freeze({
        CALCULATED: "CALCULATED",
        PRICE_UNAVAILABLE: "PRICE_UNAVAILABLE",
        INVALID_RECORD: "INVALID_RECORD"
    });

    /*
     * ---------------------------------------------------------
     * BASIC HELPERS
     * ---------------------------------------------------------
     */

    function getCurrentYear() {
        return new Date().getUTCFullYear();
    }

    function isFiniteNumber(value) {
        return (
            typeof value === "number" &&
            Number.isFinite(value)
        );
    }

    /*
     * ---------------------------------------------------------
     * GDP RECORD VALIDATION
     * ---------------------------------------------------------
     *
     * The pricing engine does not invent GDP information.
     *
     * The application must provide an approved GDP record.
     *
     * Expected record:
     *
     * {
     *     countryCode: "XX",
     *     countryName: "Country",
     *     gdpDataYear: 2025,
     *     gdpPerCapita: 12345,
     *     annualPriceUsdPerChild: 2,
     *     gdpSource: "Approved source"
     * }
     *
     * annualPriceUsdPerChild is the owner-approved annual
     * international base price derived from the approved
     * GDP pricing model.
     */

    function validateGdpRecord(
        gdpRecord
    ) {
        if (
            !gdpRecord ||
            typeof gdpRecord !== "object"
        ) {
            return {
                valid: false,
                reason:
                    "GDP pricing record is required."
            };
        }

        if (
            !isFiniteNumber(
                gdpRecord.annualPriceUsdPerChild
            )
        ) {
            return {
                valid: false,
                reason:
                    "Approved annual GDP price is unavailable."
            };
        }

        if (
            gdpRecord.annualPriceUsdPerChild <
            0
        ) {
            return {
                valid: false,
                reason:
                    "Annual GDP price cannot be negative."
            };
        }

        if (
            !isFiniteNumber(
                gdpRecord.gdpDataYear
            )
        ) {
            return {
                valid: false,
                reason:
                    "GDP data year is required."
            };
        }

        if (
            !gdpRecord.gdpSource
        ) {
            return {
                valid: false,
                reason:
                    "GDP source is required."
            };
        }

        return {
            valid: true,
            reason: null
        };
    }

    /*
     * ---------------------------------------------------------
     * EXCHANGE RATE
     * ---------------------------------------------------------
     *
     * The GDP base price is expressed in USD.
     *
     * If an approved exchange rate is supplied:
     *
     *     local price = USD price × exchange rate
     *
     * If no exchange rate is supplied, USD is retained.
     *
     * Exchange rates used for commercial pricing should be
     * obtained and verified by the production/server layer.
     */

    function calculateLocalPrice(
        priceUsd,
        currencyCode,
        exchangeRate
    ) {
        const currency =
            String(
                currencyCode || "USD"
            )
                .trim()
                .toUpperCase();

        if (
            currency === "USD"
        ) {
            return {
                currency: "USD",
                priceLocal: priceUsd,
                exchangeRate: 1
            };
        }

        if (
            !isFiniteNumber(
                exchangeRate
            ) ||
            exchangeRate <= 0
        ) {
            return {
                currency: "USD",
                priceLocal: priceUsd,
                exchangeRate: null
            };
        }

        return {
            currency: currency,
            priceLocal:
                priceUsd *
                exchangeRate,
            exchangeRate:
                exchangeRate
        };
    }

    /*
     * ---------------------------------------------------------
     * ANNUAL PRICE CALCULATION
     * ---------------------------------------------------------
     *
     * This is the public interface required by:
     *
     * PacificEducationBuyPlans
     *
     * in buyPlans.js.
     */

    function calculateAnnualPrice(
        options
    ) {
        options =
            options || {};

        const gdpRecord =
            options.gdpRecord || null;

        const validation =
            validateGdpRecord(
                gdpRecord
            );

        if (
            !validation.valid
        ) {
            return {
                status:
                    STATUS.PRICE_UNAVAILABLE,

                reason:
                    validation.reason
            };
        }

        const pricingYear =
            options.pricingYear ||
            getCurrentYear();

        const currencyCode =
            options.currencyCode ||
            "USD";

        const priceUsd =
            gdpRecord.annualPriceUsdPerChild;

        const local =
            calculateLocalPrice(
                priceUsd,
                currencyCode,
                options.exchangeRate
            );

        return {
            status:
                STATUS.CALCULATED,

            pricingYear:
                pricingYear,

            formulaVersion:
                FORMULA_VERSION,

            gdpDataYear:
                gdpRecord.gdpDataYear,

            gdpSource:
                gdpRecord.gdpSource,

            countryCode:
                gdpRecord.countryCode ||
                null,

            countryName:
                gdpRecord.countryName ||
                null,

            gdpPerCapita:
                gdpRecord.gdpPerCapita ||
                null,

            priceUsdPerChildPerYear:
                priceUsd,

            currency:
                local.currency,

            priceLocalCurrency:
                local.priceLocal,

            exchangeRate:
                local.exchangeRate
        };
    }

    /*
     * ---------------------------------------------------------
     * PUBLIC API
     * ---------------------------------------------------------
     */

    const PacificEducationAnnualGdpPricingEngine =
        Object.freeze({

            version:
                ENGINE_VERSION,

            formulaVersion:
                FORMULA_VERSION,

            status:
                STATUS,

            validateGdpRecord:
                validateGdpRecord,

            calculateAnnualPrice:
                calculateAnnualPrice
        });

    /*
     * ---------------------------------------------------------
     * GLOBAL EXPORT
     * ---------------------------------------------------------
     */

    window.PacificEducationAnnualGdpPricingEngine =
        PacificEducationAnnualGdpPricingEngine;

    /*
     * ---------------------------------------------------------
     * LOAD EVENT
     * ---------------------------------------------------------
     */

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationAnnualGdpPricingEngineLoaded",
            {
                detail: {
                    version:
                        ENGINE_VERSION,

                    formulaVersion:
                        FORMULA_VERSION
                }
            }
        )
    );

})();
