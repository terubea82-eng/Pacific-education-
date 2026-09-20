/* =========================================
   PACIFIC EDUCATION — PROTOTYPE TEST EVIDENCE BRIDGE
   v1.0.0 — PROTOTYPE / PUBLICATION-GATE EVIDENCE ONLY
   ========================================= */
(function(window, document) {
    "use strict";

    const VERSION = "1.0.0";

    function evaluate() {
        const diagnostics = window.PacificEducationPrototypeRuntimeDiagnostics;
        const checklist = window.PacificEducationOwnerPrototypeTestChecklist;
        const session = window.PacificEducationOwnerPrototypeTestSession;

        const report = diagnostics && typeof diagnostics.run === "function"
            ? diagnostics.run()
            : null;
        const checklistData = checklist && typeof checklist.read === "function"
            ? checklist.read()
            : {};

        const latestSession = session && typeof session.latest === "function"
            ? session.latest()
            : null;

        const required = [
            "page-load", "authorization", "daily-lesson", "lesson-completion",
            "alphabet", "phonics", "dashboards", "owner-review"
        ];

        const humanTestsComplete = required.every(function(id) {
            return checklistData[id] &&
                checklistData[id].status === "pass" &&
                checklistData[id].source !== "automatic-diagnostic";
        });

        return {
            version: VERSION,
            timestamp: new Date().toISOString(),
            diagnosticChecksPassed: !!(report && report.allChecksPassed),
            ownerHumanTestEvidenceComplete: humanTestsComplete,
            testSessionExists: !!latestSession,
            evidenceReadyForFullSystemTesting: !!(
                report &&
                report.allChecksPassed &&
                humanTestsComplete &&
                latestSession
            ),
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            externalAuthorizedReviewRequired: true
        };
    }

    function render(targetId) {
        const target = document.getElementById(
            targetId || "pacificEducationPrototypeTestEvidenceBridge"
        );
        if (!target) return false;

        const result = evaluate();
        target.innerHTML = "";

        const h = document.createElement("h3");
        h.textContent = "Prototype Test Evidence Bridge v" + VERSION;
        target.appendChild(h);

        const p = document.createElement("p");
        p.textContent = result.evidenceReadyForFullSystemTesting
            ? "READY — evidence may enter Full System Testing review"
            : "BLOCKED — prototype test evidence is incomplete";
        target.appendChild(p);

        ["diagnosticChecksPassed", "ownerHumanTestEvidenceComplete", "testSessionExists"]
            .forEach(function(key) {
                const row = document.createElement("p");
                row.textContent = key + ": " + (result[key] ? "PASS" : "BLOCKED");
                target.appendChild(row);
            });

        const note = document.createElement("p");
        note.textContent =
            "Evidence bridge only. READY does not mean production approval, certification, or deployment authorization.";
        target.appendChild(note);

        return result;
    }

    window.PacificEducationPrototypeTestEvidenceBridge = Object.freeze({
        version: VERSION,
        evaluate: evaluate,
        render: render
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})(window, document);
