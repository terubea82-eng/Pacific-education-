/*
 * =========================================================
 * PACIFIC EDUCATION
 * SPECIFICATION BRIDGE
 * =========================================================
 * File:
 *   src/js/pacificEducationSpecificationBridge.js
 *
 * Version:
 *   1.0.0
 *
 * Purpose:
 *   Safely connects the existing locked specification registry
 *   with the master inclusion specification.
 *
 * IMPORTANT:
 *   - This file does NOT modify either specification.
 *   - This file does NOT replace either specification.
 *   - This file does NOT mark requirements as implemented.
 *   - This file does NOT mark requirements as verified.
 *   - Specification alignment is NOT the same as implementation.
 *   - Production security must remain server-side.
 * =========================================================
 */

(function (global) {
    "use strict";

    var BRIDGE_VERSION = "1.0.0";

    var LOCKED_SPEC_API_NAME =
        "PacificEducationLockedSpecifications";

    var MASTER_SPEC_API_NAME =
        "PacificEducationMasterInclusionSpecification";

    var ALIGNMENT_STATUS = {
        ALIGNED: "ALIGNED",
        PARTIAL: "PARTIAL",
        NOT_AVAILABLE: "NOT_AVAILABLE",
        NOT_CHECKED: "NOT_CHECKED"
    };

    /*
     * ---------------------------------------------------------
     * SAFELY LOCATE SOURCE SPECIFICATIONS
     * ---------------------------------------------------------
     */

    function getLockedSpecificationAPI() {
        return global &&
            global[LOCKED_SPEC_API_NAME]
            ? global[LOCKED_SPEC_API_NAME]
            : null;
    }

    function getMasterSpecificationAPI() {
        return global &&
            global[MASTER_SPEC_API_NAME]
            ? global[MASTER_SPEC_API_NAME]
            : null;
    }

    /*
     * ---------------------------------------------------------
     * SOURCE AVAILABILITY
     * ---------------------------------------------------------
     */

    function getSourceAvailability() {
        var lockedAPI = getLockedSpecificationAPI();
        var masterAPI = getMasterSpecificationAPI();

        return Object.freeze({
            lockedSpecificationsAvailable: !!lockedAPI,
            masterInclusionSpecificationAvailable: !!masterAPI,
            bridgeCanReadBoth: !!lockedAPI && !!masterAPI
        });
    }

    /*
     * ---------------------------------------------------------
     * SAFE READ HELPERS
     * ---------------------------------------------------------
     */

    function safeCall(object, methodName, fallback) {
        if (!object || typeof object[methodName] !== "function") {
            return fallback;
        }

        try {
            return object[methodName]();
        } catch (error) {
            return fallback;
        }
    }

    function getLockedSpecifications() {
        var api = getLockedSpecificationAPI();

        return safeCall(
            api,
            "getLockedSpecifications",
            null
        );
    }

    function getMasterSpecification() {
        var api = getMasterSpecificationAPI();

        return safeCall(
            api,
            "getSpecification",
            null
        );
    }

    /*
     * ---------------------------------------------------------
     * REQUIRED LOCKED PRINCIPLES
     *
     * These are the foundational areas that the bridge checks.
     *
     * The bridge checks presence and structural alignment only.
     * It does not claim that application functionality exists.
     * ---------------------------------------------------------
     */

    var REQUIRED_PRINCIPLES = Object.freeze([
        {
            id: "PE-FAIRNESS-001",
            name: "Fairness and Justice",
            lockedKey: "FAIRNESS_AND_JUSTICE",
            masterKey: "FOUNDATIONAL_PRINCIPLES"
        },
        {
            id: "PE-CURRICULUM-001",
            name: "Curriculum Authority",
            lockedKey: "CURRICULUM_AUTHORITY",
            masterKey: "CURRICULUM_POLICY"
        },
        {
            id: "PE-ADAPTATION-001",
            name: "Adaptive Real-Life Learning",
            lockedKey: "ADAPTIVE_REAL_LIFE_LEARNING",
            masterKey: "REAL_LIFE_LEARNING_POLICY"
        },
        {
            id: "PE-CALENDAR-001",
            name: "School Calendar",
            lockedKey: "SCHOOL_CALENDAR",
            masterKey: "CALENDAR_POLICY"
        },
        {
            id: "PE-ASSESSMENT-001",
            name: "Assessment Fairness",
            lockedKey: "ASSESSMENT_FAIRNESS",
            masterKey: "ASSESSMENT_POLICY"
        },
        {
            id: "PE-TEACHER-001",
            name: "Teacher Capability",
            lockedKey: "TEACHER_CAPABILITY",
            masterKey: "DASHBOARD_POLICY"
        },
        {
            id: "PE-SAFETY-001",
            name: "Child Safeguarding",
            lockedKey: "CHILD_SAFEGUARDING",
            masterKey: "SAFEGUARDING_POLICY"
        },
        {
            id: "PE-SECURITY-001",
            name: "Security Relationship Model",
            lockedKey: "SECURITY_RELATIONSHIP_MODEL",
            masterKey: "SECURITY_POLICY"
        },
        {
            id: "PE-MARKETPLACE-001",
            name: "Original Work Marketplace",
            lockedKey: "ORIGINAL_WORK_MARKETPLACE",
            masterKey: "MARKETPLACE_POLICY"
        },
        {
            id: "PE-OFFLINE-001",
            name: "Offline Resilience",
            lockedKey: "OFFLINE_RESILIENCE",
            masterKey: "REAL_LIFE_LEARNING_POLICY"
        },
        {
            id: "PE-LIFESKILLS-001",
            name: "Life Skills Achievement",
            lockedKey: "LIFE_SKILLS_ACHIEVEMENT",
            masterKey: "REAL_LIFE_LEARNING_POLICY"
        },
        {
            id: "PE-ACCESS-001",
            name: "Education Access",
            lockedKey: "EDUCATION_ACCESS",
            masterKey: "ACCESS_POLICY"
        }
    ]);

    /*
     * ---------------------------------------------------------
     * LOCKED SPECIFICATION LOOKUP
     * ---------------------------------------------------------
     */

    function findLockedSpecification(id) {
        var registry = getLockedSpecifications();

        if (!registry) {
            return null;
        }

        /*
         * Supported registry shapes:
         *
         * 1. Array
         * 2. Object containing specifications
         * 3. Object keyed by specification ID
         */

        if (Array.isArray(registry)) {
            for (var i = 0; i < registry.length; i += 1) {
                if (
                    registry[i] &&
                    registry[i].id === id
                ) {
                    return registry[i];
                }
            }
        }

        if (
            registry &&
            Array.isArray(registry.specifications)
        ) {
            for (
                var j = 0;
                j < registry.specifications.length;
                j += 1
            ) {
                if (
                    registry.specifications[j] &&
                    registry.specifications[j].id === id
                ) {
                    return registry.specifications[j];
                }
            }
        }

        if (
            registry &&
            registry[id]
        ) {
            return registry[id];
        }

        return null;
    }

    /*
     * ---------------------------------------------------------
     * MASTER SPECIFICATION LOOKUP
     * ---------------------------------------------------------
     */

    function findMasterSection(key) {
        var master = getMasterSpecification();

        if (!master || typeof master !== "object") {
            return null;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                master,
                key
            )
        ) {
            return master[key];
        }

        /*
         * Some master specifications may expose their sections
         * inside a specification object.
         */

        if (
            master.specification &&
            Object.prototype.hasOwnProperty.call(
                master.specification,
                key
            )
        ) {
            return master.specification[key];
        }

        if (
            master.SPECIFICATION &&
            Object.prototype.hasOwnProperty.call(
                master.SPECIFICATION,
                key
            )
        ) {
            return master.SPECIFICATION[key];
        }

        return null;
    }

    /*
     * ---------------------------------------------------------
     * STRUCTURAL PRESENCE CHECK
     * ---------------------------------------------------------
     */

    function hasUsableValue(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === "string") {
            return value.trim().length > 0;
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        if (typeof value === "object") {
            return Object.keys(value).length > 0;
        }

        return true;
    }

    /*
     * ---------------------------------------------------------
     * ALIGNMENT REPORT
     * ---------------------------------------------------------
     */

    function buildAlignmentReport() {
        var availability = getSourceAvailability();

        if (!availability.bridgeCanReadBoth) {
            return Object.freeze({
                bridgeVersion: BRIDGE_VERSION,
                status: ALIGNMENT_STATUS.NOT_AVAILABLE,
                specificationAlignmentOnly: true,
                implementationStatus: "NOT_EVALUATED",
                verifiedImplementation: false,
                sourceAvailability: availability,
                principles: [],
                summary: {
                    total: 0,
                    aligned: 0,
                    partial: 0,
                    unavailable: REQUIRED_PRINCIPLES.length
                }
            });
        }

        var results = [];
        var aligned = 0;
        var partial = 0;
        var unavailable = 0;

        for (
            var i = 0;
            i < REQUIRED_PRINCIPLES.length;
            i += 1
        ) {
            var requirement = REQUIRED_PRINCIPLES[i];

            var locked = findLockedSpecification(
                requirement.id
            );

            var master = findMasterSection(
                requirement.masterKey
            );

            var lockedPresent =
                hasUsableValue(locked);

            var masterPresent =
                hasUsableValue(master);

            var status;

            if (lockedPresent && masterPresent) {
                status = ALIGNMENT_STATUS.ALIGNED;
                aligned += 1;
            } else if (lockedPresent || masterPresent) {
                status = ALIGNMENT_STATUS.PARTIAL;
                partial += 1;
            } else {
                status = ALIGNMENT_STATUS.NOT_AVAILABLE;
                unavailable += 1;
            }

            results.push({
                id: requirement.id,
                name: requirement.name,
                lockedSpecificationPresent: lockedPresent,
                masterSpecificationSectionPresent: masterPresent,
                status: status
            });
        }

        var overallStatus =
            unavailable === 0 &&
            partial === 0
                ? ALIGNMENT_STATUS.ALIGNED
                : partial > 0 || aligned > 0
                    ? ALIGNMENT_STATUS.PARTIAL
                    : ALIGNMENT_STATUS.NOT_AVAILABLE;

        return Object.freeze({
            bridgeVersion: BRIDGE_VERSION,
            status: overallStatus,
            specificationAlignmentOnly: true,

            /*
             * This is deliberately NOT implementation status.
             */
            implementationStatus: "NOT_EVALUATED",
            verifiedImplementation: false,

            sourceAvailability: availability,

            principles: Object.freeze(results),

            summary: Object.freeze({
                total: REQUIRED_PRINCIPLES.length,
                aligned: aligned,
                partial: partial,
                unavailable: unavailable
            })
        });
    }

    /*
     * ---------------------------------------------------------
     * COMBINED READ-ONLY VIEW
     * ---------------------------------------------------------
     *
     * This provides a common read-only view while retaining both
     * source specifications separately.
     * ---------------------------------------------------------
     */

    function getCombinedSpecification() {
        var lockedAPI = getLockedSpecificationAPI();
        var masterAPI = getMasterSpecificationAPI();

        var locked =
            safeCall(
                lockedAPI,
                "getLockedSpecifications",
                null
            );

        var master =
            safeCall(
                masterAPI,
                "getSpecification",
                null
            );

        return Object.freeze({
            bridgeVersion: BRIDGE_VERSION,

            source: Object.freeze({
                lockedSpecification:
                    LOCKED_SPEC_API_NAME,

                masterSpecification:
                    MASTER_SPEC_API_NAME
            }),

            lockedSpecifications: locked,
            masterInclusionSpecification: master,

            alignment: buildAlignmentReport(),

            /*
             * Important:
             * This bridge does not change implementation state.
             */
            implementationState: "NOT_EVALUATED",
            verificationState: "NOT_EVALUATED"
        });
    }

    /*
     * ---------------------------------------------------------
     * READ-ONLY PUBLIC API
     * ---------------------------------------------------------
     */

    var API = Object.freeze({

        VERSION: BRIDGE_VERSION,

        ALIGNMENT_STATUS: ALIGNMENT_STATUS,

        REQUIRED_PRINCIPLES: REQUIRED_PRINCIPLES,

        getSourceAvailability:
            getSourceAvailability,

        getLockedSpecifications:
            getLockedSpecifications,

        getMasterSpecification:
            getMasterSpecification,

        getAlignmentReport:
            buildAlignmentReport,

        getCombinedSpecification:
            getCombinedSpecification,

        isReady: function () {
            var availability =
                getSourceAvailability();

            return availability.bridgeCanReadBoth;
        }
    });

    /*
     * ---------------------------------------------------------
     * EXPORT
     * ---------------------------------------------------------
     */

    global.PacificEducationSpecificationBridge = API;

    /*
     * CommonJS compatibility for controlled testing.
     */

    if (
        typeof module !== "undefined" &&
        module.exports
    ) {
        module.exports = API;
    }

})(typeof window !== "undefined" ? window : globalThis);
