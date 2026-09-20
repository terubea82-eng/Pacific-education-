/*
 * Pacific Education
 * Curriculum Source & Verification Layer
 * Version 1.0.0
 *
 * Keeps source provenance and verification separate from the
 * curriculum content itself.
 *
 * PROTOTYPE ONLY.
 * Official Fiji curriculum documents, prescriptions and achievement
 * indicators must be supplied and verified before production use.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";
    var records = [];

    var VERIFICATION_STATES = [
        "unverified",
        "source-reviewed",
        "curriculum-verified",
        "owner-approved",
        "production-approved"
    ];

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function validState(state) {
        return VERIFICATION_STATES.indexOf(state) !== -1;
    }

    function register(record) {
        if (!record || !record.id) {
            throw new Error("Curriculum source record id required");
        }

        var item = copy(record);

        if (!item.verificationStatus) {
            item.verificationStatus = "unverified";
        }

        if (!validState(item.verificationStatus)) {
            throw new Error("Invalid curriculum verification status");
        }

        item.productionEligible =
            item.verificationStatus === "production-approved";

        var index = records.findIndex(function(existing) {
            return existing.id === item.id;
        });

        if (index >= 0) {
            records[index] = item;
        } else {
            records.push(item);
        }

        return copy(item);
    }

    function get(id) {
        var item = records.find(function(record) {
            return record.id === id;
        });
        return item ? copy(item) : null;
    }

    function list(filters) {
        filters = filters || {};

        return records.filter(function(record) {
            return (!filters.level || record.level === filters.level) &&
                (!filters.subjectId || record.subjectId === filters.subjectId) &&
                (!filters.term || record.term === filters.term) &&
                (!filters.verificationStatus ||
                    record.verificationStatus === filters.verificationStatus);
        }).map(copy);
    }

    function verify(id, status, reviewer, notes) {
        if (!validState(status)) {
            throw new Error("Invalid curriculum verification status");
        }

        var item = records.find(function(record) {
            return record.id === id;
        });

        if (!item) {
            throw new Error("Curriculum source record not found");
        }

        item.verificationStatus = status;
        item.productionEligible = status === "production-approved";
        item.verification = item.verification || {};
        item.verification.reviewer = reviewer || null;
        item.verification.notes = notes || "";
        item.verification.date = new Date().toISOString();

        return copy(item);
    }

    function canUseForPrototype(id) {
        var item = get(id);
        return !!item;
    }

    function canUseForProduction(id) {
        var item = get(id);
        return !!item && item.verificationStatus === "production-approved";
    }

    function validate() {
        var errors = [];

        records.forEach(function(record) {
            ["id", "level", "subjectId", "term", "indicatorText"].forEach(function(key) {
                if (!record[key]) {
                    errors.push(record.id + ": missing " + key);
                }
            });

            if (!record.source || !record.source.title) {
                errors.push(record.id + ": missing source title");
            }

            if (!record.source || !record.source.reference) {
                errors.push(record.id + ": missing source reference");
            }

            if (!validState(record.verificationStatus)) {
                errors.push(record.id + ": invalid verification status");
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors,
            count: records.length,
            prototype: true
        };
    }

    function getProductionEligible(filters) {
        filters = filters || {};
        filters.verificationStatus = "production-approved";
        return list(filters);
    }

    function exportRecords() {
        return copy(records);
    }

    function reset() {
        records = [];
    }

    window.PacificEducationCurriculumSourceVerification =
        Object.freeze({
            name: "PacificEducationCurriculumSourceVerification",
            version: VERSION,
            verificationStates: VERIFICATION_STATES.slice(),
            register: register,
            get: get,
            list: list,
            verify: verify,
            canUseForPrototype: canUseForPrototype,
            canUseForProduction: canUseForProduction,
            getProductionEligible: getProductionEligible,
            validate: validate,
            exportRecords: exportRecords,
            reset: reset
        });
})(window);
