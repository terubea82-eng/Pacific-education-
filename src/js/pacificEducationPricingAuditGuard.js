/*
 * =========================================================
 * PACIFIC EDUCATION
 * PRICING AUDIT GUARD
 * =========================================================
 *
 * File:
 * src/js/pacificEducationPricingAuditGuard.js
 *
 * Version: 1.1.0
 *
 * PURPOSE
 * -------
 * Prototype pricing validation and audit layer.
 *
 * This guard:
 * - validates pricing plan structure
 * - validates currency
 * - validates annual pricing period
 * - validates numeric pricing values
 * - rejects unsafe numeric values
 * - identifies individual plans
 * - checks GDP Pricing Engine availability
 * - provides an explicit audit result
 * - distinguishes prototype validation from
 *   production verification
 *
 * IMPORTANT
 * ----------
 * Prototype only.
 *
 * Browser-side validation is NOT production security.
 * Production pricing verification, authorization and
 * payment verification MUST be performed server-side.
 * =========================================================
 */

(function (global) {
    "use strict";

    var VERSION = "1.1.0";

    /*
     * =======================================================
     * CONFIGURATION
     * =======================================================
     */

    var REQUIRED_FIELDS = Object.freeze([
        "currency",
        "amount",
        "period"
    ]);

    var SUPPORTED_CURRENCIES = Object.freeze([
        "FJD",
        "USD"
    ]);

    var SUPPORTED_PERIODS = Object.freeze([
        "annual",
        "yearly",
        "per_year"
    ]);

    /*
     * Maximum safe application-level amount.
     *
     * This is NOT a pricing policy.
     * It is a prototype safety boundary to prevent
     * obviously unsafe numeric values from being accepted.
     */
    var MAX_SAFE_PRICING_AMOUNT = 1000000000;

    /*
     * =======================================================
     * HELPERS
     * =======================================================
     */

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function isValidCurrency(currency) {
        return (
            typeof currency === "string" &&
            SUPPORTED_CURRENCIES.indexOf(
                currency.toUpperCase()
            ) !== -1
        );
    }

    function isValidAmount(amount) {
        return (
            typeof amount === "number" &&
            Number.isFinite(amount) &&
            amount >= 0 &&
            amount <= MAX_SAFE_PRICING_AMOUNT
        );
    }

    function isValidPeriod(period) {
        return (
            typeof period === "string" &&
            SUPPORTED_PERIODS.indexOf(
                period.toLowerCase()
            ) !== -1
        );
    }

    function getPlanId(plan, index) {
        if (
            plan &&
            typeof plan.planId === "string" &&
            plan.planId.trim() !== ""
        ) {
            return plan.planId;
        }

        if (
            plan &&
            typeof plan.id === "string" &&
            plan.id.trim() !== ""
        ) {
            return plan.id;
        }

        return "plan-" + (
            typeof index === "number" ? index : "unknown"
        );
    }

    /*
     * =======================================================
     * SINGLE PLAN AUDIT
     * =======================================================
     */

    function auditPlan(plan, index) {
        var errors = [];
        var warnings = [];
        var planId = getPlanId(plan, index);

        if (!isPlainObject(plan)) {
            return {
                valid: false,
                productionVerified: false,
                planId: planId,
                errors: ["invalid_plan"],
                warnings: []
            };
        }

        REQUIRED_FIELDS.forEach(function (field) {
            if (
                plan[field] === undefined ||
                plan[field] === null ||
                plan[field] === ""
            ) {
                errors.push("missing_" + field);
            }
        });

        /*
         * Currency validation
         */
        if (
            plan.currency !== undefined &&
            plan.currency !== null &&
            plan.currency !== "" &&
            !isValidCurrency(plan.currency)
        ) {
            errors.push("invalid_currency");
        }

        /*
         * Amount validation
         */
        if (
            plan.amount !== undefined &&
            plan.amount !== null &&
            !isValidAmount(plan.amount)
        ) {
            errors.push("invalid_amount");
        }

        /*
         * Period validation
         */
        if (
            plan.period !== undefined &&
            plan.period !== null &&
            plan.period !== "" &&
            !isValidPeriod(plan.period)
        ) {
            errors.push("invalid_period");
        }

        /*
         * Optional plan name validation.
         */
        if (
            plan.name !== undefined &&
            plan.name !== null &&
            typeof plan.name !== "string"
        ) {
            errors.push("invalid_plan_name");
        }

        /*
         * Optional GDP metadata.
         *
         * The guard does not invent or approve GDP values.
         * It only detects obviously invalid supplied values.
         */
        if (plan.gdp !== undefined) {
            if (
                typeof plan.gdp !== "number" ||
                !Number.isFinite(plan.gdp) ||
                plan.gdp < 0
            ) {
                errors.push("invalid_gdp");
            }
        }

        /*
         * Prototype warning.
         *
         * A valid browser-side audit does not equal
         * production verification.
         */
        warnings.push("prototype_validation_only");
        warnings.push("production_verification_required");

        return {
            valid: errors.length === 0,
            productionVerified: false,
            planId: planId,
            errors: errors,
            warnings: warnings
        };
    }

    /*
     * =======================================================
     * MULTIPLE PLAN AUDIT
     * =======================================================
     */

    function auditPlans(plans) {
        if (!Array.isArray(plans)) {
            return {
                valid: false,
                productionVerified: false,
                results: [],
                errors: ["invalid_plans_collection"],
                warnings: []
            };
        }

        var results = plans.map(function (plan, index) {
            return auditPlan(plan, index);
        });

        var errors = [];
        var warnings = [];

        results.forEach(function (result) {
            if (!result.valid) {
                errors.push({
                    planId: result.planId,
                    errors: result.errors
                });
            }

            if (Array.isArray(result.warnings)) {
                result.warnings.forEach(function (warning) {
                    if (warnings.indexOf(warning) === -1) {
                        warnings.push(warning);
                    }
                });
            }
        });

        return {
            valid: errors.length === 0,
            productionVerified: false,
            results: results,
            errors: errors,
            warnings: warnings
        };
    }

    /*
     * =======================================================
     * GDP PRICING ENGINE
     * =======================================================
     */

    function getPricingEngine() {
        return (
            global.PacificEducationAnnualGdpPricingEngine ||
            null
        );
    }

    function auditPricingEngine() {
        var engine = getPricingEngine();

        if (!engine) {
            return {
                valid: false,
                productionVerified: false,
                errors: ["pricing_engine_unavailable"],
                warnings: []
            };
        }

        return {
            valid: true,
            productionVerified: false,
            errors: [],
            warnings: [
                "pricing_engine_available",
                "engine_output_requires_validation",
                "production_verification_required"
            ]
        };
    }

    /*
     * =======================================================
     * COMPLETE PRICING AUDIT
     * =======================================================
     */

    function auditPricing(plans) {
        var engineAudit = auditPricingEngine();
        var planAudit = auditPlans(plans);

        var errors = [];
        var warnings = [];

        if (!engineAudit.valid) {
            errors = errors.concat(engineAudit.errors);
        }

        if (!planAudit.valid) {
            errors = errors.concat(
                planAudit.errors.map(function (entry) {
                    return {
                        planId: entry.planId,
                        errors: entry.errors
                    };
                })
            );
        }

        if (Array.isArray(engineAudit.warnings)) {
            warnings = warnings.concat(
                engineAudit.warnings
            );
        }

        if (Array.isArray(planAudit.warnings)) {
            planAudit.warnings.forEach(function (warning) {
                if (warnings.indexOf(warning) === -1) {
                    warnings.push(warning);
                }
            });
        }

        return {
            valid:
                engineAudit.valid &&
                planAudit.valid,

            productionVerified: false,

            engineAvailable:
                engineAudit.valid,

            planAudit: planAudit,

            errors: errors,

            warnings: warnings,

            auditStatus:
                errors.length === 0
                    ? "VALIDATED_PROTOTYPE"
                    : "REJECTED",

            productionStatus:
                "SERVER_SIDE_VERIFICATION_REQUIRED",

            version: VERSION
        };
    }

    /*
     * =======================================================
     * PUBLIC API
     * =======================================================
     */

    var api = Object.freeze({

        version: VERSION,

        REQUIRED_FIELDS: REQUIRED_FIELDS,

        SUPPORTED_CURRENCIES:
            SUPPORTED_CURRENCIES,

        SUPPORTED_PERIODS:
            SUPPORTED_PERIODS,

        MAX_SAFE_PRICING_AMOUNT:
            MAX_SAFE_PRICING_AMOUNT,

        isValidAmount:
            isValidAmount,

        isValidCurrency:
            isValidCurrency,

        isValidPeriod:
            isValidPeriod,

        auditPlan:
            auditPlan,

        auditPlans:
            auditPlans,

        auditPricingEngine:
            auditPricingEngine,

        auditPricing:
            auditPricing
    });

    global.PacificEducationPricingAuditGuard = api;

    /*
     * =======================================================
     * LOAD EVENT
     * =======================================================
     */

    if (
        typeof global.dispatchEvent === "function" &&
        typeof global.CustomEvent === "function"
    ) {
        global.dispatchEvent(
            new CustomEvent(
                "pacificEducationPricingAuditGuardLoaded",
                {
                    detail: {
                        version: VERSION,
                        prototypeOnly: true,
                        productionVerificationRequired: true
                    }
                }
            )
        );
    }

})(window);
