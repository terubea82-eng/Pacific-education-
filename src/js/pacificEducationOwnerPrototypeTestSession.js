/* =========================================
   PACIFIC EDUCATION — OWNER PROTOTYPE TEST SESSION
   v1.0.0 — PROTOTYPE EVIDENCE ONLY
   ========================================= */
(function(window, document) {
    "use strict";

    const VERSION = "1.0.0";
    const STORAGE_KEY = "pacificEducationOwnerPrototypeTestSessions";

    function read() {
        try {
            const v = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(v) ? v : [];
        } catch (e) {
            return [];
        }
    }

    function save(items) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-50)));
            return true;
        } catch (e) {
            return false;
        }
    }

    function collect() {
        const checklist = window.PacificEducationOwnerPrototypeTestChecklist;
        const diagnostics = window.PacificEducationPrototypeRuntimeDiagnostics;
        const checklistData = checklist && typeof checklist.read === "function"
            ? checklist.read()
            : null;
        const report = diagnostics && typeof diagnostics.run === "function"
            ? diagnostics.run()
            : null;

        return {
            sessionId: "PET-" + Date.now(),
            createdAt: new Date().toISOString(),
            checklist: checklistData,
            diagnostics: report,
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            externalAuthorizedReviewRequired: true
        };
    }

    function create() {
        const session = collect();
        const items = read();
        items.push(session);
        save(items);
        render();
        return session;
    }

    function latest() {
        const items = read();
        return items.length ? items[items.length - 1] : null;
    }

    function clear() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
            render();
            return true;
        } catch (e) {
            return false;
        }
    }

    function render() {
        const target = document.getElementById("pacificEducationOwnerPrototypeTestSession");
        if (!target) return false;

        const session = latest();
        target.innerHTML = "";

        const h = document.createElement("h3");
        h.textContent = "Owner Prototype Test Session v" + VERSION;
        target.appendChild(h);

        if (!session) {
            const p = document.createElement("p");
            p.textContent = "No saved test session.";
            target.appendChild(p);
        } else {
            const p = document.createElement("p");
            p.textContent = "Latest session: " + session.sessionId + " — " + session.createdAt;
            target.appendChild(p);

            const pre = document.createElement("pre");
            pre.textContent = JSON.stringify(session, null, 2);
            target.appendChild(pre);
        }

        const createButton = document.createElement("button");
        createButton.type = "button";
        createButton.textContent = "Save Current Test Session";
        createButton.addEventListener("click", create);
        target.appendChild(createButton);

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.textContent = "Clear Saved Sessions";
        clearButton.addEventListener("click", clear);
        target.appendChild(clearButton);

        const note = document.createElement("p");
        note.textContent = "Prototype evidence only. Saved in browser localStorage. This record does not certify security, privacy, child safeguarding, production readiness, or deployment authorization.";
        target.appendChild(note);

        return session;
    }

    window.PacificEducationOwnerPrototypeTestSession = Object.freeze({
        version: VERSION,
        create: create,
        latest: latest,
        render: render,
        clear: clear
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})(window, document);
