/*
 * =========================================================
 * PACIFIC EDUCATION
 * MASTER CONTROL
 * =========================================================
 *
 * Version: 1.0.5
 *
 * Purpose:
 * Central coordination registry for Pacific Education.
 *
 * IMPORTANT:
 * - This is a coordination registry.
 * - It is NOT a production security boundary.
 * - Production authorization must remain server-side.
 * - Production payment verification must remain server-side.
 * - Owner approval is required before production publication.
 * =========================================================
 */

(function (global) {
    "use strict";

    var MASTER_CONTROL_VERSION = "1.0.5";

    /*
     * =======================================================
     * PROJECT
     * =======================================================
     */

    var PROJECT = Object.freeze({
        name: "Pacific Education",
        ownerControlled: true,
        prototypeFirst: true,
        productionPublicationRequiresTesting: true,
        productionSecurityMustBeServerSide: true
    });

    /*
     * =======================================================
     * STATUS VALUES
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
     * MODULE REGISTRY
     * =======================================================
     */

    var MODULES = Object.freeze({

        masterInclusionSpecification: {
            file:
                "src/js/pacificEducationMasterInclusionSpecification.js",
            status: STATUS.COMPLETE
        },

        dailyLessons: {
            file: "js/dailyLessons.js",
            status: STATUS.COMPLETE
        },

        assessments: {
            file: "js/assessments.js",
            status: STATUS.COMPLETE
        },

        dashboards: {
            file: "js/dashboards.js",
            status: STATUS.COMPLETE
        },

        buyPlans: {
            file: "js/buyPlans.js",
            status: STATUS.COMPLETE
        },

        annualGdpPricingEngine: {
            file:
                "src/js/pacificEducationAnnualGdpPricingEngine.js",
            status: STATUS.COMPLETE
        },

        pricingAuditGuard: {
            file:
                "src/js/pacificEducationPricingAuditGuard.js",
            status: STATUS.COMPLETE
        },

        educationLinkBridge: {
            file:
                "js/pacificEducationEducationLinkBridge.js",
            status: STATUS.COMPLETE
        },

        secureLinkAuthorization: {
            file:
                "js/pacificEducationSecureLinkAuthorization.js",
            status: STATUS.COMPLETE
        },

        assessmentBridge: {
            file:
                "src/js/pacificEducationAssessmentBridge.js",
            status: STATUS.IN_PROGRESS
        },

        curriculumAlignment: {
            file:
                "src/js/pacificEducationCurriculumAlignment.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Controlled registry for aligning daily learning and assessment activities to the official Fiji curriculum.",
            prototypeOnly: true,
            productionSecurityNote:
                "Official curriculum authority, versioning and sensitive controls must be validated and enforced server-side where required."
        },

        curriculumSourceData: {
            file:
                "src/js/pacificEducationCurriculumSourceData.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Verified source metadata and alignment evidence for Fiji curriculum resources.",
            prototypeOnly: true,
            validationNote:
                "Source data is not treated as official current achievement-indicator data until authorized current Ministry documents are validated."
        },

        centralBridge: {
            file:
                "src/js/pacificEducationCentralBridge.js",
            status: STATUS.COMPLETE,

            purpose:
                "Central coordination bridge for system health, recovery, communication and controlled reconnection.",

            prototypeOnly: true,

            productionSecurityNote:
                "Production security and authorization remain server-side."
        },

        centralBridgeRecoveryAuditIntegrityTest: {
            file:
                "../pacificEducationCentralBridgeRecoveryAuditIntegrityTest.js",

            status: STATUS.COMPLETE,

            purpose:
                "Test-only verification of Central Bridge recovery history, audit integrity, failure linkage and recovery traceability.",

            testResult:
                "45/45 tests passed",

            prototypeOnly: true,

            productionSecurityNote:
                "This test is not a production security boundary."
        },

        application: {
            file: "src/index.html",
            status: STATUS.COMPLETE
        },

        prototypeRuntimeDiagnostics: {
            file: "src/js/pacificEducationPrototypeRuntimeDiagnostics.js",
            status: STATUS.TESTING,
            purpose: "Owner-visible prototype capability diagnostics; never grants production authorization.",
            prototypeOnly: true
        },

        ownerPrototypeTestChecklist: {
            file: "src/js/pacificEducationOwnerPrototypeTestChecklist.js",
            status: STATUS.TESTING,
            purpose: "Owner-entered and automatically detected prototype test evidence.",
            prototypeOnly: true
        },

        fullSystemTestReconciliationVerificationGate: {
            file: "src/js/pacificEducationFullSystemTestReconciliationVerificationGate.js",
            status: STATUS.TESTING,
            purpose: "Fail-closed verification of the full-system test reconciliation record.",
            prototypeOnly: true
        },

        fullSystemTestReconciliationAcknowledgement: {
            file: "src/js/pacificEducationFullSystemTestReconciliationAcknowledgement.js",
            status: STATUS.TESTING,
            purpose: "Records acknowledgement of the latest full-system test reconciliation; never grants production authority.",
            prototypeOnly: true
        },

        fullSystemTestReconciliationAcknowledgementVerificationGate: {
            file: "src/js/pacificEducationFullSystemTestReconciliationAcknowledgementVerificationGate.js",
            status: STATUS.TESTING,
            purpose: "Fail-closed verification that the latest full-system test reconciliation acknowledgement matches the latest reconciliation.",
            prototypeOnly: true
        },

        fullSystemTestReconciliationRecord: {
            file: "src/js/pacificEducationFullSystemTestReconciliationRecord.js",
            status: STATUS.TESTING,
            purpose: "Records full-system test reconciliation after independent verification of test evidence and final reconciliation gates.",
            prototypeOnly: true
        },

        fullSystemTestVerificationGate: {
            file: "src/js/pacificEducationFullSystemTestVerificationGate.js",
            status: STATUS.TESTING,
            purpose: "Fail-closed verification of complete full-system test evidence before reconciliation.",
            prototypeOnly: true
        },

        fullSystemTestEvidenceRecord: {
            file: "src/js/pacificEducationFullSystemTestEvidenceRecord.js",
            status: STATUS.TESTING,
            purpose: "Records evidence and reviewer references for each full-system test.",
            prototypeOnly: true
        },

        fullSystemTestMatrix: {
            file: "src/js/pacificEducationFullSystemTestMatrix.js",
            status: STATUS.TESTING,
            purpose: "Records full-system test evidence across functional, curriculum, accessibility, safeguarding, security, pricing, payment, recovery and release-control areas.",
            prototypeOnly: true
        },

        fullSystemTestingController: {
            file: "src/js/pacificEducationFullSystemTestingController.js",
            status: STATUS.TESTING,
            purpose: "Fail-closed controller that gates entry to full system testing from prototype evidence.",
            prototypeOnly: true
        },

        prototypeTestEvidenceBridge: {
            file: "src/js/pacificEducationPrototypeTestEvidenceBridge.js",
            status: STATUS.TESTING,
            purpose: "Feeds owner prototype test evidence into Full System Testing review without granting production authority.",
            prototypeOnly: true
        },

        ownerPrototypeTestSession: {
            file: "src/js/pacificEducationOwnerPrototypeTestSession.js",
            status: STATUS.TESTING,
            purpose: "Aggregated owner prototype test-session evidence package.",
            prototypeOnly: true
        }
    });

    /*
     * =======================================================
     * DEVELOPMENT STAGES
     * =======================================================
     */

    var STAGES = Object.freeze({

        foundation: {
            number: 1,
            status: STATUS.COMPLETE
        },

        dailyLearning: {
            number: 2,
            status: STATUS.COMPLETE
        },

        assessments: {
            number: 3,
            status: STATUS.COMPLETE
        },

        dashboards: {
            number: 4,
            status: STATUS.COMPLETE
        },

        pricing: {
            number: 5,
            status: STATUS.IN_PROGRESS
        },

        relationships: {
            number: 6,
            status: STATUS.COMPLETE
        },

        authorization: {
            number: 7,
            status: STATUS.COMPLETE
        },

        curriculumAlignment: {
            number: 8,
            status: STATUS.IN_PROGRESS
        },

        calendar: {
            number: 9,
            status: STATUS.NOT_STARTED
        },

        safeguarding: {
            number: 10,
            status: STATUS.NOT_STARTED
        },

        accessibility: {
            number: 11,
            status: STATUS.NOT_STARTED
        },

        marketplace: {
            number: 12,
            status: STATUS.NOT_STARTED
        },

        payments: {
            number: 13,
            status: STATUS.NOT_STARTED
        },

        integrations: {
            number: 14,
            status: STATUS.NOT_STARTED
        },

        testing: {
            number: 15,
            status: STATUS.NOT_STARTED
        },

        securityReview: {
            number: 16,
            status: STATUS.NOT_STARTED
        },

        production: {
            number: 17,
            status: STATUS.NOT_STARTED
        },

        publication: {
            number: 18,
            status: STATUS.NOT_STARTED
        }
    });

    /*
     * =======================================================
     * CONNECTION REGISTRY
     * =======================================================
     */

    var CONNECTIONS = Object.freeze([

        {
            from:
                "Master Inclusion Specification",
            to:
                "Application Modules"
        },

        {
            from:
                "Annual GDP Pricing Engine",
            to:
                "Pricing Audit Guard"
        },

        {
            from:
                "Pricing Audit Guard",
            to:
                "Buy Plans"
        },

        {
            from:
                "Education Link Bridge",
            to:
                "Secure Link Authorization"
        },

        {
            from:
                "Assessments",
            to:
                "Dashboards"
        },

        {
            from:
                "Daily Lessons",
            to:
                "Assessments"
        },

        {
            from:
                "Official Fiji Curriculum",
            to:
                "Curriculum Alignment Registry"
        },

        {
            from:
                "Curriculum Alignment Registry",
            to:
                "Daily Lessons and Assessments"
        },

        {
            from:
                "Central Bridge",
            to:
                "Central Bridge Recovery Audit Integrity Test"
        },

        {
            from:
                "Central Bridge Recovery Audit Integrity Test",
            to:
                "Full System Test Matrix"
        },

        {
            from:
                "Full System Test Matrix",
            to:
                "Full System Testing Evidence Record"
        },

        {
            from:
                "Full System Testing Evidence Record",
            to:
                "Full System Test Verification Gate"
        },

        {
            from:
                "Full System Test Verification Gate",
            to:
                "Full System Testing"
        },

        {
            from:
                "Prototype Runtime Diagnostics",
            to:
                "Owner Prototype Test Checklist"
        },

        {
            from:
                "Owner Prototype Test Checklist",
            to:
                "Owner Prototype Test Session"
        },

        {
            from:
                "Owner Prototype Test Session",
            to:
                "Prototype Test Evidence Bridge"
        },

        {
            from:
                "Prototype Test Evidence Bridge",
            to:
                "Full System Testing Controller"
        },

        {
            from:
                "Full System Testing Controller",
            to:
                "Full System Testing"
        },

        {
            from:
                "Full System Test Reconciliation Record",
            to:
                "Full System Test Reconciliation Verification Gate"
        },

        {
            from:
                "Full System Test Reconciliation Verification Gate",
            to:
                "Full System Test Reconciliation Acknowledgement"
        },

        {
            from:
                "Full System Test Reconciliation Acknowledgement",
            to:
                "Full System Test Reconciliation Acknowledgement Verification Gate"
        },

        {
            from:
                "Full System Test Reconciliation Acknowledgement Verification Gate",
            to:
                "Owner Final Review"
        },

        {
            from:
                "Application",
            to:
                "All Approved Modules"
        }
    ]);

    /*
     * =======================================================
     * APPROVED SCRIPT LOAD ORDER
     * =======================================================
     *
     * Registry entry does not itself load files.
     * Actual application loading remains controlled by
     * the approved application script configuration.
     * =======================================================
     */

    var SCRIPT_LOAD_ORDER = Object.freeze([

        "../js/pacificEducationCore.js",

        "src/js/pacificEducationMasterInclusionSpecification.js",

        "js/pacificEducationCoreBridge.js",

        "js/pacificEducationMasterControl.js",

        "js/pacificEducationAnnualGdpPricingEngine.js",

        "js/pacificEducationPricingAuditGuard.js",

        "js/pacificEducationCentralBridge.js",

        "js/pacificEducationEducationLinkBridge.js",

        "js/pacificEducationSecureLinkAuthorization.js",

        "src/js/pacificEducationAssessmentBridge.js",

        "../js/pacificEducationAssessmentIntegration.js",

        "../js/dailyLessons.js",

        "../js/assessments.js",

        "../js/dashboards.js",

        "js/buyPlans.js",

        "js/pacificEducationPrototypeRuntimeDiagnostics.js",

        "js/pacificEducationOwnerPrototypeTestChecklist.js",

        "js/pacificEducationOwnerPrototypeTestSession.js",

        "js/pacificEducationPrototypeTestEvidenceBridge.js",

        "js/pacificEducationFullSystemTestingController.js",

        "js/pacificEducationFullSystemTestMatrix.js",

        "js/pacificEducationFullSystemTestEvidenceRecord.js",

        "js/pacificEducationFullSystemTestVerificationGate.js",

        "js/pacificEducationFullSystemTestReconciliationRecord.js",

        "js/pacificEducationFullSystemTestReconciliationVerificationGate.js",

        "js/pacificEducationFullSystemTestReconciliationAcknowledgement.js",

        "js/pacificEducationFullSystemTestReconciliationAcknowledgementVerificationGate.js",

        "js/app.js"
    ]);

    /*
     * =======================================================
     * PUBLICATION GATES
     * =======================================================
     */

    var PUBLICATION_GATES = Object.freeze([

        "all required modules exist",

        "all connections tested",

        "Central Bridge recovery/audit/failure-linkage tests completed and reviewed",

        "no production secrets browser-side",

        "production authorization server-side",

        "payment verification server-side",

        "curriculum authority rules implemented",

        "safeguarding implemented",

        "accessibility tested",

        "assessment fairness tested",

        "pricing sources verified",

        "audit controls tested",

        "security/loophole testing completed",

        "rollback/recovery exists",

        "owner approval recorded"
    ]);

    /*
     * =======================================================
     * PUBLIC API
     * =======================================================
     */

    var api = Object.freeze({

        version:
            MASTER_CONTROL_VERSION,

        VERSION:
            MASTER_CONTROL_VERSION,

        project:
            PROJECT,

        status:
            STATUS,

        modules:
            MODULES,

        stages:
            STAGES,

        connections:
            CONNECTIONS,

        scriptLoadOrder:
            SCRIPT_LOAD_ORDER,

        publicationGates:
            PUBLICATION_GATES,

        getModule: function (name) {
            return MODULES[name] || null;
        },

        getStage: function (name) {
            return STAGES[name] || null;
        },

        getProject: function () {
            return PROJECT;
        },

        getConnections: function () {
            return CONNECTIONS;
        },

        getScriptLoadOrder: function () {
            return SCRIPT_LOAD_ORDER;
        },

        getPublicationGates: function () {
            return PUBLICATION_GATES;
        }
    });

    /*
     * =======================================================
     * REGISTER MASTER CONTROL
     * =======================================================
     */

    global.PacificEducationMasterControl = api;

    /*
     * =======================================================
     * LOAD EVENT
     * =======================================================
     */

    if (
        typeof global.dispatchEvent === "function" &&
        typeof global.CustomEvent === "function"
    ) {
        global.dispatchEvent(
            new CustomEvent(
                "pacificEducationMasterControlLoaded",
                {
                    detail: {
                        version:
                            MASTER_CONTROL_VERSION,

                        ownerControlled:
                            PROJECT.ownerControlled,

                        prototypeFirst:
                            PROJECT.prototypeFirst
                    }
                }
            )
        );
    }

})(window);
