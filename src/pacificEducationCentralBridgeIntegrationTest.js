/*
 * =========================================================
 * PACIFIC EDUCATION
 * CENTRAL BRIDGE INTEGRATION TEST
 * =========================================================
 * Version 1.1.0
 *
 * TEST ONLY — NOT PRODUCTION
 *
 * Purpose:
 * Verify existing Pacific Education modules and provide
 * diagnostics when a required module is not detected.
 *
 * IMPORTANT:
 * This file does NOT modify production modules.
 * =========================================================
 */

(function () {
    "use strict";

    const VERSION = "1.1.0";
    const STATUS = "TEST ONLY — NOT PRODUCTION";

    const REQUIRED_MODULES = [
        "PacificEducationCentralBridge",
        "PacificEducationAnnualGdpPricingEngine",
        "PacificEducationPricingAuditGuard",
        "PacificEducationEducationLinkBridge",
        "PacificEducationSecureLinkAuthorization",
        "PacificEducationAssessmentBridge"
    ];

    function test(name, condition, details) {
        return {
            name: name,
            passed: Boolean(condition),
            details: details || ""
        };
    }

    function detectModule(name) {
        return typeof window[name] !== "undefined";
    }

    function runTests() {
        const results = [];

        results.push(
            test(
                "Integration test exists",
                true,
                "Central Bridge integration test loaded."
            )
        );

        results.push(
            test(
                "Correct test version",
                VERSION === "1.1.0",
                VERSION
            )
        );

        results.push(
            test(
                "Test-only status",
                STATUS === "TEST ONLY — NOT PRODUCTION",
                STATUS
            )
        );

        results.push(
            test(
                "Central Bridge available",
                detectModule("PacificEducationCentralBridge"),
                "Central Bridge detection."
            )
        );

        REQUIRED_MODULES.forEach(function (moduleName) {
            const available = detectModule(moduleName);

            results.push(
                test(
                    "Module detection: " + moduleName,
                    available,
                    available
                        ? "Module detected."
                        : "Module not detected in this test environment."
                )
            );

            /*
             * Additional diagnostic information for the
             * Secure Link Authorization module only.
             */
            if (
                moduleName ===
                "PacificEducationSecureLinkAuthorization"
            ) {
                results.push(
                    test(
                        "Secure Link global object exists",
                        typeof window.PacificEducationSecureLinkAuthorization !==
                            "undefined",
                        available
                            ? "Global authorization object exists."
                            : "Global authorization object is missing."
                    )
                );

                results.push(
                    test(
                        "Secure Link requestLink exists",
                        Boolean(
                            window.PacificEducationSecureLinkAuthorization &&
                            typeof window.PacificEducationSecureLinkAuthorization
                                .requestLink === "function"
                        ),
                        available
                            ? "requestLink function detected."
                            : "requestLink cannot be checked because the global object is missing."
                    )
                );

                results.push(
                    test(
                        "Secure Link approveLink exists",
                        Boolean(
                            window.PacificEducationSecureLinkAuthorization &&
                            typeof window.PacificEducationSecureLinkAuthorization
                                .approveLink === "function"
                        ),
                        available
                            ? "approveLink function detected."
                            : "approveLink cannot be checked because the global object is missing."
                    )
                );

                results.push(
                    test(
                        "Secure Link authorizeAccess exists",
                        Boolean(
                            window.PacificEducationSecureLinkAuthorization &&
                            typeof window.PacificEducationSecureLinkAuthorization
                                .authorizeAccess === "function"
                        ),
                        available
                            ? "authorizeAccess function detected."
                            : "authorizeAccess cannot be checked because the global object is missing."
                    )
                );

                results.push(
                    test(
                        "Secure Link revokeLink exists",
                        Boolean(
                            window.PacificEducationSecureLinkAuthorization &&
                            typeof window.PacificEducationSecureLinkAuthorization
                                .revokeLink === "function"
                        ),
                        available
                            ? "revokeLink function detected."
                            : "revokeLink cannot be checked because the global object is missing."
                    )
                );
            }
        });

        const bridge = window.PacificEducationCentralBridge;

        if (bridge) {
            results.push(
                test(
                    "Central Bridge exposes getSystemStatus",
                    typeof bridge.getSystemStatus === "function",
                    "Required bridge status interface."
                )
            );

            results.push(
                test(
                    "Central Bridge exposes getAudit",
                    typeof bridge.getAudit === "function",
                    "Required bridge audit interface."
                )
            );

            results.push(
                test(
                    "Central Bridge exposes checkComponent",
                    typeof bridge.checkComponent === "function",
                    "Required bridge health-check interface."
                )
            );

            results.push(
                test(
                    "Central Bridge does not expose production authorization",
                    typeof bridge.authorizeProduction === "undefined",
                    "Integration test must not create production authorization."
                )
            );

            if (typeof bridge.getSystemStatus === "function") {
                const systemStatus = bridge.getSystemStatus();

                results.push(
                    test(
                        "System status can be read",
                        Boolean(
                            systemStatus &&
                            typeof systemStatus === "object"
                        ),
                        "Central Bridge system status response received."
                    )
                );
            }

            if (typeof bridge.getAudit === "function") {
                const audit = bridge.getAudit();

                results.push(
                    test(
                        "Audit history can be read",
                        Array.isArray(audit),
                        "Central Bridge audit history response received."
                    )
                );
            }
        }

        /*
         * Final diagnostic summary.
         */
        const authorization =
            window.PacificEducationSecureLinkAuthorization;

        let diagnosticDetails = "";

        if (!authorization) {
            diagnosticDetails =
                "DIAGNOSTIC: PacificEducationSecureLinkAuthorization " +
                "is not present on window. Check script loading/path/cache.";
        } else {
            diagnosticDetails =
                "DIAGNOSTIC: Authorization global detected. " +
                "Version: " +
                String(authorization.version || "unknown");
        }

        results.push(
            test(
                "Secure Link Authorization diagnostic",
                Boolean(authorization),
                diagnosticDetails
            )
        );

        const passed = results.filter(function (item) {
            return item.passed;
        }).length;

        const failed = results.length - passed;

        const overall =
            failed === 0
                ? "PASS"
                : "FAIL";

        const finalResult = {
            version: VERSION,
            status: STATUS,
            total: results.length,
            passed: passed,
            failed: failed,
            overall: overall,
            results: results,
            timestamp: new Date().toISOString()
        };

        window.PacificEducationCentralBridgeIntegrationTestResult =
            finalResult;

        console.log(
            "PACIFIC EDUCATION CENTRAL BRIDGE INTEGRATION TEST",
            finalResult
        );

        return finalResult;
    }

    window.PacificEducationCentralBridgeIntegrationTest = {
        version: VERSION,
        status: STATUS,
        requiredModules: REQUIRED_MODULES.slice(),
        run: runTests
    };

})();
