/*
 * =========================================================
 * PACIFIC EDUCATION
 * MASTER CONTROL
 * =========================================================
 *
 * File:
 * src/js/pacificEducationMasterControl.js
 *
 * Version: 1.0.2
 *
 * PURPOSE
 * -------
 * Central build registry for Pacific Education.
 *
 * This file records:
 * - project stages
 * - module locations
 * - dependencies
 * - connection order
 * - completion status
 * - prototype/production boundaries
 * - publication requirements
 *
 * IMPORTANT
 * ----------
 * This is a coordination and registry layer.
 * It is NOT a production security boundary.
 * =========================================================
 */

(function (global) {
    "use strict";

    var MASTER_CONTROL_VERSION = "1.0.2";

    var PROJECT = Object.freeze({
        name: "Pacific Education",
        ownerControlled: true,
        prototypeFirst: true,
        productionPublicationRequiresTesting: true,
        productionSecurityMustBeServerSide: true
    });

    /*
     * =======================================================
     * BUILD STATUS
     * =======================================================
     */

    var STATUS = Object.freeze({
        COMPLETE: "COMPLETE",
        IN_PROGRESS: "IN_PROGRESS",
        NOT_STARTED: "NOT_STARTED",
        TESTING: "TESTING",
        BLOCKED: "BLOCKED"
    });

    /*
     * =======================================================
     * CORE MODULE REGISTRY
     * =======================================================
     */

    var MODULES = Object.freeze({

        masterInclusionSpecification: {
            file:
                "js/pacificEducationMasterInclusionSpecification.js",
            status: STATUS.COMPLETE,
            purpose:
                "Central owner-controlled education, security, inclusion and business specification."
        },

        dailyLessons: {
            file: "js/dailyLessons.js",
            status: STATUS.COMPLETE,
            purpose:
                "Daily learning programme and lesson progression."
        },

        assessments: {
            file: "js/assessments.js",
            status: STATUS.COMPLETE,
            purpose:
                "Day 30 alphabet and Day 60 phonics assessment framework."
        },

        dashboards: {
            file: "js/dashboards.js",
            status: STATUS.COMPLETE,
            purpose:
                "Teacher, parent and student dashboard functions."
        },

        buyPlans: {
            file: "js/buyPlans.js",
            status: STATUS.COMPLETE,
            purpose:
                "Annual subscription plan presentation and pricing integration."
        },

        annualGdpPricingEngine: {
            file:
                "js/pacificEducationAnnualGdpPricingEngine.js",
            status: STATUS.COMPLETE,
            purpose:
                "Prototype annual GDP-based international pricing calculation."
        },

        pricingAuditGuard: {
            file:
                "js/pacificEducationPricingAuditGuard.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Verification and audit layer for pricing data and approval."
        },

        educationLinkBridge: {
            file:
                "js/pacificEducationEducationLinkBridge.js",
            status: STATUS.COMPLETE,
            purpose:
                "Prototype relationship and education-link model."
        },

        secureLinkAuthorization: {
            file:
                "js/pacificEducationSecureLinkAuthorization.js",
            status: STATUS.COMPLETE,
            purpose:
                "Prototype authorization and relationship permissions."
        },

        assessmentBridge: {
            file:
                "js/pacificEducationAssessmentBridge.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Connects assessment information with the wider platform."
        },

        /*
         * ---------------------------------------------------
         * CENTRAL BRIDGE
         * ---------------------------------------------------
         */

        centralBridge: {
            file:
                "js/pacificEducationCentralBridge.js",
            status: STATUS.COMPLETE,
            purpose:
                "Central coordination bridge for system health, recovery, communication and controlled reconnection. Prototype only; production security remains server-side."
        },

        centralBridgeRecoveryAuditIntegrityTest: {
            file:
                "../pacificEducationCentralBridgeRecoveryAuditIntegrityTest.js",
            status: STATUS.COMPLETE,
            purpose:
                "Test-only verification of Central Bridge recovery history, audit integrity, failure linkage and recovery traceability. 45/45 tests passed. Not a production security boundary."
        },

        application: {
            file: "js/app.js",
            status: STATUS.COMPLETE,
            purpose:
                "Main application behaviour and user interface coordination."
        }
    });

    /*
     * =======================================================
     * BUILD STAGES
     * =======================================================
     */

    var STAGES = Object.freeze({

        foundation: {
            number: 1,
            name: "Class 1 Foundation",
            status: STATUS.COMPLETE
        },

        dailyLearning: {
            number: 2,
            name: "Daily Learning",
            status: STATUS.COMPLETE
        },

        assessments: {
            number: 3,
            name: "Assessment System",
            status: STATUS.COMPLETE
        },

        dashboards: {
            number: 4,
            name: "Dashboards",
            status: STATUS.COMPLETE
        },

        pricing: {
            number: 5,
            name: "Annual Pricing",
            status: STATUS.IN_PROGRESS
        },

        relationships: {
            number: 6,
            name: "Education Relationships",
            status: STATUS.COMPLETE
        },

        authorization: {
            number: 7,
            name: "Secure Authorization",
            status: STATUS.COMPLETE
        },

        curriculumAlignment: {
            number: 8,
            name: "Curriculum Alignment",
            status: STATUS.NOT_STARTED
        },

        calendar: {
            number: 9,
            name: "School Calendar and Day Management",
            status: STATUS.NOT_STARTED
        },

        safeguarding: {
            number: 10,
            name: "Safeguarding and Assistance",
            status: STATUS.NOT_STARTED
        },

        accessibility: {
            number: 11,
            name: "Accessibility and Inclusion",
            status: STATUS.NOT_STARTED
        },

        marketplace: {
            number: 12,
            name: "Learner Marketplace",
            status: STATUS.NOT_STARTED
        },

        payments: {
            number: 13,
            name: "Secure Payment Integration",
            status: STATUS.NOT_STARTED
        },

        integrations: {
            number: 14,
            name: "External Education Integrations",
            status: STATUS.NOT_STARTED
        },

        testing: {
            number: 15,
            name: "Full System Testing",
            status: STATUS.NOT_STARTED
        },

        securityReview: {
            number: 16,
            name: "Security and Loophole Review",
            status: STATUS.NOT_STARTED
        },

        production: {
            number: 17,
            name: "Production Readiness",
            status: STATUS.NOT_STARTED
        },

        publication: {
            number: 18,
            name: "Final Publication",
            status: STATUS.NOT_STARTED
        }
    });

    /*
     * =======================================================
     * CONNECTION RULES
     * =======================================================
     */

    var CONNECTIONS = Object.freeze([
        {
            from: "Master Inclusion Specification",
            to: "Application Modules",
            purpose:
                "Provides the owner-controlled specification."
        },

        {
            from: "Annual GDP Pricing Engine",
            to: "Pricing Audit Guard",
            purpose:
                "Pricing calculations require verification and audit."
        },

        {
            from: "Pricing Audit Guard",
            to: "Buy Plans",
            purpose:
                "Only approved pricing should reach the plan display."
        },

        {
            from: "Education Link Bridge",
            to: "Secure Link Authorization",
            purpose:
                "A relationship link must not automatically grant information access."
        },

        {
            from: "Assessments",
            to: "Dashboards",
            purpose:
                "Authorized assessment results may inform dashboards."
        },

        {
            from: "Daily Lessons",
            to: "Assessments",
            purpose:
                "Assessment content must reflect covered learning."
        },

        /*
         * ---------------------------------------------------
         * CENTRAL BRIDGE TESTING CONNECTION
         * ---------------------------------------------------
         */

        {
            from: "Central Bridge",
            to: "Central Bridge Recovery Audit Integrity Test",
            purpose:
                "The Central Bridge recovery, audit and integrity behaviour must be tested against the registered Central Bridge implementation."
        },

        {
            from: "Central Bridge Recovery Audit Integrity Test",
            to: "Full System Testing",
            purpose:
                "Central Bridge recovery, audit integrity and failure-linkage tests must be completed and reviewed before full-system testing."
        },

        {
            from: "Application",
            to: "All Approved Modules",
            purpose:
                "Coordinates the user-facing application."
        }
    ]);

    /*
     * =======================================================
     * SCRIPT LOAD ORDER
     * =======================================================
     */

    var SCRIPT_LOAD_ORDER = Object.freeze([
        "pacificEducationMasterInclusionSpecification.js",
        "pacificEducationAnnualGdpPricingEngine.js",
        "pacificEducationPricingAuditGuard.js",
        "pacificEducationEducationLinkBridge.js",
        "pacificEducationSecureLinkAuthorization.js",
        "pacificEducationAssessmentBridge.js",

        /*
         * Central Bridge
         *
         * This registry entry does not by itself load the file.
         * Actual application loading must remain controlled by
         * the application's approved script configuration.
         */
        "pacificEducationCentralBridge.js",

        "dailyLessons.js",
        "assessments.js",
        "dashboards.js",
        "buyPlans.js",
        "app.js"
    ]);

    /*
     * =======================================================
     * PUBLICATION GATES
     * =======================================================
     */

    var PUBLICATION_GATES = Object.freeze([
        "All required modules exist.",

        "All required module connections are tested.",

        "Central Bridge recovery, audit integrity and failure-linkage tests are completed and reviewed.",

        "No production secrets exist in browser code.",

        "Production authorization is server-side.",

        "Payment verification is server-side.",

        "Curriculum authority rules are implemented.",

        "Safeguarding controls are implemented.",

        "Accessibility requirements are tested.",

        "Assessment fairness is tested.",

        "Pricing data sources are verified.",

        "Audit controls are tested.",

        "Security and loophole testing is completed.",

        "Rollback and recovery procedures exist.",

        "Owner approval is recorded before publication."
    ]);

    /*
     * =======================================================
     * CONTROL FUNCTIONS
     * =======================================================
     */

    function getProject() {
        return PROJECT;
    }

    function getModules() {
        return MODULES;
    }

    function getStages() {
        return STAGES;
    }

    function getConnections() {
        return CONNECTIONS;
    }

    function getScriptLoadOrder() {
        return SCRIPT_LOAD_ORDER;
    }

    function getPublicationGates() {
        return PUBLICATION_GATES;
    }

    function getStatus() {
        return {
            version: MASTER_CONTROL_VERSION,
            project: PROJECT,
            modules: MODULES,
            stages: STAGES
        };
    }

    /*
     * =======================================================
     * PUBLIC API
     * =======================================================
     */

    var api = {
        version: MASTER_CONTROL_VERSION,

        status: STATUS,

        project: PROJECT,

        modules: MODULES,

        stages: STAGES,

        connections: CONNECTIONS,

        scriptLoadOrder: SCRIPT_LOAD_ORDER,

        publicationGates: PUBLICATION_GATES,

        getProject: getProject,
        getModules: getModules,
        getStages: getStages,
        getConnections: getConnections,
        getScriptLoadOrder: getScriptLoadOrder,
        getPublicationGates: getPublicationGates,
        getStatus: getStatus
    };

    global.PacificEducationMasterControl = api;

})(window);
