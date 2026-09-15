/* =========================================================
   PACIFIC EDUCATION
   BROKEN-LINE TEST CATALOG
   TEST FILE ONLY — NOT PRODUCTION
   ========================================================= */

(function () {
    "use strict";

    const TEST_VERSION = "1.0.0";

    const BROKEN_LINE_TESTS = Object.freeze([
        {
            id: "BROKEN-001",
            type: "missing-value",
            brokenLine: "const brokenLine = ;",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-002",
            type: "missing-operator",
            brokenLine: "const total = price quantity;",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-003",
            type: "missing-closing-brace",
            brokenLine: "function test() {",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-004",
            type: "missing-closing-parenthesis",
            brokenLine: "const result = calculatePrice(100;",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-005",
            type: "invalid-object-entry",
            brokenLine: "const data = { countryCode: };",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-006",
            type: "invalid-array-entry",
            brokenLine: "const data = [1, 2, , ;",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-007",
            type: "invalid-if-statement",
            brokenLine: "if (status === ) {",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-008",
            type: "invalid-function-call",
            brokenLine: "calculateAnnualPrice(, 100);",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-009",
            type: "invalid-assignment",
            brokenLine: "const = pricingYear;",
            expected: "SyntaxError"
        },

        {
            id: "BROKEN-010",
            type: "missing-string-value",
            brokenLine: "const status = ;",
            expected: "SyntaxError"
        }
    ]);

    function getTests() {
        return BROKEN_LINE_TESTS.map(function (test) {
            return Object.assign({}, test);
        });
    }

    function getStatus() {
        return {
            status: "TEST_CATALOG_ONLY",
            version: TEST_VERSION,
            testCount: BROKEN_LINE_TESTS.length,
            productionSafe: true
        };
    }

    window.PacificEducationBrokenLineTestCatalog = Object.freeze({
        version: TEST_VERSION,
        getTests: getTests,
        getStatus: getStatus
    });

})();
