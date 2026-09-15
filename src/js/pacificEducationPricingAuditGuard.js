/*
 * Pacific Education
 * Pricing Audit Guard
 * Version: 1.0.0
 *
 * Purpose:
 * - Validate pricing data before presentation.
 * - Check that required pricing fields exist.
 * - Detect invalid or unsafe pricing values.
 * - Provide an audit result for Buy Plans.
 *
 * Prototype only.
 * Production pricing verification must be server-side.
 */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    const REQUIRED_FIELDS = [
        "currency",
        "amount",
        "period"
    ];

    function isValidAmount(amount) {
        return (
            typeof amount === "number" &&
            Number.isFinite(amount) &&
            amount >= 0
        );
    }

    function auditPlan(plan) {
        const errors = [];

        if (!plan || typeof plan !== "object") {
            return {
                valid: false,
                errors: ["invalid_plan"]
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

        if (
            plan.amount !== undefined &&
            !isValidAmount(plan.amount)
        ) {
            errors.push("invalid_amount");
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    function auditPlans(plans) {
        if (!Array.isArray(plans)) {
            return {
                valid: false,
                results: [],
                errors: ["invalid_plans_collection"]
            };
        }

        const results = plans.map(auditPlan);

        const errors = [];

        results.forEach(function (result, index) {
            if (!result.valid) {
                errors.push({
                    index: index,
                    errors: result.errors
                });
            }
        });

        return {
            valid: errors.length === 0,
            results: results,
            errors: errors
        };
    }

    function getPricingEngine() {
        return (
            window.PacificEducationAnnualGdpPricingEngine ||
            null
        );
    }

    function auditPricingEngine() {
        const engine = getPricingEngine();

        if (!engine) {
            return {
                valid: false,
                errors: ["pricing_engine_unavailable"]
            };
        }

        return {
            valid: true,
            errors: []
        };
    }

    window.PacificEducationPricingAuditGuard =
        Object.freeze({
            version: VERSION,
            auditPlan: auditPlan,
            auditPlans: auditPlans,
            auditPricingEngine: auditPricingEngine
        });

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationPricingAuditGuardLoaded",
            {
                detail: {
                    version: VERSION
                }
            }
        )
    );

})();
