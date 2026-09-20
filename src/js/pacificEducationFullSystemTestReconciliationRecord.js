/* =========================================
   PACIFIC EDUCATION — FULL SYSTEM TEST RECONCILIATION RECORD
   v1.0.0 — PROTOTYPE / FAIL-CLOSED
   ========================================= */
(function(window) {
    "use strict";

    const VERSION = "1.0.0";
    const KEY = "pacificEducationFullSystemTestReconciliations";
    const ALLOWED = ["reconciled", "reconciled-with-open-items", "not-reconciled"];

    function read() {
        try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
        catch (e) { return []; }
    }

    function create(input) {
        input = input || {};
        if (!input.reviewerReference || !input.evidenceReference || !input.reconciliationStatus) return null;
        if (!ALLOWED.includes(input.reconciliationStatus)) return null;

        const record = {
            reconciliationId: "FSTR-" + Date.now(),
            reviewerReference: String(input.reviewerReference),
            reconciliationStatus: input.reconciliationStatus,
            evidenceReference: String(input.evidenceReference),
            notes: String(input.notes || ""),
            createdAt: new Date().toISOString(),
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false
        };

        const rows = read();
        rows.push(record);
        localStorage.setItem(KEY, JSON.stringify(rows.slice(-200)));
        return record;
    }

    function latest() {
        const rows = read();
        return rows.length ? rows[rows.length - 1] : null;
    }

    function evaluate() {
        const gate = window.PacificEducationFinalReleaseAuthorizedReviewFinalReconciliationGate;
        const testGate = window.PacificEducationFullSystemTestVerificationGate;
        const finalGate = gate && typeof gate.verify === "function" ? gate.verify() : null;
        const testResult = testGate && typeof testGate.evaluate === "function" ? testGate.evaluate() : null;

        const blockers = [];
        if (!testResult || testResult.status !== "FULL-SYSTEM-TEST-VERIFIED-FOR-RECONCILIATION")
            blockers.push("full-system-test-not-verified");
        if (!finalGate || finalGate.status !== "FINAL-RECONCILIATION-VERIFIED-FOR-REVIEW-CONTROL")
            blockers.push("final-reconciliation-gate-not-verified");

        const ready = blockers.length === 0;

        return {
            version: VERSION,
            timestamp: new Date().toISOString(),
            status: ready ? "READY-FOR-RECONCILIATION-RECORD" : "BLOCKED",
            blockers: blockers,
            fullSystemTestVerified: !!(testResult && testResult.status === "FULL-SYSTEM-TEST-VERIFIED-FOR-RECONCILIATION"),
            finalReconciliationGateVerified: !!(finalGate && finalGate.status === "FINAL-RECONCILIATION-VERIFIED-FOR-REVIEW-CONTROL"),
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            externalAuthorizedReviewRequired: true
        };
    }

    window.PacificEducationFullSystemTestReconciliationRecord = Object.freeze({
        version: VERSION,
        read: read,
        latest: latest,
        create: create,
        evaluate: evaluate,
        allowedStatuses: ALLOWED,
        prototype: true,
        productionApproved: false,
        productionEligible: false,
        deploymentAuthorized: false
    });
})(window);
