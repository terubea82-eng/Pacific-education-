/* =========================================
   PACIFIC EDUCATION — FULL SYSTEM TEST EVIDENCE RECORD
   v1.0.0 — PROTOTYPE / REVIEW EVIDENCE ONLY
   ========================================= */
(function(window, document) {
    "use strict";

    const VERSION = "1.0.0";
    const KEY = "pacificEducationFullSystemTestEvidenceRecords";

    function read() {
        try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
        catch (e) { return []; }
    }

    function create(input) {
        input = input || {};
        if (!input.testId || !input.evidenceReference || !input.reviewerReference) return null;

        const record = {
            id: "FSTE-" + Date.now(),
            testId: input.testId,
            status: input.status === "pass" ? "pass" : "blocked",
            evidenceReference: input.evidenceReference,
            reviewerReference: input.reviewerReference,
            notes: input.notes || "",
            createdAt: new Date().toISOString(),
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false
        };

        const records = read();
        records.push(record);
        localStorage.setItem(KEY, JSON.stringify(records.slice(-200)));
        return record;
    }

    function latestFor(testId) {
        const records = read().filter(function(r) { return r.testId === testId; });
        return records.length ? records[records.length - 1] : null;
    }

    function evaluate() {
        const matrix = window.PacificEducationFullSystemTestMatrix;
        const tests = matrix && Array.isArray(matrix.tests) ? matrix.tests : [];
        const records = read();

        const verified = tests.every(function(test) {
            const record = records.filter(function(r) { return r.testId === test[0]; }).pop();
            return record && record.status === "pass" && !!record.evidenceReference && !!record.reviewerReference;
        });

        return {
            version: VERSION,
            timestamp: new Date().toISOString(),
            totalTests: tests.length,
            evidenceRecords: records.length,
            allTestsEvidenceVerified: verified,
            status: verified ? "FULL-SYSTEM-TEST-EVIDENCE-VERIFIED" : "BLOCKED",
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            externalAuthorizedReviewRequired: true
        };
    }

    function render(targetId) {
        const target = document.getElementById(targetId || "pacificEducationFullSystemTestEvidenceRecord");
        if (!target) return false;
        const result = evaluate();
        target.innerHTML = "";

        const h = document.createElement("h3");
        h.textContent = "Full System Test Evidence Record v" + VERSION;
        target.appendChild(h);

        const p = document.createElement("p");
        p.textContent = result.status + " — " + result.evidenceRecords + " evidence records stored";
        target.appendChild(p);

        const note = document.createElement("p");
        note.textContent = "Verification requires evidence and reviewer reference for every matrix test. This record does not authorize production.";
        target.appendChild(note);
        return result;
    }

    window.PacificEducationFullSystemTestEvidenceRecord = Object.freeze({
        version: VERSION,
        read: read,
        create: create,
        latestFor: latestFor,
        evaluate: evaluate,
        render: render
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
    else render();
})(window, document);
