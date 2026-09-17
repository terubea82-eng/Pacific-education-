/*
 * =========================================================
 * PACIFIC EDUCATION
 * BUY PLANS
 * =========================================================
 *
 * File:
 * src/js/buyPlans.js
 *
 * Version: 1.0.0
 * Status: PROTOTYPE / OWNER-CONTROLLED SPECIFICATION
 *
 * PURPOSE
 * -------
 * - Maintain Fiji owner-controlled annual pricing.
 * - Connect international plans to the Annual GDP Pricing Engine.
 * - Send pricing results through the Pricing Audit Guard.
 * - Never process payments in the browser.
 * - Never store payment secrets.
 * - Never treat browser payment status as proof of payment.
 *
 * PRODUCTION
 * ----------
 * Production pricing authorization, payment processing,
 * payment verification, subscription activation and audit
 * records must be performed server-side or by an approved
 * payment provider.
 * =========================================================
 */

(function (global) {
    "use strict";

    const BUY_PLANS_VERSION = "1.0.0";

    const STATUS = Object.freeze({
        READY: "READY",
        FIJI_PROTECTED: "FIJI_PROTECTED",
        INTERNATIONAL: "INTERNATIONAL",
        PRICING_UNAVAILABLE: "PRICING_UNAVAILABLE",
        AUDIT_REJECTED: "AUDIT_REJECTED",
        PRODUCTION_REQUIRED: "PRODUCTION_REQUIRED"
    });

    /*
     * ---------------------------------------------------------
     * FIJI OWNER-CONTROLLED PRICING
     * ---------------------------------------------------------
     *
     * These are prototype owner-controlled values.
     * They are NOT payment authorization.
     */

    const FIJI_PLANS = Object.freeze([
        Object.freeze({
            planId: "FIJI-STUDENT",
            name: "Student",
            currency: "FJD",
            amount: 1,
            period: "annual"
        }),

        Object.freeze({
            planId: "FIJI-INDIVIDUAL",
            name: "Individual",
            currency: "FJD",
            amount: 10,
            period: "annual"
        }),

        Object.freeze({
            planId: "FIJI-PARENT",
            name: "Parent",
            currency: "FJD",
            amount: 10,
            period: "annual"
        }),

        Object.freeze({
            planId: "FIJI-ORGANIZATION",
            name: "Organization",
            currency: "FJD",
            amount: 100,
            period: "annual"
        })
    ]);

    /*
     * ---------------------------------------------------------
     * ENGINE ACCESS
     * ---------------------------------------------------------
     */

    function getGdpEngine() {
        return (
            global.PacificEducationAnnualGdpPricingEngine ||
            null
        );
    }

    function getPricingAuditGuard() {
        return (
            global.PacificEducationPricingAuditGuard ||
            null
        );
    }

    /*
     * ---------------------------------------------------------
     * FIJI PLANS
     * ---------------------------------------------------------
     */

    function getFijiPlans() {
        return FIJI_PLANS.map(function (plan) {
            return Object.assign({}, plan);
        });
    }

    /*
     * ---------------------------------------------------------
     * INTERNATIONAL PLAN
     * ---------------------------------------------------------
     *
     * The GDP engine supplies the international annual price.
     * This module does not invent GDP data.
     */

    function calculateInternationalPlan(options) {
        const engine = getGdpEngine();

        if (
            !engine ||
            typeof engine.calculateAnnualPrice !==
                "function"
        ) {
            return {
                status:
                    STATUS.PRICING_UNAVAILABLE,

                reason:
                    "Annual GDP Pricing Engine is unavailable."
            };
        }

        const result =
            engine.calculateAnnualPrice(
                options || {}
            );

        if (
            result.status ===
            "PRODUCTION_REQUIRED"
        ) {
            return {
                status:
                    STATUS.PRODUCTION_REQUIRED,

                result: result
            };
        }

        if (
            result.status !==
            "CALCULATED"
        ) {
            return {
                status:
                    STATUS.PRICING_UNAVAILABLE,

                result: result
            };
        }

        return {
            status:
                STATUS.INTERNATIONAL,

            result: result
        };
    }

    /*
     * ---------------------------------------------------------
     * PRICING AUDIT
     * ---------------------------------------------------------
     */

    function auditPlan(plan) {
        const guard =
            getPricingAuditGuard();

        if (
            !guard ||
            typeof guard.auditPlan !==
                "function"
        ) {
            return {
                valid: false,
                productionVerified: false,
                errors: [
                    "Pricing Audit Guard is unavailable."
                ],
                warnings: []
            };
        }

        return guard.auditPlan(
            plan,
            0
        );
    }

    function auditPlans(plans) {
        const guard =
            getPricingAuditGuard();

        if (
            !guard ||
            typeof guard.auditPlans !==
                "function"
        ) {
            return {
                valid: false,
                productionVerified: false,
                errors: [
                    "Pricing Audit Guard is unavailable."
                ],
                warnings: []
            };
        }

        return guard.auditPlans(
            plans
        );
    }

    /*
     * ---------------------------------------------------------
     * FIJI PROTECTED MARKET
     * ---------------------------------------------------------
     */

    function getFijiPricing() {
        const plans =
            getFijiPlans();

        const audit =
            auditPlans(plans);

        if (!audit.valid) {
            return {
                status:
                    STATUS.AUDIT_REJECTED,

                market:
                    "FJ",

                pricingStatus:
                    STATUS.FIJI_PROTECTED,

                plans:
                    plans,

                audit:
                    audit
            };
        }

        return {
            status:
                STATUS.FIJI_PROTECTED,

            market:
                "FJ",

            pricingStatus:
                STATUS.FIJI_PROTECTED,

            plans:
                plans,

            audit:
                audit
        };
    }

    /*
     * ---------------------------------------------------------
     * INTERNATIONAL PRICING + AUDIT
     * ---------------------------------------------------------
     */

    function getInternationalPricing(options) {
        const calculated =
            calculateInternationalPlan(
                options
            );

        if (
            calculated.status !==
            STATUS.INTERNATIONAL
        ) {
            return calculated;
        }

        const result =
            calculated.result;

        const plan = {
            planId:
                "INTERNATIONAL-" +
                String(
                    result.countryCode ||
                    "UNKNOWN"
                ),

            name:
                "International Annual",

            currency:
                result.currency,

            amount:
                result.priceLocalCurrency,

            period:
                "annual",

            countryCode:
                result.countryCode,

            gdpDataYear:
                result.gdpDataYear,

            gdpSource:
                result.gdpSource,

            gdpPerCapitaUsd:
                result.gdpPerCapitaUsd
        };

        const audit =
            auditPlan(plan);

        if (!audit.valid) {
            return {
                status:
                    STATUS.AUDIT_REJECTED,

                pricingStatus:
                    STATUS.INTERNATIONAL,

                plan:
                    plan,

                engineResult:
                    result,

                audit:
                    audit
            };
        }

        return {
            status:
                STATUS.INTERNATIONAL,

            pricingStatus:
                STATUS.INTERNATIONAL,

            plan:
                plan,

            engineResult:
                result,

            audit:
                audit
        };
    }

    /*
     * ---------------------------------------------------------
     * PAYMENT BOUNDARY
     * ---------------------------------------------------------
     *
     * This browser module never confirms payment.
     */

    function createPaymentRequest(plan) {
        if (
            !plan ||
            typeof plan !== "object"
        ) {
            return {
                success: false,
                status:
                    "INVALID_PAYMENT_REQUEST"
            };
        }

        return {
            success: true,

            status:
                "PAYMENT_REQUEST_CREATED",

            paymentRequired:
                true,

            paymentVerified:
                false,

            subscriptionActivated:
                false,

            planId:
                plan.planId || null,

            currency:
                plan.currency || null,

            amount:
                plan.amount ?? null,

            period:
                plan.period || null,

            productionVerificationRequired:
                true,

            message:
                "Payment must be verified by the production server or approved payment provider."
        };
    }

    /*
     * ---------------------------------------------------------
     * PUBLIC API
     * ---------------------------------------------------------
     */

    const api = Object.freeze({

        version:
            BUY_PLANS_VERSION,

        status:
            STATUS,

        fijiPlans:
            FIJI_PLANS,

        getFijiPlans:
            getFijiPlans,

        getFijiPricing:
            getFijiPricing,

        calculateInternationalPlan:
            calculateInternationalPlan,

        getInternationalPricing:
            getInternationalPricing,

        auditPlan:
            auditPlan,

        auditPlans:
            auditPlans,

        createPaymentRequest:
            createPaymentRequest
    });

    global.PacificEducationBuyPlans =
        api;

    /*
     * ---------------------------------------------------------
     * LOAD EVENT
     * ---------------------------------------------------------
     */

    global.dispatchEvent(
        new CustomEvent(
            "pacificEducationBuyPlansLoaded",
            {
                detail: {
                    version:
                        BUY_PLANS_VERSION,

                    prototypeOnly:
                        true,

                    productionPaymentVerificationRequired:
                        true
                }
            }
        )
    );

})(window);
