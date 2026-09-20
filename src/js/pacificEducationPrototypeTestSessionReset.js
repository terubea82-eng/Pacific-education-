/* =========================================================
   PACIFIC EDUCATION — PROTOTYPE TEST SESSION RESET
   v1.0.0 — PROTOTYPE ONLY
   ---------------------------------------------------------
   Clears accumulated prototype learner progress/test evidence
   without touching curriculum-source records or production gates.
   ========================================================= */
(function (window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function reset() {
        var core = window.PacificEducationCore;
        var offline = window.PacificEducationOfflineRuntime;

        if (!core || typeof core.resetPrototypeProgress !== "function") {
            return {
                success: false,
                reason: "CORE_RESET_UNAVAILABLE",
                prototype: true
            };
        }

        if (typeof core.isAuthorized === "function" && !core.isAuthorized()) {
            return {
                success: false,
                reason: "PROTOTYPE_AUTHORIZATION_REQUIRED",
                prototype: true
            };
        }

        var cleared = [];
        var keys = [
            "currentDayNumber",
            "currentDay",
            "lessonsCompleted",
            "studentName",
            "alphabetAssessment",
            "phonicsAssessment",
            "learningStatus",
            "pacificOwnerTestDay"
        ];

        keys.forEach(function (key) {
            try {
                localStorage.removeItem(key);
                cleared.push(key);
            } catch (error) {}
        });

        try {
            localStorage.removeItem("pacificEducationFullSystemTestMatrix");
            cleared.push("pacificEducationFullSystemTestMatrix");
        } catch (error) {}

        var coreReset = core.resetPrototypeProgress();

        var queueReset = false;
        if (offline && typeof offline.clearQueue === "function") {
            var result = offline.clearQueue();
            queueReset = result && result.success === true;
        }

        return {
            success: coreReset === true,
            version: VERSION,
            clearedCompatibilityKeys: cleared,
            offlineQueueCleared: queueReset,
            prototype: true,
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false
        };
    }

    function installButton() {
        if (!document || !document.body || document.getElementById("pacificEducationPrototypeResetButton")) {
            return;
        }

        var status =
            document.getElementById("pacificEducationSystemStatus") ||
            document.querySelector("main") ||
            document.body;

        var wrap = document.createElement("div");
        wrap.id = "pacificEducationPrototypeResetControl";
        wrap.style.margin = "1rem 0";
        wrap.style.padding = "0.75rem";
        wrap.style.border = "1px solid currentColor";

        var button = document.createElement("button");
        button.id = "pacificEducationPrototypeResetButton";
        button.type = "button";
        button.textContent = "Reset Prototype Test Session";

        var note = document.createElement("p");
        note.textContent =
            "Prototype only: clears accumulated learner progress, offline queue and local test evidence. Curriculum records and production gates are not changed.";

        button.addEventListener("click", function () {
            if (!window.confirm(
                "Reset this prototype test session? This clears local prototype progress, offline queue and local full-system test evidence."
            )) {
                return;
            }

            var result = reset();

            if (result.success) {
                window.location.reload();
            } else {
                window.alert("Prototype reset was blocked: " + result.reason);
            }
        });

        wrap.appendChild(button);
        wrap.appendChild(note);

        if (status && status.parentNode) {
            status.parentNode.insertBefore(wrap, status);
        } else {
            document.body.appendChild(wrap);
        }
    }

    window.PacificEducationPrototypeTestSessionReset = Object.freeze({
        version: VERSION,
        reset: reset
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", installButton);
    } else {
        installButton();
    }
})(window, document);
