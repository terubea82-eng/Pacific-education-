/*
 * Pacific Education — Term Progression Gate UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function gate() {
        return window.PacificEducationTermProgressionGate || null;
    }

    function studentId() {
        var c = window.PacificEducationStudentCoverageContext;
        return c && typeof c.getStudentId === "function" ? c.getStudentId() : null;
    }

    function config() {
        var level = "Class 1", subjectId = "English";
        try {
            level = localStorage.getItem("pacificEducationLevel") || level;
            subjectId = localStorage.getItem("pacificEducationSubject") || subjectId;
        } catch (ignore) {}
        return { level: level, subjectId: subjectId, studentId: studentId() };
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function render(targetId) {
        var target = document.getElementById(
            targetId || "pacificEducationTermProgressionGate"
        );
        if (!target) return { success: false, error: "Term progression target unavailable" };

        var g = gate();
        if (!g) {
            target.innerHTML = "<p>Term Progression Gate unavailable.</p>";
            return { success: false, error: "Gate unavailable" };
        }

        var cfg = config();
        var result = g.evaluate(cfg);

        target.innerHTML =
            '<div class="pacific-education-term-gate">' +
            '<h2>Term 1 → Term 2 Progression</h2>' +
            '<p><strong>Level:</strong> ' + escapeHtml(cfg.level) +
            ' &nbsp; <strong>Subject:</strong> ' + escapeHtml(cfg.subjectId) + '</p>' +
            '<p><strong>Student reference:</strong> ' +
            escapeHtml(cfg.studentId || "No student selected") + '</p>' +
            '<p><strong>Term 1 prerequisites:</strong> ' + result.totalPrerequisites +
            ' &nbsp; <strong>Covered:</strong> ' + result.coveredPrerequisites +
            ' &nbsp; <strong>Remaining:</strong> ' + result.remainingPrerequisites + '</p>' +
            '<h3>Required before Term 2</h3>' +
            '<ul>' +
            (result.missing.length ? result.missing.map(function(item) {
                return '<li><strong>' + escapeHtml(item.indicatorId) +
                    '</strong> — ' + escapeHtml(item.label) +
                    ' <small>(' + escapeHtml(item.officialSourceStatus) + ')</small></li>';
            }).join("") :
            '<li>All registered Term 1 prerequisites are covered.</li>') +
            '</ul>' +
            '<p><strong>Status:</strong> ' +
            (result.term2Ready ? "Prototype Term 2 gate ready" :
                "Term 2 prerequisites remain") + '</p>' +
            '<p><small>LANA/LANS prerequisites can be registered only after the official curriculum mapping is verified. This prototype does not invent or certify curriculum requirements.</small></p>' +
            '</div>';

        return result;
    }

    function init() {
        render("pacificEducationTermProgressionGate");
    }

    window.PacificEducationTermProgressionGateUI = Object.freeze({
        name: "PacificEducationTermProgressionGateUI",
        version: VERSION,
        render: render,
        init: init
    });

    document.addEventListener("pacificEducationCoverageRefresh", function() {
        render("pacificEducationTermProgressionGate");
    });
    document.addEventListener("pacificEducationStudentChanged", function() {
        render("pacificEducationTermProgressionGate");
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
