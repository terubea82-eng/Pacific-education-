/*
 * PACIFIC EDUCATION
 * PRICING AUDIT INVALID-DATA TEST
 * VERSION 1.0.0
 *
 * TEST ONLY — NOT PRODUCTION
 */

(function () {
    "use strict";

    const auditGuard =
        window.PacificEducationPricingAuditGuard;

    if (!auditGuard) {
        console.error(
            "Pricing Audit Guard is unavailable."
        );
        return;
    }

    const tests = [

        {
            name:
                "Missing amount",

            plan: {
                planId:
                    "TEST-MISSING-AMOUNT",

                currency:
                    "USD",

                period:
                    "ANNUAL"
            }
        },

        {
            name:
                "Negative amount",

            plan: {
                planId:
                    "TEST-NEGATIVE-AMOUNT",

                currency:
                    "USD",

                amount:
                    -5,

                period:
                    "ANNUAL"
            }
        },

        {
            name:
                "Invalid amount",

            plan: {
                planId:
                    "TEST-INVALID-AMOUNT",

                currency:
                    "USD",

                amount:
                    "INVALID",

                period:
                    "ANNUAL"
            }
        }

    ];

    const results =
        tests.map(function (test) {

            const audit =
                auditGuard.auditPlan(
                    test.plan
                );

            return {
                name:
                    test.name,

                valid:
                    audit.valid,

                errors:
                    audit.errors
            };

        });

    window.PacificEducationPricingAuditInvalidDataTestResult =
        Object.freeze({

            testName:
                "Pricing Audit Guard — Invalid Data",

            testCount:
                results.length,

            results:
                results

        });

    console.log(
        "PACIFIC EDUCATION PRICING AUDIT INVALID-DATA TEST",
        window.PacificEducationPricingAuditInvalidDataTestResult
    );

})();
