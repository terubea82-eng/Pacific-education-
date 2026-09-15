/* =========================================================
   PACIFIC EDUCATION
   BROKEN-LINE AUDIT REPORT
   TEST FILE ONLY — NOT PRODUCTION
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    function generateReport() {
        const runner =
            window.PacificEducationBrokenLineAuditRunner ||
            null;

        if (!runner) {
            return {
                valid: false,
                status: "RUNNER_UNAVAILABLE",
                version: VERSION,
                testCount: 0,
                passed: false,
                productionSafe: true
            };
        }

        const result =
            runner.runTest();

        const testCount =
            Number(result.testCount) || 0;

        const invalidCount =
            Array.isArray(result.invalidTests)
                ? result.invalidTests.length
                : 0;

        return {
            valid: result.valid === true,
            status: result.status,
            version: VERSION,
            testCount: testCount,
            invalidCount: invalidCount,
            passed:
                result.valid === true &&
                invalidCount === 0 &&
                testCount > 0,
            productionSafe: true
        };
    }

    window.PacificEducationBrokenLineAuditReport =
        Object.freeze({
            version: VERSION,
            generateReport: generateReport
        });

})();
