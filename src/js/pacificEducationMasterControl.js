/*
 * =========================================================
 * PACIFIC EDUCATION
 * MASTER CONTROL
 * =========================================================
 *
 * Version: 1.0.10
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

    var MASTER_CONTROL_VERSION = "1.0.11";

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
                "../js/pacificEducationMasterInclusionSpecification.js",
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
                "js/pacificEducationAnnualGdpPricingEngine.js",
            status: STATUS.COMPLETE
        },

        pricingAuditGuard: {
            file:
                "js/pacificEducationPricingAuditGuard.js",
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
                "js/pacificEducationAssessmentBridge.js",
            status: STATUS.IN_PROGRESS
        },

        curriculumAlignment: {
            file:
                "js/pacificEducationCurriculumAlignmentRegistry.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Controlled registry for aligning daily learning and assessment activities to the official Fiji curriculum.",
            prototypeOnly: true,
            productionSecurityNote:
                "Official curriculum authority, versioning and sensitive controls must be validated and enforced server-side where required."
        },

        curriculumSourceData: {
            file:
                "js/pacificEducationCurriculumSourceVerification.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Verified source metadata and alignment evidence for Fiji curriculum resources.",
            prototypeOnly: true,
            validationNote:
                "Source data is not treated as official current achievement-indicator data until authorized current Ministry documents are validated."
        },

        curriculumAlignmentDataModel: {
            file:
                "src/js/pacificEducationCurriculumAlignmentDataModel.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Runtime contract and fail-closed validation layer connecting curriculum indicators to daily activities and assessments.",
            prototypeOnly: true,
            validationNote:
                "No achievement-indicator text is invented. Indicators remain pending until authorized current Ministry source validation."
        },

        curriculumAssessmentCoverageBridge: {
            file: "src/js/pacificEducationCurriculumAssessmentBridge.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Connects curriculum indicator validation, teacher evidence coverage, revision scheduling and exam scheduling; prototype only.",
            prototypeOnly: true,
            externalValidationRequired: true
        },

        curriculumAlignmentRuntimeBridge: {
            file:
                "src/js/pacificEducationCurriculumAlignmentRuntimeBridge.js",
            status: STATUS.IN_PROGRESS,
            purpose:
                "Connects curriculum records to daily activity validation without upgrading unverified source data.",
            prototypeOnly: true,
            externalValidationRequired: true
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
        },
        
        curriculumAlignmentNextStage: {
            file: "src/js/pacificEducationCurriculumAlignmentNextStage.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Locks curriculum alignment authority and achievement-indicator distribution rules for continued prototype work.",
            prototypeOnly: true,
            externalValidationRequired: true
        },

        calendarNextStage: {
            file: "src/js/pacificEducationCalendarNextStage.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Coordinates teacher Day 1 setup, redistribution, covered-indicator assessment timing and school calendar handling.",
            prototypeOnly: true,
            externalValidationRequired: true
        },

        accessibilityNextStage: {
            file: "src/js/pacificEducationAccessibilityNextStage.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Coordinates accessibility requirements including larger text, text-to-speech and usable interaction.",
            prototypeOnly: true,
            humanTestingRequired: true
        },

        safeguardingNextStage: {
            file: "src/js/pacificEducationSafeguardingNextStage.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Locks prototype safeguarding requirements and fail-closed production boundaries.",
            prototypeOnly: true,
            specialistReviewRequired: true
        },

        accessibilityRuntime: {
            file: "src/js/pacificEducationAccessibilityRuntime.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Prototype accessibility controls for text scaling, speech and accessible status announcements.",
            prototypeOnly: true,
            humanTestingRequired: true
        },

        offlineRuntime: {
            file: "src/js/pacificEducationOfflineRuntime.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Prototype offline progress queue and cached learning runtime.",
            prototypeOnly: true,
            realDeviceTestingRequired: true
        },

        offlineServiceWorker: {
            file: "src/service-worker.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Prototype cached learning fallback; never caches secrets or authorization state.",
            prototypeOnly: true,
            realDeviceTestingRequired: true
        },

        offlineNextStage: {
            file: "src/js/pacificEducationOfflineNextStage.js",
            status: STATUS.IN_PROGRESS,
            purpose: "Coordinates offline, cached and low-bandwidth learning behavior without treating client storage as secure.",
            prototypeOnly: true,
            realDeviceTestingRequired: true
        },

        testingNextStage: {
            file: "src/js/pacificEducationTestingNextStage.js",
            status: STATUS.TESTING,
            purpose: "Defines continued unit, integration, accessibility, fairness, security, recovery and independent testing requirements.",
            prototypeOnly: true,
            independentReviewRequired: true
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
            status: STATUS.IN_PROGRESS
        },

        safeguarding: {
            number: 10,
            status: STATUS.IN_PROGRESS
        },

        accessibility: {
            number: 11,
            status: STATUS.IN_PROGRESS
        },

        offline: {
            number: 12,
            status: STATUS.IN_PROGRESS
        },

        marketplace: {
            number: 13,
            status: STATUS.NOT_STARTED
        },

        payments: {
            number: 14,
            status: STATUS.NOT_STARTED
        },

        integrations: {
            number: 15,
            status: STATUS.NOT_STARTED
        },

        testing: {
            number: 16,
            status: STATUS.NOT_STARTED
        },

        securityReview: {
            number: 17,
            status: STATUS.NOT_STARTED
        },

        production: {
            number: 18,
            status: STATUS.NOT_STARTED
        },

        publication: {
            number: 19,
            status: STATUS.NOT_STARTED
        },

        productionBackendDataArchitecture: {
            number: 20,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — production implementation and independent verification required"
        },

        productionAuthenticationSecurity: {
            number: 21,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — production implementation and independent verification required"
        },

        productionHostingInfrastructure: {
            number: 22,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — production implementation and independent verification required"
        },

        cybersecurityPrivacyChildSafeguarding: {
            number: 23,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — production implementation, specialist review and independent verification required"
        },

        privacyDataGovernance: {
            number: 24,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — production implementation, legal/privacy review and independent verification required"
        },

        accessibilityLowBandwidthDeviceVerification: {
            number: 25,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — implementation, device testing and independent accessibility verification required"
        },

        fijiCurriculumSourceValidationAlignment: {
            number: 26,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — official-source verification, curriculum mapping and authorized review required"
        },

        controlledPilotUserTestingEvidence: {
            number: 27,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — controlled pilot execution, evidence collection and review required"
        },

        paymentVerificationOperationsBusinessControls: {
            number: 28,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — production payment implementation, operational controls and independent verification required"
        },

        finalProductionReadinessOwnerApproval: {
            number: 29,
            status: STATUS.IN_PROGRESS,
            contract: "DEFINED — final evidence review and explicit owner approval required"
        },

        productionReleaseGateControlledLaunch: {
            number: 30,
            status: STATUS.BLOCKED,
            contract: "DEFINED — actual production release remains blocked until all mandatory evidence and approvals are verified"
        },

        continuousGovernanceExtensions: {
            number: 31,
            status: STATUS.NOT_STARTED,
            conditional: true,
            activationRule: "Need-based only — no extension is required unless an objective need, material change, incident, risk, review finding, new requirement or owner-approved governance need is recorded.",
            noAutomaticTimeBasedExtension: true,
            stages: [31, 32, 33, 34, 35, 36],
            noNeedDecision: "NO_EXTENSION_REQUIRED",
            productionAuthority: "No extension stage grants production, legal or regulatory authority."
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
                "Curriculum Alignment Data Model"
        },

        {
            from:
                "Curriculum Alignment Data Model",
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
            from: "Full System Test Reconciliation Acknowledgement Verification Gate",
            to: "Owner Final Review"
        },

        {
            from: "Curriculum Alignment Next Stage",
            to: "Calendar Next Stage"
        },

        {
            from: "Calendar Next Stage",
            to: "Accessibility Next Stage"
        },

        {
            from: "Accessibility Next Stage",
            to: "Safeguarding Next Stage"
        },

        {
            from: "Safeguarding Next Stage",
            to: "Offline Next Stage"
        },

        {
            from: "Offline Next Stage",
            to: "Testing Next Stage"
        },

        {
            from: "Testing Next Stage",
            to: "Owner Final Review"
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

        "../js/pacificEducationMasterInclusionSpecification.js",

        "js/pacificEducationCoreBridge.js",

        "js/pacificEducationMasterControl.js",

        "js/pacificEducationAnnualGdpPricingEngine.js",

        "js/pacificEducationPricingAuditGuard.js",

        "js/pacificEducationCentralBridge.js",

        "js/pacificEducationEducationLinkBridge.js",

        "js/pacificEducationSecureLinkAuthorization.js",

        "js/pacificEducationAssessmentBridge.js",

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

        "js/pacificEducationCurriculumAlignmentDataModel.js",

        "js/pacificEducationCurriculumAlignmentRuntimeBridge.js",

        "js/pacificEducationCurriculumAlignmentNextStage.js",
        "js/pacificEducationCalendarNextStage.js",
        "js/pacificEducationAccessibilityNextStage.js",

        "js/pacificEducationAccessibilityRuntime.js",

        "js/pacificEducationOfflineRuntime.js",
        "js/pacificEducationSafeguardingNextStage.js",
        "js/pacificEducationOfflineNextStage.js",
        "js/pacificEducationTestingNextStage.js",

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
     * PILOT -> PRODUCTION TRANSITION CONTROLLER
     * =======================================================
     *
     * The pilot end date may be evaluated automatically, but the browser
     * can never promote itself to production. Automatic production approval
     * is allowed only when every required production condition is verified
     * AND an authorized server-side production authority confirms approval.
     * Client/localStorage evidence alone can never satisfy that authority.
     */

    var PILOT_TRANSITION = Object.freeze({
        startDate: "2026-09-21",
        endDate: "2026-10-21",
        releaseType: "controlled-prototype-pilot",
        automaticPilotClose: true,
        automaticProductionDecision: false,
        productionApprovalRequiresServerAuthority: true,
        productionAuthorityNote: "Production authority is server-side only.",
        failClosed: true
    });

    function evaluatePilotTransition(serverDecision) {
        var now = new Date();
        var end = new Date(PILOT_TRANSITION.endDate + "T23:59:59Z");
        var pilotClosed = now.getTime() > end.getTime();
        var registry = global.PacificEducationProductionRequirementRegistry;
        var summary = registry && typeof registry.summary === "function"
            ? registry.summary()
            : { totalRequired: 0, verified: 0, pending: 0, ready: false, productionEligible: false };
        var allRequirementsVerified = summary.totalRequired > 0 &&
            summary.verified === summary.totalRequired &&
            summary.pending === 0;

        /*
         * MANDATORY PACIFIC GUARDIAN PRODUCTION GATE:
         * Every recorded user comment requiring review must have a
         * server-verified, polite, needs-aligned, production-ready disposition.
         */
        var guardian = global.PacificEducationGuardian;
        var guardianGate = guardian && typeof guardian.productionGate === "function"
            ? guardian.productionGate()
            : { required: true, pendingCount: 1, ready: false, failClosed: true };
        var guardianReady = guardianGate.ready === true;
        /*
         * SECURITY BOUNDARY:
         * A caller-supplied object is never accepted as production authority.
         * Prototype/browser code cannot self-assert server authorization.
         * A future production backend must expose a server-authority verifier
         * that independently validates the decision before this gate can open.
         */
        var authorityVerifier = global.PacificEducationProductionServerAuthority;
        var serverAuthorized = false;
        if (
            authorityVerifier &&
            typeof authorityVerifier.verifyProductionApproval === "function"
        ) {
            try {
                serverAuthorized = authorityVerifier.verifyProductionApproval(
                    serverDecision
                ) === true;
            } catch (_) {
                serverAuthorized = false;
            }
        }
        var approved = pilotClosed &&
            allRequirementsVerified &&
            guardianReady &&
            serverAuthorized;
        var decision = approved ? "PRODUCTION_APPROVED" : "BLOCKED";

        return Object.freeze({
            pilotStart: PILOT_TRANSITION.startDate,
            pilotEnd: PILOT_TRANSITION.endDate,
            pilotClosed: pilotClosed,
            allRequirementsVerified: allRequirementsVerified,
            serverAuthorityConfirmed: serverAuthorized,
            guardianReviewRequired: true,
            guardianReviewReady: guardianReady,
            guardianPendingCount: guardianGate.pendingCount,
            decision: decision,
            productionApproved: approved,
            productionEligible: approved,
            failClosed: !approved,
            prototype: true,
            reason: approved
                ? "All required production conditions, mandatory Guardian review requirements, and authorized server-side approval are present."
                : "Production remains blocked until all required conditions, mandatory Guardian review requirements, and authorized server-side approval are present."
        });
    }

    function runAutomaticPilotTransition(serverDecision) {
        var result = evaluatePilotTransition(serverDecision);
        try {
            global.localStorage.setItem(
                "pacificEducationPilotTransitionStatus",
                JSON.stringify({
                    pilotClosed: result.pilotClosed,
                    decision: result.decision,
                    productionApproved: result.productionApproved,
                    productionEligible: result.productionEligible,
                    failClosed: result.failClosed,
                    evaluatedAt: new Date().toISOString()
                })
            );
        } catch (_) {}

        if (typeof global.dispatchEvent === "function" && typeof global.CustomEvent === "function") {
            global.dispatchEvent(new CustomEvent("pacificEducationPilotTransitionEvaluated", {
                detail: result
            }));
        }
        return result;
    }

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
        },

        pilotTransition: PILOT_TRANSITION,

        evaluatePilotTransition: evaluatePilotTransition,

        runAutomaticPilotTransition: runAutomaticPilotTransition
    });

    /*
     * =======================================================
     * REGISTER MASTER CONTROL
     * =======================================================
     */

    global.PacificEducationMasterControl = api;

    /* Evaluate after the page has finished loading its remaining gate modules. */
    if (typeof global.setTimeout === "function") {
        global.setTimeout(function () {
            runAutomaticPilotTransition();
        }, 0);
    } else {
        runAutomaticPilotTransition();
    }

    /* Re-evaluate when a production requirement record changes. */
    if (global.document && typeof global.document.addEventListener === "function") {
        global.document.addEventListener(
            "pacificEducationProductionRequirementChanged",
            function () {
                runAutomaticPilotTransition();
            }
        );
    }

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
