/*
 * Pacific Education — Term Progression Gate
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Tracks owner-configured Term 1 prerequisite indicators (including
 * LANA/LANS prerequisites when officially mapped) and prevents the
 * prototype from treating Term 2 as complete until prerequisites
 * are covered.
 *
 * This file does NOT define or certify official Fiji curriculum content.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";
    var STORAGE_KEY = "pacificEducationTerm1Prerequisites";

    function copy(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function getStore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { indicators: [] };
        } catch (ignore) {
            return { indicators: [] };
        }
    }

    function saveStore(store) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        } catch (ignore) {}
        return store;
    }

    function registerPrerequisite(input) {
        input = input || {};
        if (!input.indicatorId) {
            return { success: false, error: "indicatorId is required" };
        }

        var store = getStore();
        var item = {
            indicatorId: String(input.indicatorId),
            level: input.level || null,
            subjectId: input.subjectId || null,
            term: input.term || "Term 1",
            prerequisiteType: input.prerequisiteType || "term-1-required",
            label: input.label || "Term 1 prerequisite",
            officialSourceStatus: input.officialSourceStatus || "unverified",
            prototype: true,
            productionEligible: false
        };

        var index = store.indicators.findIndex(function(x) {
            return x.indicatorId === item.indicatorId &&
                x.level === item.level &&
                x.subjectId === item.subjectId;
        });

        if (index >= 0) store.indicators[index] = item;
        else store.indicators.push(item);

        saveStore(store);
        return { success: true, prerequisite: copy(item), prototype: true };
    }

    function list(filters) {
        filters = filters || {};
        return getStore().indicators.filter(function(item) {
            return (!filters.level || item.level === filters.level) &&
                (!filters.subjectId || item.subjectId === filters.subjectId) &&
                (!filters.term || item.term === filters.term);
        }).map(copy);
    }

    function getCoverage(item, studentId) {
        var engine = window.PacificEducationCurriculumCoverageEngine;
        if (!engine || typeof engine.get !== "function") return null;
        return engine.get(item.indicatorId, studentId) || null;
    }

    function evaluate(filters) {
        filters = filters || {};
        var studentId = filters.studentId || null;
        var prerequisites = list({
            level: filters.level,
            subjectId: filters.subjectId,
            term: "Term 1"
        });

        var covered = 0;
        var missing = [];

        prerequisites.forEach(function(item) {
            var record = getCoverage(item, studentId);
            if (record && record.status === "covered") covered++;
            else missing.push(copy(item));
        });

        return {
            success: true,
            studentId: studentId,
            totalPrerequisites: prerequisites.length,
            coveredPrerequisites: covered,
            remainingPrerequisites: missing.length,
            missing: missing,
            term2Ready: missing.length === 0,
            prototype: true,
            productionEligible: false
        };
    }

    function canEnterTerm2(filters) {
        return evaluate(filters).term2Ready === true;
    }

    function registerLanaLansPrerequisite(input) {
        input = input || {};
        input.prerequisiteType = "LANA-LANS-Term-1-prerequisite";
        input.label = input.label || "LANA/LANS Term 1 prerequisite";
        return registerPrerequisite(input);
    }

    function clear() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (ignore) {}
        return { success: true, prototype: true };
    }

    function validate() {
        var errors = [];
        getStore().indicators.forEach(function(item) {
            if (!item.indicatorId) errors.push("Missing indicatorId");
            if (item.term !== "Term 1") errors.push(item.indicatorId + ": prerequisite must be Term 1");
        });
        return {
            valid: errors.length === 0,
            errors: errors,
            prerequisiteCount: getStore().indicators.length,
            prototype: true
        };
    }

    window.PacificEducationTermProgressionGate = Object.freeze({
        name: "PacificEducationTermProgressionGate",
        version: VERSION,
        registerPrerequisite: registerPrerequisite,
        registerLanaLansPrerequisite: registerLanaLansPrerequisite,
        list: list,
        evaluate: evaluate,
        canEnterTerm2: canEnterTerm2,
        validate: validate,
        clear: clear
    });
})(window, document);
