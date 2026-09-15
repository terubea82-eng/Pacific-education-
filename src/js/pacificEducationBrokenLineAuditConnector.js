/* =========================================================
   PACIFIC EDUCATION
   BROKEN-LINE AUDIT CONNECTOR
   TEST FILE ONLY — NOT PRODUCTION
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    function getCatalog() {
        return (
            window.PacificEducationBrokenLineTestCatalog ||
            null
        );
    }

    function auditCatalog() {
        const catalog = getCatalog();

        if (!catalog) {
            return {
                valid: false,
                status: "CATALOG_UNAVAILABLE",
                errors: [
                    "broken_line_test_catalog_unavailable"
                ]
            };
        }

        const tests = catalog.getTests();

        if (!Array.isArray(tests)) {
            return {
                valid: false,
                status: "INVALID_CATALOG",
                errors: [
                    "invalid_test_collection"
                ]
            };
        }

        const results = tests.map(function (test) {
            return {
                id: test.id,
                type: test.type,
                expected: test.expected,
                testLinePresent:
                    typeof test.brokenLine === "string" &&
                    test.brokenLine.length > 0
            };
        });

        const invalidTests = results.filter(
            function (result) {
                return !result.testLinePresent;
            }
        );

        return {
            valid: invalidTests.length === 0,
            status:
                invalidTests.length === 0
                    ? "CATALOG_READY"
                    : "CATALOG_INVALID",
            version: VERSION,
            testCount: results.length,
            invalidTests: invalidTests,
            results: results,
            productionSafe: true
        };
    }

    window.PacificEducationBrokenLineAuditConnector =
        Object.freeze({
            version: VERSION,
            auditCatalog: auditCatalog
        });

})();
