/* =========================================
   PACIFIC EDUCATION — PROTOTYPE RUNTIME DIAGNOSTICS
   File: src/js/pacificEducationPrototypeRuntimeDiagnostics.js
   Version: 1.0.0

   PURPOSE
   -------
   Provides an owner-visible, non-production diagnostic check for
   the browser prototype. It checks critical globals and required
   DOM targets after scripts have loaded.

   SECURITY
   --------
   - Diagnostic only.
   - Does not grant authorization.
   - Does not approve production.
   - Does not treat localStorage as a security boundary.
========================================= */

(function (window, document) {
    "use strict";

    const VERSION = "1.0.0";

    const checks = [
        {
            id: "core",
            label: "Pacific Education Core",
            test: function () {
                return !!(
                    window.PacificEducationCore &&
                    typeof window.PacificEducationCore.getState === "function"
                );
            }
        },
        {
            id: "app",
            label: "Application shell",
            test: function () {
                return !!(
                    window.PacificEducationApp &&
                    typeof window.PacificEducationApp.getConnectionStatus === "function"
                );
            }
        },
        {
            id: "dailyLesson",
            label: "Daily lesson",
            test: function () {
                return typeof window.displayDailyLesson === "function";
            }
        },
        {
            id: "completeLesson",
            label: "Lesson completion",
            test: function () {
                return typeof window.completeLesson === "function";
            }
        },
        {
            id: "assessments",
            label: "Assessment actions",
            test: function () {
                return (
                    typeof window.startAlphabetAssessment === "function" &&
                    typeof window.startPhonicsAssessment === "function"
                );
            }
        },
        {
            id: "dashboards",
            label: "Dashboard refresh",
            test: function () {
                return typeof window.refreshAllDashboards === "function";
            }
        },
        {
            id: "ownerReview",
            label: "Owner Final Review",
            test: function () {
                return !!document.getElementById(
                    "pacificEducationOwnerFinalReviewPage"
                );
            }
        },
        {
            id: "ownerReviewApi",
            label: "Owner Final Review controller",
            test: function () {
                return !!(
                    window.PacificEducationOwnerFinalReviewPage &&
                    typeof window.PacificEducationOwnerFinalReviewPage.render === "function"
                );
            }
        },
        {
            id: "coreAuthorizationApi",
            label: "Prototype authorization API",
            test: function () {
                return !!(
                    window.PacificEducationCore &&
                    typeof window.PacificEducationCore.authorizeUser === "function" &&
                    typeof window.PacificEducationCore.isAuthorized === "function"
                );
            }
        }
    ];

    function run() {
        const results = checks.map(function (check) {
            let passed = false;
            let error = null;

            try {
                passed = check.test() === true;
            } catch (e) {
                error = e && e.message ? e.message : "runtime exception";
            }

            return {
                id: check.id,
                label: check.label,
                passed: passed,
                error: error
            };
        });

        const core = window.PacificEducationCore;
        let authorized = false;

        try {
            authorized = !!(
                core &&
                typeof core.isAuthorized === "function" &&
                core.isAuthorized() === true
            );
        } catch (e) {
            authorized = false;
        }

        return {
            version: VERSION,
            timestamp: new Date().toISOString(),
            allChecksPassed: results.every(function (r) {
                return r.passed;
            }),
            authorized: authorized,
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            checks: results
        };
    }

    function render(targetId) {
        const target = document.getElementById(targetId);

        if (!target) {
            return false;
        }

        const report = run();
        target.innerHTML = "";

        const heading = document.createElement("h3");
        heading.textContent = "Prototype Runtime Diagnostics v" + VERSION;
        target.appendChild(heading);

        const summary = document.createElement("p");
        summary.textContent =
            (report.allChecksPassed ? "PASS" : "BLOCKED") +
            " — " +
            (report.authorized
                ? "prototype session authorized"
                : "prototype session not authorized");
        target.appendChild(summary);

        const list = document.createElement("ul");

        report.checks.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent =
                (item.passed ? "PASS: " : "BLOCKED: ") +
                item.label +
                (item.error ? " — " + item.error : "");
            list.appendChild(li);
        });

        target.appendChild(list);

        const rerun = document.createElement("button");
        rerun.type = "button";
        rerun.textContent = "Re-run Diagnostics";
        rerun.addEventListener("click", function () { render(targetId); });
        target.appendChild(rerun);

        const note = document.createElement("p");
        note.textContent =
            "Diagnostic result only. This does not certify production authentication, security, privacy, child safeguarding, hosting, database, payments, or deployment authorization.";
        target.appendChild(note);

        return report;
    }

    window.PacificEducationPrototypeRuntimeDiagnostics = Object.freeze({
        version: VERSION,
        run: run,
        render: render
    });

    document.addEventListener("DOMContentLoaded", function () {
        render("pacificEducationPrototypeRuntimeDiagnostics");
    });

})(window, document);
