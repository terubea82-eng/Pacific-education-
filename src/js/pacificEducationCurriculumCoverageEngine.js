/*
 * Pacific Education — Curriculum Coverage Engine
 * Version 1.0.0
 *
 * Tracks prototype curriculum coverage without granting production
 * eligibility. Coverage is evidence-based and teacher-confirmed.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";
    var STORAGE_KEY = "pacificEducationCurriculumCoverage";
    var MAX_RECORDS = 5000;
    var STATES = ["not-started", "taught", "practised", "assessed", "covered"];

    function copy(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function load() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            var data = raw ? JSON.parse(raw) : [];
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    function save(records) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
        } catch (e) {
            /* Prototype fallback: memory is not a security boundary. */
        }
    }

    function find(records, indicatorId, studentId) {
        return records.find(function(r) {
            return r.indicatorId === indicatorId &&
                (r.studentId || null) === (studentId || null);
        });
    }

    function record(input) {
        input = input || {};
        if (!input.indicatorId) {
            return { success: false, error: "indicatorId required" };
        }

        var state = STATES.indexOf(input.status) >= 0 ?
            input.status : "taught";

        var records = load();
        var existing = find(records, input.indicatorId, input.studentId);
        var now = new Date().toISOString();

        var item = existing || {
            indicatorId: input.indicatorId,
            studentId: input.studentId || null,
            firstRecordedAt: now,
            prototype: true
        };

        item.status = state;
        item.date = input.date || now;
        item.assessmentId = input.assessmentId || item.assessmentId || null;
        item.evidenceType = input.evidenceType || item.evidenceType || null;
        item.teacherConfirmed = input.teacherConfirmed === true;
        item.notes = input.notes || item.notes || "";
        item.productionEligible = false;
        item.updatedAt = now;

        if (state === "covered" && !item.teacherConfirmed) {
            return {
                success: false,
                error: "Teacher confirmation is required for covered status",
                record: copy(item)
            };
        }

        if (!existing) records.push(item);
        save(records);

        return { success: true, record: copy(item), prototype: true };
    }

    function get(indicatorId, studentId) {
        var item = find(load(), indicatorId, studentId);
        return item ? copy(item) : null;
    }

    function list(filters) {
        filters = filters || {};
        return load().filter(function(r) {
            return (!filters.indicatorId || r.indicatorId === filters.indicatorId) &&
                (!filters.studentId || r.studentId === filters.studentId) &&
                (!filters.status || r.status === filters.status);
        }).map(copy);
    }

    function summarize(filters) {
        var records = list(filters);
        var out = {
            totalIndicators: 0,
            notStarted: 0,
            taught: 0,
            practised: 0,
            assessed: 0,
            covered: 0,
            remaining: 0,
            prototype: true
        };

        var reg = window.PacificEducationCurriculumAlignmentRegistry;
        var indicators = reg && typeof reg.list === "function" ?
            reg.list(filters || {}) : [];

        out.totalIndicators = indicators.length;

        indicators.forEach(function(indicator) {
            var item = find(records, indicator.id, filters && filters.studentId);
            if (!item) {
                out.notStarted++;
                return;
            }

            if (item.status === "taught") out.taught++;
            else if (item.status === "practised") out.practised++;
            else if (item.status === "assessed") out.assessed++;
            else if (item.status === "covered") out.covered++;
            else out.notStarted++;
        });

        out.remaining = Math.max(
            0,
            out.totalIndicators - out.covered
        );

        return out;
    }

    function getRemaining(filters) {
        filters = filters || {};
        var reg = window.PacificEducationCurriculumAlignmentRegistry;
        if (!reg || typeof reg.list !== "function") return [];

        return reg.list(filters).filter(function(indicator) {
            var item = get(indicator.id, filters.studentId);
            return !item || item.status !== "covered";
        }).map(copy);
    }

    function validate() {
        var errors = [];
        load().forEach(function(r) {
            if (!r.indicatorId) errors.push("Coverage record missing indicatorId");
            if (STATES.indexOf(r.status) < 0) {
                errors.push(r.indicatorId + ": invalid coverage status");
            }
            if (r.status === "covered" && r.teacherConfirmed !== true) {
                errors.push(r.indicatorId + ": covered record lacks teacher confirmation");
            }
            if (r.productionEligible === true) {
                errors.push(r.indicatorId + ": production eligibility cannot be granted here");
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors,
            recordCount: load().length,
            prototype: true
        };
    }

    function reset() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
    }

    window.PacificEducationCurriculumCoverageEngine =
        Object.freeze({
            name: "PacificEducationCurriculumCoverageEngine",
            version: VERSION,
            states: STATES,
            record: record,
            get: get,
            list: list,
            summarize: summarize,
            getRemaining: getRemaining,
            validate: validate,
            reset: reset
        });
})(window);
