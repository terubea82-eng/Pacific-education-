/* =========================================================
   PACIFIC EDUCATION
   COUNTRY REGISTRATION BRIDGE
   VERSION 1.0.0

   Purpose:
   Connect country-registration records to the
   verification and GDP-pricing workflow.

   IMPORTANT:
   - Registration is NOT approval.
   - This bridge does NOT create ISO codes.
   - This bridge does NOT approve GDP data.
   - This bridge does NOT process payments.
   - Production verification must be server-side.
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    const STATUS = Object.freeze({
        PENDING_REVIEW: "PENDING_REVIEW",
        VERIFIED: "VERIFIED",
        REJECTED: "REJECTED"
    });

    const PRICING_STATUS = Object.freeze({
        WAITING_FOR_VERIFICATION:
            "WAITING_FOR_VERIFICATION",

        READY_FOR_GDP_PRICING:
            "READY_FOR_GDP_PRICING",

        PRICE_UNAVAILABLE:
            "PRICE_UNAVAILABLE"
    });

    function clean(value) {
        return String(value || "").trim();
    }

    function normalizeCode(value) {
        return clean(value).toUpperCase();
    }

    function createRegistrationRecord(data) {

        data = data || {};

        const country =
            data.country || {};

        const authority =
            data.authority || {};

        const contact =
            data.contact || {};

        const request =
            data.request || {};

        return {
            recordType:
                "COUNTRY_REGISTRATION_REQUEST",

            bridgeVersion:
                VERSION,

            country: {
                name:
                    clean(country.name),

                alpha2:
                    normalizeCode(country.alpha2),

                alpha3:
                    normalizeCode(country.alpha3),

                numeric3:
                    clean(country.numeric3),

                codeStatus:
                    clean(country.codeStatus),

                currencyCode:
                    normalizeCode(country.currencyCode)
            },

            authority: {
                name:
                    clean(authority.name),

                officialWebsite:
                    clean(authority.officialWebsite)
            },

            contact: {
                name:
                    clean(contact.name),

                email:
                    clean(contact.email)
            },

            request: {
                type:
                    clean(request.type),

                supportingInformation:
                    clean(
                        request.supportingInformation
                    )
            },

            verification: {
                registrationStatus:
                    STATUS.PENDING_REVIEW,

                isoVerification:
                    "REQUIRED",

                gdpVerification:
                    "REQUIRED"
            },

            pricing: {
                status:
                    PRICING_STATUS
                        .WAITING_FOR_VERIFICATION,

                engine:
                    "PacificEducationAnnualGdpPricingEngine",

                dataSource:
                    "PacificEducationAnnualGdpPricingData"
            }
        };
    }

    function validateRegistration(record) {

        const errors = [];

        if (
            !record ||
            !record.country
        ) {
            errors.push(
                "country_record_missing"
            );
        }

        if (
            !record.country ||
            !record.country.name
        ) {
            errors.push(
                "country_name_required"
            );
        }

        if (
            !record.country ||
            !record.country.codeStatus
        ) {
            errors.push(
                "country_code_status_required"
            );
        }

        if (
            !record.authority ||
            !record.authority.name
        ) {
            errors.push(
                "official_authority_required"
            );
        }

        if (
            !record.contact ||
            !record.contact.name
        ) {
            errors.push(
                "contact_name_required"
            );
        }

        if (
            !record.contact ||
            !record.contact.email
        ) {
            errors.push(
                "contact_email_required"
            );
        }

        return {
            valid:
                errors.length === 0,

            status:
                errors.length === 0
                    ? "REGISTRATION_VALID"
                    : "REGISTRATION_INVALID",

            errors:
                errors
        };
    }

    function prepareForVerification(record) {

        const validation =
            validateRegistration(
                record
            );

        if (!validation.valid) {

            return {
                valid: false,

                status:
                    "REGISTRATION_INVALID",

                errors:
                    validation.errors
            };
        }

        return {
            valid: true,

            status:
                STATUS.PENDING_REVIEW,

            pricingStatus:
                PRICING_STATUS
                    .WAITING_FOR_VERIFICATION,

            record:
                record
        };
    }

    function markVerified(record) {

        const validation =
            validateRegistration(
                record
            );

        if (!validation.valid) {

            return {
                valid: false,

                status:
                    "REGISTRATION_INVALID",

                errors:
                    validation.errors
            };
        }

        const verifiedRecord =
            JSON.parse(
                JSON.stringify(record)
            );

        verifiedRecord.verification = {
            registrationStatus:
                STATUS.VERIFIED,

            isoVerification:
                "REQUIRES_CONFIRMED_SOURCE",

            gdpVerification:
                "REQUIRES_CONFIRMED_SOURCE"
        };

        verifiedRecord.pricing = {
            status:
                PRICING_STATUS
                    .READY_FOR_GDP_PRICING,

            engine:
                "PacificEducationAnnualGdpPricingEngine",

            dataSource:
                "PacificEducationAnnualGdpPricingData"
        };

        return {
            valid: true,

            status:
                STATUS.VERIFIED,

            record:
                verifiedRecord
        };
    }

    function rejectRegistration(
        record,
        reason
    ) {

        const rejectedRecord =
            JSON.parse(
                JSON.stringify(
                    record || {}
                )
            );

        rejectedRecord.verification = {
            registrationStatus:
                STATUS.REJECTED,

            reason:
                clean(reason)
        };

        rejectedRecord.pricing = {
            status:
                PRICING_STATUS
                    .PRICE_UNAVAILABLE
        };

        return {
            valid: true,

            status:
                STATUS.REJECTED,

            record:
                rejectedRecord
        };
    }

    window.PacificEducationCountryRegistrationBridge =
        Object.freeze({

            version:
                VERSION,

            status:
                STATUS,

            pricingStatus:
                PRICING_STATUS,

            createRegistrationRecord:
                createRegistrationRecord,

            validateRegistration:
                validateRegistration,

            prepareForVerification:
                prepareForVerification,

            markVerified:
                markVerified,

            rejectRegistration:
                rejectRegistration

        });

})();
