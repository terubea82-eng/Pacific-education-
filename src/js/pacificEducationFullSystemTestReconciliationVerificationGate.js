/* =========================================
   PACIFIC EDUCATION — FULL SYSTEM TEST RECONCILIATION VERIFICATION GATE
   v1.0.0 — FAIL-CLOSED / PROTOTYPE CONTROL
   ========================================= */
(function(window, document) {
    "use strict";

    const VERSION = "1.0.0";

    function evaluate() {
        const api = window.PacificEducationFullSystemTestReconciliationRecord;
        if (!api || typeof api.latest !== "function") {
            return {
                version: VERSION,
                status: "BLOCKED",
                reason: "Full system test reconciliation record API unavailable.",
                productionApproved: false,
                productionEligible: false,
                deploymentAuthorized: false,
                externalAuthorizedReviewRequired: true
            };
        }

        const record = api.latest();
        if (!record) {
            return {
                version: VERSION,
                status: "BLOCKED",
                reason: "No full system test reconciliation record exists.",
                productionApproved: false,
                productionEligible: false,
                deploymentAuthorized: false,
                externalAuthorizedReviewRequired: true
            };
        }

        const valid = !!(
            record.reconciliationId &&
            record.reviewerReference &&
            record.evidenceReference &&
            ["reconciled", "reconciled-with-open-items", "not-reconciled"].includes(record.reconciliationStatus)
        );

        return {
            version: VERSION,
            timestamp: new Date().toISOString(),
            status: valid ? "FULL-SYSTEM-TEST-RECONCILIATION-VERIFIED" : "BLOCKED",
            reason: valid
                ? "Latest full system test reconciliation record is structurally verified."
                : "Latest reconciliation record is incomplete or invalid.",
            record: record,
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            externalAuthorizedReviewRequired: true
        };
    }

    function render(targetId) {
        const target = document.getElementById(
            targetId || "pacificEducationFullSystemTestReconciliationVerificationGate"
        );
        if (!target) return false;

        const result = evaluate();
        target.innerHTML = "";

        const h = document.createElement("h3");
        h.textContent = "Full System Test Reconciliation Verification Gate v" + VERSION;
        target.appendChild(h);

        const p = document.createElement("p");
        p.textContent = result.status;
        target.appendChild(p);

        const reason = document.createElement("p");
        reason.textContent = result.reason;
        target.appendChild(reason);

        const flags = document.createElement("p");
        flags.textContent =
            "Production approved: NO | Production eligible: NO | Deployment authorized: NO";
        target.appendChild(flags);

        const note = document.createElement("p");
        note.textContent =
            "Fail-closed prototype verification only. This gate does not certify production readiness or authorize deployment.";
        target.appendChild(note);

        return result;
    }

    window.PacificEducationFullSystemTestReconciliationVerificationGate = Object.freeze({
        version: VERSION,
        evaluate: evaluate,
        render: render,
        prototype: true,
        productionApproved: false,
        productionEligible: false,
        deploymentAuthorized: false
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})(window, document);
