/*
 * Pacific Education — Curriculum Coverage Dashboard UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function engine() {
        return window.PacificEducationCurriculumCoverageEngine || null;
    }

    function studentContext() {
        return window.PacificEducationStudentCoverageContext || null;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getValue(id, fallback) {
        var el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
    }

    function render(targetId) {
        var target = document.getElementById(targetId || "pacificEducationCoverageDashboard");
        if (!target) return { success: false, error: "Coverage dashboard target unavailable" };

        var e = engine();
        if (!e) {
            target.innerHTML = "<p>Curriculum coverage engine unavailable.</p>";
            return { success: false, error: "Coverage engine unavailable" };
        }

        var filters = {
            level: getValue("pacificEducationCoverageLevel", null),
            subjectId: getValue("pacificEducationCoverageSubject", null),
            term: getValue("pacificEducationCoverageTerm", null)
        };

        var summary = e.summarize(filters);
        var remaining = e.getRemaining(filters);

        target.innerHTML =
            '<div class="pacific-education-coverage-card">' +
            '<h2>Curriculum Coverage</h2>' +
            '<p>Prototype teacher view — coverage is based on recorded evidence.</p>' +
            '<div class="pacific-education-coverage-filters">' +
            '<label>Level <select id="pacificEducationCoverageLevel">' +
            '<option value="">All levels</option>' +
            '<option>Class 1</option><option>Class 2</option><option>Class 3</option>' +
            '<option>Class 4</option><option>Class 5</option><option>Class 6</option>' +
            '<option>Form 1</option><option>Form 2</option><option>Form 3</option>' +
            '<option>Form 4</option><option>Form 5</option><option>Form 6</option><option>Form 7</option>' +
            '</select></label>' +
            '<label>Subject <select id="pacificEducationCoverageSubject">' +
            '<option value="">All subjects</option><option>English</option><option>Mathematics</option>' +
            '<option>Science</option><option>Social Science</option><option>Health & Physical Education</option>' +
            '<option>Arts</option><option>Technology</option><option>Other / Integrated Learning</option>' +
            '</select></label>' +
            '<label>Term <select id="pacificEducationCoverageTerm">' +
            '<option value="">All terms</option><option>Term 1</option><option>Term 2</option><option>Term 3</option>' +
            '</select></label></div>' +
            '<div class="pacific-education-coverage-summary">' +
            '<div><strong>' + summary.totalIndicators + '</strong><span>Total</span></div>' +
            '<div><strong>' + summary.taught + '</strong><span>Taught</span></div>' +
            '<div><strong>' + summary.practised + '</strong><span>Practised</span></div>' +
            '<div><strong>' + summary.assessed + '</strong><span>Assessed</span></div>' +
            '<div><strong>' + summary.covered + '</strong><span>Covered</span></div>' +
            '<div><strong>' + summary.remaining + '</strong><span>Remaining</span></div>' +
            '</div>' +
            '<h3>Remaining Achievement Indicators</h3>' +
            '<ul>' +
            (remaining.length ? remaining.map(function(item) {
                return '<li><strong>' + escapeHtml(item.id) + '</strong> — ' +
                    escapeHtml(item.indicatorText) + '</li>';
            }).join("") : "<li>No remaining indicators in this filter.</li>") +
            '</ul>' +
            '<p><small>Prototype only. Production publication requires curriculum verification, safeguarding, security and formal testing.</small></p>' +
            '</div>';

        var levelEl = document.getElementById("pacificEducationCoverageLevel");
        var subjectEl = document.getElementById("pacificEducationCoverageSubject");
        var termEl = document.getElementById("pacificEducationCoverageTerm");

        if (levelEl) levelEl.value = filters.level || "";
        if (subjectEl) subjectEl.value = filters.subjectId || "";
        if (termEl) termEl.value = filters.term || "";

        [levelEl, subjectEl, termEl].forEach(function(el) {
            if (el) el.addEventListener("change", function() { render(targetId); });
        });

        return { success: true, summary: summary, remainingCount: remaining.length, prototype: true };
    }

    function init() {
        return render("pacificEducationCoverageDashboard");
    }

    window.PacificEducationCurriculumCoverageDashboardUI = Object.freeze({
        name: "PacificEducationCurriculumCoverageDashboardUI",
        version: VERSION,
        render: render,
        init: init
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
