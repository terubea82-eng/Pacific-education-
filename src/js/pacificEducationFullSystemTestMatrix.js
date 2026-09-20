/* =========================================
   PACIFIC EDUCATION — FULL SYSTEM TEST MATRIX
   v1.0.0 — PROTOTYPE / TEST CONTROL ONLY
   ========================================= */
(function(window, document) {
    "use strict";

    const VERSION = "1.1.0";
    const KEY = "pacificEducationFullSystemTestMatrix";

    const TESTS = [
        ["foundation","Page loads without blocking errors"],
        ["authorization","Prototype authorization follows the intended flow"],
        ["daily-learning","Daily lesson displays the correct selected context"],
        ["assessment","Alphabet and phonics assessment flows operate"],
        ["progress","Lesson completion updates progress correctly"],
        ["dashboards","Teacher and parent dashboard flows respect release boundaries"],
        ["curriculum","Curriculum alignment data maps to approved source evidence"],
        ["calendar","Teacher calendar/revision/exam scheduling preserves coverage rules"],
        ["relationships","Education Link Bridge enforces relationship-before-access logic"],
        ["security","Production security boundaries remain server-side requirements"],
        ["pricing","Pricing uses owner-controlled Fiji values and approved GDP rules"],
        ["payments","Client payment state is never treated as production proof"],
        ["offline","Offline/low-bandwidth fallback behavior is tested"],
        ["offline-sync","Offline queue preserves progress until secure server acknowledgement"],
        ["accessibility-runtime","Accessibility runtime exposes text scaling, speech controls and live status"],
        ["offline-sync-batch","Offline sync batch contains only approved non-sensitive progress fields"],
        ["offline-sync-fail-closed","Offline sync does not clear queued progress without server acknowledgement"],

        ["accessibility","Text, keyboard, assistive technology and readability behavior is tested"],
        ["safeguarding","Child-safeguarding controls are reviewed by qualified specialists"],
        ["recovery","Rollback, recovery and audit evidence are tested"],
        ["release-control","Final release-control gates remain fail-closed"]
    ];

    function read() {
        try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
        catch (e) { return {}; }
    }

    function setResult(id, status, evidence, notes) {
        const found = TESTS.some(function(t) { return t[0] === id; });
        if (!found) return false;
        const data = read();
        data[id] = {
            id: id,
            status: status === "pass" || status === "blocked" ? status : "blocked",
            evidence: evidence || "",
            notes: notes || "",
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(KEY, JSON.stringify(data));
        return true;
    }

    function evaluate() {
        const data = read();
        const complete = TESTS.every(function(t) {
            return data[t[0]] && data[t[0]].status === "pass" && data[t[0]].evidence;
        });
        return {
            version: VERSION,
            timestamp: new Date().toISOString(),
            totalTests: TESTS.length,
            completedTests: TESTS.filter(function(t) {
                return data[t[0]] && data[t[0]].status === "pass" && data[t[0]].evidence;
            }).length,
            status: complete ? "FULL-SYSTEM-TESTING-EVIDENCE-COMPLETE" : "BLOCKED",
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            externalAuthorizedReviewRequired: true,
            tests: TESTS.map(function(t) {
                return Object.assign({id:t[0], description:t[1]}, data[t[0]] || {status:"blocked",evidence:""});
            })
        };
    }

    function render(targetId) {
        const target = document.getElementById(targetId || "pacificEducationFullSystemTestMatrix");
        if (!target) return false;
        const result = evaluate();
        target.innerHTML = "";

        const h = document.createElement("h3");
        h.textContent = "Full System Test Matrix v" + VERSION;
        target.appendChild(h);

        const p = document.createElement("p");
        p.textContent = result.status + " — " + result.completedTests + "/" + result.totalTests + " tests with required evidence";
        target.appendChild(p);

        result.tests.forEach(function(test) {
            const row = document.createElement("div");
            const label = document.createElement("strong");
            label.textContent = test.id + ": " + test.description + " — " + test.status.toUpperCase();
            row.appendChild(label);

            const evidence = document.createElement("p");
            evidence.textContent = test.evidence ? "Evidence: " + test.evidence : "Evidence required before PASS.";
            row.appendChild(evidence);
            target.appendChild(row);
        });

        const note = document.createElement("p");
        note.textContent = "Prototype test record only. A completed matrix does not certify production security, privacy, safeguarding, hosting, database, payments, or deployment.";
        target.appendChild(note);
        return result;
    }

    window.PacificEducationFullSystemTestMatrix = Object.freeze({
        version: VERSION,
        tests: TESTS,
        read: read,
        setResult: setResult,
        evaluate: evaluate,
        render: render
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
    else render();
})(window, document);
