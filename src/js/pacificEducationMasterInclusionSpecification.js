/*
 * =========================================================
 * PACIFIC EDUCATION
 * MASTER INCLUSION SPECIFICATION
 * =========================================================
 *
 * File:
 * src/js/pacificEducationMasterInclusionSpecification.js
 *
 * Version: 1.0.0
 *
 * PURPOSE
 * -------
 * Central owner-controlled registry for the major Pacific
 * Education requirements, principles, inclusion rules,
 * curriculum rules, pricing rules, safeguarding rules,
 * security boundaries and production requirements.
 *
 * IMPORTANT
 * ---------
 * This file is a specification/policy registry.
 * It is NOT a production security boundary.
 *
 * Production authorization, identity verification, payment
 * verification, curriculum authority, FEMIS integration,
 * audit protection and sensitive data controls must be
 * implemented and enforced server-side where required.
 *
 * =========================================================
 */

(function (global) {
    "use strict";

    var SPECIFICATION_VERSION = "1.0.0";
    var SPECIFICATION_ID =
        "PACIFIC_EDUCATION_MASTER_INCLUSION_SPECIFICATION";

    /*
     * =======================================================
     * OWNER CONTROL
     * =======================================================
     */

    var OWNER_CONTROL = Object.freeze({
        specificationId: SPECIFICATION_ID,
        version: SPECIFICATION_VERSION,

        ownerControlled: true,
        lockedSpecification: true,

        ownershipPrinciple:
            "Pacific Education remains the property of its owner.",

        noAutomaticPartnershipOwnership: true,
        noAutomaticEquity: true,
        noAutomaticShares: true,
        noAutomaticControlTransfer: true,

        partnerSupportMayInclude: Object.freeze([
            "resources",
            "technical support",
            "support services",
            "infrastructure",
            "distribution",
            "funding"
        ]),

        partnerSupportDoesNotAutomaticallyCreateOwnership:
            true,

        profitDistributionMayBeSeparatelyAgreed:
            true,

        platformOwnershipTransferRequiresSeparateLawfulAgreement:
            true,

        materialSpecificationChangesRequireOwnerControl:
            true,

        unauthorizedSpecificationChangesMustBeDetected:
            true
    });

    /*
     * =======================================================
     * FOUNDATIONAL PRINCIPLES
     * =======================================================
     */

    var FOUNDATIONAL_PRINCIPLES = Object.freeze([
        "Fairness and Justice",
        "Education quality must not depend on the price paid.",
        "Accessibility must not depend on the price paid.",
        "Safeguarding must not depend on the price paid.",
        "Student rights must not depend on the price paid.",
        "Curriculum standards must not depend on the price paid.",
        "Assessment fairness must not depend on the price paid.",
        "Inclusive education for different abilities and circumstances.",
        "Minimum necessary information should be used.",
        "Sensitive information must receive appropriate protection.",
        "Link availability never means information access.",
        "Production security must not depend on browser code.",
        "Material changes require controlled review."
    ]);

    /*
     * =======================================================
     * EDUCATION STRUCTURE
     * =======================================================
     */

    var EDUCATION_STRUCTURE = Object.freeze({
        class1Prototype: true,

        educationRange: Object.freeze([
            "Kindergarten",
            "Class 1",
            "Class 2",
            "Class 3",
            "Class 4",
            "Class 5",
            "Class 6",
            "Form 1",
            "Form 2",
            "Form 3",
            "Form 4",
            "Form 5",
            "Form 6",
            "Form 7"
        ]),

        earlyLearningProgramme:
            "My First English Puzzle",

        earlyLearningAgeRange:
            "Birth to approximately 4 years",

        earlyLearningAnnualActivityTarget:
            "365 or 366 activities where appropriate",

        weekendsIncluded: true,

        pacificCultureAndMannersIncluded: true,

        standardEnglishTransitionTarget:
            "Around Class 3, while remaining aligned with the applicable curriculum.",

        realLifeLearning: true,

        inclusiveAbilityAdaptation: true,

        environmentAwareActivities: true,

        cultureAndCommunityContext: true
    });

    /*
     * =======================================================
     * CURRICULUM AUTHORITY
     * =======================================================
     */

    var CURRICULUM_POLICY = Object.freeze({
        ministryOfficialCurriculumIsAuthoritative: true,

        platformReplacesMinistryCurriculum: false,

        platformMayAlignWithOfficialCurriculum: true,

        preferredLanguageSupport:
            "The platform should support the official/preferred language requirements applicable to the jurisdiction.",

        coreLanguageMustBeSupportedWhereRequired: true,

        curriculumChangesRequireAuthorizedPublishedChange: true,

        curriculumChangeShouldRecord: Object.freeze([
            "jurisdiction",
            "curriculumVersion",
            "source",
            "effectiveDate",
            "authorizedChange"
        ]),

        platformCannotUnilaterallyChangeOfficialCurriculum: true,

        officialCountryInformationMayBeDisplayed: true,

        displayingOfficialCountryInformationDoesNotChangeCurriculum:
            true,

        teacherCurriculumRequestsMustPassThroughAlignmentProcess:
            true,

        curriculumAlignmentEngineRequired: true
    });

    /*
     * =======================================================
     * CALENDAR POLICY
     * =======================================================
     */

    var CALENDAR_POLICY = Object.freeze({
        authorizedSchoolCalendar: true,

        day1MustBeExplicitlyEstablished: true,

        day1MayBeEnteredByAuthorizedTeacherOrMinistry:
            true,

        schoolDaysMustBeDistinguishedFromHomeLearningDays:
            true,

        weekendsMustBeDistinguished: true,

        holidaysMustBeDistinguished: true,

        closuresMustBeDistinguished: true,

        nationalEventsMayBeIncluded: true,

        communityAndCulturalEventsMayBeIncluded: true,

        exampleEvents: Object.freeze([
            "Ratu Sukuna Day"
        ]),

        calendarDataMustNotSilentlyRewriteCurriculum:
            true
    });

    /*
     * =======================================================
     * DAILY LEARNING
     * =======================================================
     */

    var DAILY_LEARNING_POLICY = Object.freeze({
        dailyLearning: true,

        dailyLearningChecks: true,

        fiveMinutePractice: true,

        interventionThresholdPercent: 80,

        interventionBelowThreshold: true,

        adaptiveSupport: true,

        teacherDoesNotNeedToManuallyMarkEveryDailyCapability:
            true,

        dailyEvidenceMayInformTeacherDashboard: true,

        screenshotsOrOtherEvidenceMayInformCapability:
            true,

        evidenceMustBeHandledWithPrivacyControls:
            true,

        activitiesShouldAdaptWithoutChangingOfficialCurriculum:
            true,

        learningShouldContinueDuringReasonableEnvironmentalDisruption:
            true,

        offlineOrCachedFallbackRequired: true
    });

    /*
     * =======================================================
     * REAL-LIFE AND COMMUNITY LEARNING
     * =======================================================
     */

    var REAL_LIFE_LEARNING_POLICY = Object.freeze({
        realLifeActivities: true,

        cultureRelevantLearning: true,

        communityRelevantLearning: true,

        practicalLifeSkills: true,

        weatherAwareAdaptation: true,

        disasterAwareAdaptation: true,

        outageAwareAdaptation: true,

        learningShouldNotAutomaticallyStopBecauseOfWeather:
            true,

        learningShouldNotAutomaticallyStopBecauseOfDisaster:
            true,

        learningShouldNotAutomaticallyStopBecauseOfConnectivityLoss:
            true,

        cachedOrOfflineAlternativeShouldBeUsedWhenAvailable:
            true,

        verifiedLifeSkillsCertificates:
            true
    });

    /*
     * =======================================================
     * ASSESSMENT POLICY
     * =======================================================
     */

    var ASSESSMENT_POLICY = Object.freeze({
        day30AlphabetAssessment: true,

        day60PhonicsAssessment: true,

        assessmentIndicatorsMustBeDefined: true,

        assessmentShouldReflectCoveredLearning: true,

        examsMustUseCoveredIndicatorsOnly: true,

        examsMustNotIntroduceNewMaterial: true,

        learningFlowMayPauseDuringExaminations: true,

        assessmentFairnessRequired: true,

        accessibilityAdjustmentsRequiredWhereAppropriate: true,

        studentIdentityReferenceMayInclude: Object.freeze([
            "authorized student identifier",
            "FEMIS identifier where lawfully and technically available",
            "other approved education identifier"
        ]),

        identityLinkageRequiresAuthorization: true,

        identityLinkageRequiresDataMinimization: true
    });

    /*
     * =======================================================
     * DASHBOARDS
     * =======================================================
     */

    var DASHBOARD_POLICY = Object.freeze({
        teacherDashboard: true,

        parentDashboard: true,

        studentLearningView: true,

        printableReports: true,

        teacherCapabilityInformation: true,

        parentResultsRequireTeacherRelease: true,

        classOnlyTeacherAccess: true,

        teacherMustOnlySeeAuthorizedStudents: true,

        parentMustOnlySeeAuthorizedChildInformation: true,

        dashboardDataMustRespectAuthorization:
            true
    });

    /*
     * =======================================================
     * ACCESS AND RELATIONSHIP MODEL
     * =======================================================
     */

    var ACCESS_POLICY = Object.freeze({
        securityFlow: Object.freeze([
            "Identity",
            "Role",
            "Verified Relationship",
            "Authorization",
            "Permission",
            "Communication"
        ]),

        linkAvailabilityNeverMeansInformationAccess:
            true,

        supportedRelationshipTypes: Object.freeze([
            "Student ↔ Teacher",
            "Parent ↔ Student",
            "Parent ↔ Teacher",
            "Teacher/School ↔ Ministry",
            "Parent/Student ↔ Ministry"
        ]),

        classOnlyTeacherAccess: true,

        parentResultReleaseRequired: true,

        parentCannotAutomaticallyAccessUnreleasedResults:
            true,

        authorizationMustBeVerifiedBeforeSensitiveAccess:
            true,

        revocationRequired: true,

        productionAuthorizationMustBeServerSide: true,

        localStorageIsNotSecurityBoundary: true,

        credentialsMustNotBeStoredInThisSpecification:
            true
    });

    /*
     * =======================================================
     * SAFEGUARDING
     * =======================================================
     */

    var SAFEGUARDING_POLICY = Object.freeze({
        childSafeguardingRequired: true,

        homeLearningSupportRequired: true,

        nearestLocalAssistanceProviderWhereAvailable:
            true,

        possibleAssistanceProviders: Object.freeze([
            "school",
            "teacher",
            "government service",
            "approved NGO",
            "community support",
            "child-support worker"
        ]),

        minimumInformationPrinciple: true,

        consentControls: true,

        noExactChildLocationExposure: true,

        exactLocationMustNotBeDisplayedByDefault: true,

        suspiciousActivityLayeredResponse: true,

        suspiciousActivityDoesNotAutomaticallyMeanPermanentLockout:
            true,

        additionalVerificationMayBeRequired: true,

        safeguardingEscalationMustBeAppropriate:
            true
    });

    /*
     * =======================================================
     * ACCESSIBILITY AND INCLUSION
     * =======================================================
     */

    var INCLUSION_POLICY = Object.freeze({
        inclusiveEducation: true,

        differentLearningAbilitiesSupported: true,

        adaptiveActivities: true,

        accessibilitySupport: true,

        largerTextSupport: true,

        textToSpeechSupport: true,

        alternativeLearningPathwaysWhereAppropriate: true,

        accessibilityMustNotReduceEducationRights: true,

        accessibilityMustNotCreateAutomaticAcademicPenalty:
            true,

        accessibilityEvidenceMustBeHandledFairly: true,

        uncertainEvidenceMustNotAutomaticallyBeTreatedAsDishonest:
            true
    });

    /*
     * =======================================================
     * PRICING
     * =======================================================
     */

    var PRICING_POLICY = Object.freeze({
        annualPlans: true,

        fijiCurrency: "FJD",

        fijiPricingIsOwnerControlled: true,

        fijiPlans: Object.freeze({
            student: Object.freeze({
                amount: 1,
                currency: "FJD",
                period: "year"
            }),

            individual: Object.freeze({
                amount: 10,
                currency: "FJD",
                period: "year"
            }),

            parent: Object.freeze({
                amount: 10,
                currency: "FJD",
                period: "year"
            }),

            organization: Object.freeze({
                amount: 100,
                currency: "FJD",
                period: "year"
            })
        }),

        internationalPricing: Object.freeze({
            annual: true,
            gdpBased: true,
            nationalCurrencyPreferred: true,
            inventedMultipliersForbidden: true,
            verifiedDataRequired: true
        }),

        priceMustNotChangeEducationQuality: true,

        pricingDataMustNotOverrideSafeguarding: true,

        pricingDataMustNotOverrideCurriculum: true
    });

    /*
     * =======================================================
     * GDP PRICING ENGINE BOUNDARY
     * =======================================================
     */

    var GDP_PRICING_POLICY = Object.freeze({
        enginePurpose:
            "Prototype annual international pricing calculation.",

        liveGDPDataMustBeVerified: true,

        liveExchangeRatesMustBeVerified: true,

        clientMustNotInventGDPData: true,

        clientMustNotInventExchangeRates: true,

        unavailableDataMustNotBePresentedAsVerified: true,

        productionGDPDataShouldBeServerSide: true,

        productionExchangeRateDataShouldBeServerSide: true,

        pricingAuthorizationShouldBeServerSide: true,

        lastVerifiedPriceMayBeUsedAccordingToApprovedPolicy:
            true,

        auditTrailRequired: true
    });

    /*
     * =======================================================
     * PAYMENT POLICY
     * =======================================================
     */

    var PAYMENT_POLICY = Object.freeze({
        onlinePaymentsSupported: true,

        offlinePaymentsSupported: true,

        possibleOfflineChannels: Object.freeze([
            "bank deposit",
            "approved cash collection",
            "approved school or agent collection",
            "owner-approved local payment channel"
        ]),

        paymentRequestDoesNotEqualPaymentConfirmation:
            true,

        paymentConfirmationMustBeVerified: true,

        productionPaymentVerificationMustBeServerSide:
            true,

        browserMustNotContainPaymentSecrets: true,

        browserMustNotContainProviderSecrets: true,

        passwordsMustNotBeStoredInClientCode: true,

        cardCredentialsMustNotBeStoredInClientCode: true,

        bankCredentialsMustNotBeStoredInClientCode: true,

        platformMustNotHoldCustomerFunds: true,

        walletFunctionNotAutomaticallyIncluded: true,

        escrowFunctionNotAutomaticallyIncluded: true
    });

    /*
     * =======================================================
     * MARKETPLACE / LEARNER WORK
     * =======================================================
     */

    var MARKETPLACE_POLICY = Object.freeze({
        learnerEffortFirst: true,

        AIMayAssist: true,

        originalLearnerEffortMayBeEligibleForMarketplace:
            true,

        freehandDrawingEncouraged: true,

        drawingMayBeCreatedInAppOrOnPaper: true,

        appropriateEvidenceMayBeCapturedWhereTechnicallyPossible:
            true,

        tracedWorkNonMarketableByDefault: true,

        copiedWorkNonMarketableByDefault: true,

        publishedElsewhereWorkNonMarketableByDefault: true,

        originalityDetectionRequired: true,

        originalityDetectionMustAccountForUncertainty: true,

        accessibilityMustBeConsideredWhenAssessingOriginality:
            true,

        AIAssistanceDoesNotAutomaticallyEqualCopying:
            true,

        marketplaceEligibilityRequiresSeparateControlledProcess:
            true
    });

    /*
     * =======================================================
     * INTEGRATIONS
     * =======================================================
     */

    var INTEGRATION_POLICY = Object.freeze({
        femisIntegrationTarget: true,

        ministryIntegrationTarget: true,

        approvedUniversityHubIntegrationTarget: true,

        educationHubRelationshipControls: true,

        integrationMustRespectAuthorization: true,

        integrationMustRespectDataMinimization: true,

        integrationMustNotAutomaticallyGrantPlatformOwnership:
            true
    });

    /*
     * =======================================================
     * SECURITY
     * =======================================================
     */

    var SECURITY_POLICY = Object.freeze({
        securityByDesign: true,

        authorizationByRoleAndRelationship: true,

        permissionChecksRequired: true,

        auditRequired: true,

        revocationRequired: true,

        sensitiveAccessMustBeLogged: true,

        localStorageNotSecurityBoundary: true,

        prototypeCodeMustNotBeTreatedAsProductionSecurity:
            true,

        productionSensitiveAuthorizationServerSide:
            true,

        credentialsExcludedFromClientSpecification:
            true,

        secretsExcludedFromClientSpecification:
            true,

        paymentSecretsExcluded: true,

        highImpactChangesRequireApproval: true,

        highImpactChangesRequireTesting: true,

        highImpactChangesRequireAudit: true,

        highImpactChangesRequireRollbackCapability:
            true,

        monthlyUpgradeTarget: true
    });

    /*
     * =======================================================
     * LOOPHOLE DETECTION
     * =======================================================
     */

    var LOOPHOLE_DETECTION_POLICY = Object.freeze({
        enabled: true,

        cycle: Object.freeze([
            "MODEL",
            "RED-TEAM",
            "DETECT",
            "VERIFY",
            "PATCH",
            "TEST"
        ]),

        securityReviewRequired: true,

        regressionTestingRequired: true,

        materialChangesShouldBeAudited: true
    });

    /*
     * =======================================================
     * OWNER TEST MODE
     * =======================================================
     */

    var OWNER_TEST_POLICY = Object.freeze({
        ownerTestMode: true,

        controlledTestingOnly: true,

        ownerTestDays: Object.freeze([
            64,
            65
        ]),

        testModeMustNotBePresentedAsProductionVerification:
            true,

        testModeMustNotBypassProductionAuthorization:
            true
    });

    /*
     * =======================================================
     * PRODUCTION BOUNDARIES
     * =======================================================
     */

    var PRODUCTION_BOUNDARIES = Object.freeze({
        serverSideRequired: Object.freeze([
            "identity verification",
            "authorization",
            "sensitive permission checks",
            "payment verification",
            "payment provider communication",
            "GDP data verification",
            "exchange-rate verification",
            "production pricing authorization",
            "FEMIS integration credentials",
            "Ministry integration credentials",
            "sensitive audit controls",
            "secret management"
        ]),

        clientSideMustNotBeTrustedFor: Object.freeze([
            "payment confirmation",
            "identity proof",
            "authorization proof",
            "administrator privilege",
            "financial verification",
            "secret storage"
        ]),

        prototypeLimitationsMustRemainVisible: true
    });

    /*
     * =======================================================
     * MODULE CONNECTIONS
     * =======================================================
     */

    var MODULE_CONNECTIONS = Object.freeze({
        index:
            "src/index.html",

        application:
            "src/js/app.js",

        assessments:
            "src/js/assessments.js",

        dashboards:
            "src/js/dashboards.js",

        pricing:
            "src/js/buyPlans.js",

        gdpPricing:
            "src/js/pacificEducationAnnualGdpPricingEngine.js",

        assessmentBridge:
            "src/js/pacificEducationAssessmentBridge.js",

        coreBridge:
            "src/js/pacificEducationCoreBridge.js",

        educationLinkBridge:
            "src/js/pacificEducationEducationLinkBridge.js",

        secureAuthorization:
            "src/js/pacificEducationSecureLinkAuthorization.js",

        verifiedRelationship:
            "src/js/pacificEducationVerifiedEducationRelationship.js",

        educationLinkStartup:
            "src/js/pacificEducationEducationLinkStartup.js",

        lockedSpecifications:
            "src/js/pacificEducationLockedSpecifications.js",

        masterInclusionSpecification:
            "src/js/pacificEducationMasterInclusionSpecification.js"
    });

    /*
     * =======================================================
     * OPEN PRODUCTION ITEMS
     * =======================================================
     */

    var OPEN_PRODUCTION_ITEMS = Object.freeze([
        "Production identity provider integration",
        "Production server-side authorization",
        "Production FEMIS integration approval and credentials",
        "Production Ministry integration approval and credentials",
        "Production payment-provider integration",
        "Production payment verification",
        "Production GDP data provider",
        "Production exchange-rate provider",
        "Production secure audit infrastructure",
        "Production privacy and data-retention rules",
        "Production legal review",
        "Production safeguarding review",
        "Production accessibility testing",
        "Production disaster recovery",
        "Production backup and rollback system",
        "Production penetration/security testing",
        "Production curriculum-source verification"
    ]);

    /*
     * =======================================================
     * COMPLETE SPECIFICATION
     * =======================================================
     */

    var SPECIFICATION = Object.freeze({
        specificationId: SPECIFICATION_ID,
        version: SPECIFICATION_VERSION,

        ownerControl: OWNER_CONTROL,

        foundationalPrinciples:
            FOUNDATIONAL_PRINCIPLES,

        educationStructure:
            EDUCATION_STRUCTURE,

        curriculumPolicy:
            CURRICULUM_POLICY,

        calendarPolicy:
            CALENDAR_POLICY,

        dailyLearningPolicy:
            DAILY_LEARNING_POLICY,

        realLifeLearningPolicy:
            REAL_LIFE_LEARNING_POLICY,

        assessmentPolicy:
            ASSESSMENT_POLICY,

        dashboardPolicy:
            DASHBOARD_POLICY,

        accessPolicy:
            ACCESS_POLICY,

        safeguardingPolicy:
            SAFEGUARDING_POLICY,

        inclusionPolicy:
            INCLUSION_POLICY,

        pricingPolicy:
            PRICING_POLICY,

        gdpPricingPolicy:
            GDP_PRICING_POLICY,

        paymentPolicy:
            PAYMENT_POLICY,

        marketplacePolicy:
            MARKETPLACE_POLICY,

        integrationPolicy:
            INTEGRATION_POLICY,

        securityPolicy:
            SECURITY_POLICY,

        loopholeDetectionPolicy:
            LOOPHOLE_DETECTION_POLICY,

        ownerTestPolicy:
            OWNER_TEST_POLICY,

        productionBoundaries:
            PRODUCTION_BOUNDARIES,

        moduleConnections:
            MODULE_CONNECTIONS,

        openProductionItems:
            OPEN_PRODUCTION_ITEMS
    });

    /*
     * =======================================================
     * PUBLIC API
     * =======================================================
     */

    var API = Object.freeze({

        getSpecification: function () {
            return SPECIFICATION;
        },

        getOwnerControl: function () {
            return OWNER_CONTROL;
        },

        getCurriculumPolicy: function () {
            return CURRICULUM_POLICY;
        },

        getPricingPolicy: function () {
            return PRICING_POLICY;
        },

        getPaymentPolicy: function () {
            return PAYMENT_POLICY;
        },

        getAccessPolicy: function () {
            return ACCESS_POLICY;
        },

        getSafeguardingPolicy: function () {
            return SAFEGUARDING_POLICY;
        },

        getInclusionPolicy: function () {
            return INCLUSION_POLICY;
        },

        getSecurityPolicy: function () {
            return SECURITY_POLICY;
        },

        getProductionBoundaries: function () {
            return PRODUCTION_BOUNDARIES;
        },

        getModuleConnections: function () {
            return MODULE_CONNECTIONS;
        },

        getOpenProductionItems: function () {
            return OPEN_PRODUCTION_ITEMS;
        },

        isLocked: function () {
            return OWNER_CONTROL.lockedSpecification === true;
        },

        getVersion: function () {
            return SPECIFICATION_VERSION;
        },

        getSpecificationId: function () {
            return SPECIFICATION_ID;
        }
    });

    /*
     * =======================================================
     * GLOBAL REGISTRATION
     * =======================================================
     */

    global.PacificEducationMasterInclusionSpecification = API;

    /*
     * Do not automatically modify other modules.
     * Connection will be performed only after verification.
     */

})(window);
