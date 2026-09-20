/* =========================================
   PACIFIC EDUCATION — OWNER PROTOTYPE TEST CHECKLIST
   v1.0.0 — PROTOTYPE EVIDENCE ONLY
   ========================================= */

(function (window, document) {
    "use strict";

    const VERSION = "1.0.0";
    const STORAGE_KEY = "pacificEducationOwnerPrototypeTestChecklist";
    const TESTS = [
        ["page-load", "Prototype page loads"],
        ["authorization", "Start Authorized Student Test works"],
        ["daily-lesson", "Daily lesson displays"],
        ["lesson-completion", "Lesson completion works"],
        ["alphabet", "Alphabet assessment opens"],
        ["phonics", "Phonics assessment opens"],
        ["dashboards", "Teacher/Parent dashboards refresh"],
        ["owner-review", "Owner Final Review renders"]
    ];

    function read() {
        try {
            const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
            return value && typeof value === "object" ? value : {};
        } catch (e) {
            return {};
        }
    }

    function write(data) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }

    function setResult(id, status, notes) {
        if (!TESTS.some(function (item) { return item[0] === id; })) return false;
        const data = read();
        data[id] = {
            status: status === "pass" || status === "blocked" ? status : "not-tested",
            notes: String(notes || ""),
            timestamp: new Date().toISOString()
        };
        return write(data);
    }

    function clearAll() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (e) {
            return false;
        }
    }

    function render(targetId) {
        const target = document.getElementById(
            targetId || "pacificEducationOwnerPrototypeTestChecklistPanel"
        );
        if (!target) return false;

        const data = read();
        target.innerHTML = "";

        const table = document.createElement("table");
        const header = document.createElement("tr");
        ["Test", "Result", "Notes / Evidence", "Action"].forEach(function (text) {
            const th = document.createElement("th");
            th.textContent = text;
            header.appendChild(th);
        });
        table.appendChild(header);

        TESTS.forEach(function (item) {
            const id = item[0];
            const record = data[id] || {};
            const tr = document.createElement("tr");

            const name = document.createElement("td");
            name.textContent = item[1];
            tr.appendChild(name);

            const result = document.createElement("td");
            result.textContent = record.status || "not-tested";
            tr.appendChild(result);

            const notes = document.createElement("td");
            notes.textContent = record.notes || "";
            tr.appendChild(notes);

            const action = document.createElement("td");
            ["pass", "blocked"].forEach(function (status) {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = status === "pass" ? "Mark PASS" : "Mark BLOCKED";
                button.addEventListener("click", function () {
                    const note = window.prompt(
                        "Optional evidence/note for: " + item[1],
                        record.notes || ""
                    );
                    setResult(id, status, note);
                    render(targetId);
                });
                action.appendChild(button);
            });
            tr.appendChild(action);
            table.appendChild(tr);
        });

        target.appendChild(table);

        const controls = document.createElement("div");
        const clear = document.createElement("button");
        clear.type = "button";
        clear.textContent = "Clear Owner Test Evidence";
        clear.addEventListener("click", function () {
            clearAll();
            render(targetId);
        });
        controls.appendChild(clear);
        target.appendChild(controls);

        const note = document.createElement("p");
        note.textContent =
            "Prototype evidence is stored in browser localStorage for testing convenience. It is not a security boundary, not independently verified, and does not grant production approval.";
        target.appendChild(note);

        return data;
    }

    window.PacificEducationOwnerPrototypeTestChecklist = Object.freeze({
        version: VERSION,
        render: render,
        setResult: setResult,
        clearAll: clearAll
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            render();
        });
    } else {
        render();
    }
})(window, document);
