/*
 * Pacific Education — Adaptive Activity Engine
 * Version 1.0.0
 *
 * Stage 3
 *
 * Purpose:
 * Select and organise the next appropriate learning activity
 * according to demonstrated student capability, evidence,
 * learning needs and authorised curriculum requirements.
 *
 * Core principle:
 * "Same educational opportunity, different pathway
 *  according to demonstrated capability."
 *
 * Prototype boundary:
 * - Uses browser localStorage.
 * - NOT a production security boundary.
 * - Production identity, authorisation, curriculum authority,
 *   student records, safeguarding, AI analysis, photos, voice,
 *   payments and audit protection require secure server-side systems.
 */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    const STORAGE_KEY =
        "pacificEducationAdaptiveActivities";

    const PATHWAYS = Object.freeze({
        SUPPORT: "Support",
        CORE: "Core",
        EXTENSION: "Extension",
        ACCESSIBILITY: "Accessibility"
    });

    const CAPABILITY_STATUS = Object.freeze({
        DEMONSTRATED: "Demonstrated",
        DEVELOPING: "Developing",
        EMERGING: "Emerging",
        REQUIRES_PRACTICE: "Requires Practice",
        REQUIRES_SUPPORT: "Requires Support",
        INSUFFICIENT_EVIDENCE: "Insufficient Evidence",
        NOT_YET_INTRODUCED: "Not Yet Introduced"
    });

    const ACTIVITY_TYPES = Object.freeze({
        GUIDED_PRACTICE: "guided_practice",
        PRACTICE: "practice",
        EXTENSION: "extension",
        REAL_LIFE: "real_life_application",
        PROBLEM_SOLVING: "problem_solving",
        CREATIVE: "creative_activity",
        REASSESSMENT: "reassessment",
        ACCESSIBILITY: "accessibility_activity",
        INTRODUCTION: "introduction"
    });

    const ACTIVITY_STATUS = Object.freeze({
        RECOMMENDED: "Recommended",
        ASSIGNED: "Assigned",
        STARTED: "Started",
        COMPLETED: "Completed",
        REQUIRES_REVIEW: "Requires Review",
        REPLACED: "Replaced"
    });

    function now() {
        return new Date().toISOString();
    }

    function createId(prefix) {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 10)
        );
    }

    function safeRead() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    function safeWrite(data) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

            return true;
        } catch (error) {
            return false;
        }
    }

    function ensureStudent(data, studentId) {
        if (!studentId) {
            throw new Error("Student ID is required.");
        }

        if (!data[studentId]) {
            data[studentId] = {
                studentId: studentId,
                createdAt: now(),
                updatedAt: now(),
                activities: [],
                recommendations: [],
                audit: []
            };
        }

        return data[studentId];
    }

    function validateActivity(activity) {
        if (!activity || typeof activity !== "object") {
            throw new Error("Activity object is required.");
        }

        if (!activity.studentId) {
            throw new Error("Activity must contain studentId.");
        }

        if (!activity.activityTitle) {
            throw new Error("Activity title is required.");
        }

        if (!activity.pathway) {
            throw new Error("Activity pathway is required.");
        }

        if (
            !Object.values(PATHWAYS).includes(
                activity.pathway
            )
        ) {
            throw new Error("Unsupported activity pathway.");
        }

        if (!activity.type) {
            throw new Error("Activity type is required.");
        }

        if (
            !Object.values(ACTIVITY_TYPES).includes(
                activity.type
            )
        ) {
            throw new Error("Unsupported activity type.");
        }

        return true;
    }

    /*
     * Determine the learning pathway from demonstrated capability.
     *
     * This is deliberately based on current evidence/status,
     * not a permanent label attached to the child.
     */
    function determinePathway(capabilityStatus) {
        switch (capabilityStatus) {
            case CAPABILITY_STATUS.DEMONSTRATED:
                return PATHWAYS.EXTENSION;

            case CAPABILITY_STATUS.DEVELOPING:
                return PATHWAYS.CORE;

            case CAPABILITY_STATUS.EMERGING:
                return PATHWAYS.SUPPORT;

            case CAPABILITY_STATUS.REQUIRES_PRACTICE:
                return PATHWAYS.SUPPORT;

            case CAPABILITY_STATUS.REQUIRES_SUPPORT:
                return PATHWAYS.SUPPORT;

            case CAPABILITY_STATUS.NOT_YET_INTRODUCED:
                return PATHWAYS.CORE;

            case CAPABILITY_STATUS.INSUFFICIENT_EVIDENCE:
            default:
                return PATHWAYS.CORE;
        }
    }

    /*
     * Determine an appropriate activity type.
     */
    function determineActivityType(capabilityStatus) {
        switch (capabilityStatus) {
            case CAPABILITY_STATUS.DEMONSTRATED:
                return ACTIVITY_TYPES.EXTENSION;

            case CAPABILITY_STATUS.DEVELOPING:
                return ACTIVITY_TYPES.PRACTICE;

            case CAPABILITY_STATUS.EMERGING:
                return ACTIVITY_TYPES.GUIDED_PRACTICE;

            case CAPABILITY_STATUS.REQUIRES_PRACTICE:
                return ACTIVITY_TYPES.PRACTICE;

            case CAPABILITY_STATUS.REQUIRES_SUPPORT:
                return ACTIVITY_TYPES.GUIDED_PRACTICE;

            case CAPABILITY_STATUS.NOT_YET_INTRODUCED:
                return ACTIVITY_TYPES.INTRODUCTION;

            case CAPABILITY_STATUS.INSUFFICIENT_EVIDENCE:
            default:
                return ACTIVITY_TYPES.PRACTICE;
        }
    }

    /*
     * Create an individual activity recommendation.
     *
     * The curriculum objective remains unchanged.
     * Only the learning pathway changes.
     */
    function createRecommendation(options) {
        if (!options || !options.studentId) {
            throw new Error("Student ID is required.");
        }

        const capabilityStatus =
            options.capabilityStatus ||
            CAPABILITY_STATUS.INSUFFICIENT_EVIDENCE;

        const pathway =
            options.pathway ||
            determinePathway(capabilityStatus);

        const activityType =
            options.type ||
            determineActivityType(capabilityStatus);

        const recommendation = {
            recommendationId:
                options.recommendationId ||
                createId("recommendation"),

            studentId: options.studentId,

            subject:
                options.subject ||
                null,

            classLevel:
                options.classLevel ||
                null,

            age:
                options.age ||
                null,

            curriculumIndicator:
                options.curriculumIndicator ||
                null,

            skillId:
                options.skillId ||
                null,

            skillName:
                options.skillName ||
                null,

            capabilityStatus:
                capabilityStatus,

            pathway:
                pathway,

            type:
                activityType,

            activityTitle:
                options.activityTitle ||
                "Individual Learning Activity",

            instructions:
                options.instructions ||
                "",

            practice:
                options.practice ||
                "",

            expectedOutcome:
                options.expectedOutcome ||
                null,

            timeAllocation:
                options.timeAllocation ||
                null,

            supportReason:
                options.supportReason ||
                null,

            accessibilityAdjustment:
                options.accessibilityAdjustment ||
                null,

            extensionReason:
                options.extensionReason ||
                null,

            curriculumProtected:
                true,

            officialCurriculumReplacement:
                false,

            createdAt: now(),

            status:
                ACTIVITY_STATUS.RECOMMENDED
        };

        return Object.freeze(recommendation);
    }

    /*
     * Save a recommendation for the student.
     */
    function saveRecommendation(recommendation) {
        validateActivity(recommendation);

        const data = safeRead();

        const student =
            ensureStudent(
                data,
                recommendation.studentId
            );

        student.recommendations.push({
            ...recommendation
        });

        student.audit.push({
            auditId: createId("audit"),

            action:
                "ADAPTIVE_ACTIVITY_RECOMMENDED",

            studentId:
                recommendation.studentId,

            recommendationId:
                recommendation.recommendationId,

            pathway:
                recommendation.pathway,

            capabilityStatus:
                recommendation.capabilityStatus,

            createdAt: now()
        });

        student.updatedAt = now();

        if (!safeWrite(data)) {
            throw new Error(
                "Unable to save adaptive activity recommendation."
            );
        }

        return Object.freeze({
            ...recommendation
        });
    }

    /*
     * Recommend the next activity from a skill status.
     */
    function recommendNextActivity(options) {
        const recommendation =
            createRecommendation(options);

        return saveRecommendation(
            recommendation
        );
    }

    /*
     * Generate a support activity.
     */
    function createSupportActivity(options) {
        return recommendNextActivity({
            ...options,

            pathway:
                PATHWAYS.SUPPORT,

            type:
                options &&
                options.type
                    ? options.type
                    : ACTIVITY_TYPES.GUIDED_PRACTICE
        });
    }

    /*
     * Generate the normal/core activity.
     */
    function createCoreActivity(options) {
        return recommendNextActivity({
            ...options,

            pathway:
                PATHWAYS.CORE,

            type:
                options &&
                options.type
                    ? options.type
                    : ACTIVITY_TYPES.PRACTICE
        });
    }

    /*
     * Generate an extension activity.
     *
     * Extension does not automatically remove required
     * curriculum learning.
     */
    function createExtensionActivity(options) {
        return recommendNextActivity({
            ...options,

            pathway:
                PATHWAYS.EXTENSION,

            type:
                options &&
                options.type
                    ? options.type
                    : ACTIVITY_TYPES.EXTENSION
        });
    }

    /*
     * Generate an accessibility-adjusted activity.
     */
    function createAccessibilityActivity(options) {
        return recommendNextActivity({
            ...options,

            pathway:
                PATHWAYS.ACCESSIBILITY,

            type:
                options &&
                options.type
                    ? options.type
                    : ACTIVITY_TYPES.ACCESSIBILITY
        });
    }

    /*
     * Get all recommendations for a student.
     */
    function getRecommendations(studentId, filters) {
        const data = safeRead();

        const student = data[studentId];

        if (!student) {
            return [];
        }

        let recommendations = [
            ...student.recommendations
        ];

        if (filters && filters.subject) {
            recommendations =
                recommendations.filter(
                    item =>
                        item.subject ===
                        filters.subject
                );
        }

        if (filters && filters.skillId) {
            recommendations =
                recommendations.filter(
                    item =>
                        item.skillId ===
                        filters.skillId
                );
        }

        if (filters && filters.pathway) {
            recommendations =
                recommendations.filter(
                    item =>
                        item.pathway ===
                        filters.pathway
                );
        }

        if (filters && filters.status) {
            recommendations =
                recommendations.filter(
                    item =>
                        item.status ===
                        filters.status
                );
        }

        return recommendations;
    }

    /*
     * Get one recommendation.
     */
    function getRecommendationById(
        studentId,
        recommendationId
    ) {
        return (
            getRecommendations(studentId)
                .find(
                    item =>
                        item.recommendationId ===
                        recommendationId
                ) || null
        );
    }

    /*
     * Mark an activity as assigned.
     */
    function assignActivity(
        studentId,
        recommendationId
    ) {
        const data = safeRead();

        const student = data[studentId];

        if (!student) {
            throw new Error(
                "Student record not found."
            );
        }

        const recommendation =
            student.recommendations.find(
                item =>
                    item.recommendationId ===
                    recommendationId
            );

        if (!recommendation) {
            throw new Error(
                "Recommendation not found."
            );
        }

        const previousStatus =
            recommendation.status;

        recommendation.status =
            ACTIVITY_STATUS.ASSIGNED;

        recommendation.assignedAt =
            now();

        recommendation.updatedAt =
            now();

        student.audit.push({
            auditId: createId("audit"),

            action:
                "ADAPTIVE_ACTIVITY_ASSIGNED",

            studentId: studentId,

            recommendationId:
                recommendationId,

            previousStatus:
                previousStatus,

            newStatus:
                recommendation.status,

            createdAt: now()
        });

        student.updatedAt = now();

        if (!safeWrite(data)) {
            throw new Error(
                "Unable to save activity assignment."
            );
        }

        return Object.freeze({
            ...recommendation
        });
    }

    /*
     * Mark an activity as started.
     */
    function startActivity(
        studentId,
        recommendationId
    ) {
        return updateActivityStatus(
            studentId,
            recommendationId,
            ACTIVITY_STATUS.STARTED
        );
    }

    /*
     * Mark an activity as completed.
     */
    function completeActivity(
        studentId,
        recommendationId,
        completionData
    ) {
        const data = safeRead();

        const student = data[studentId];

        if (!student) {
            throw new Error(
                "Student record not found."
            );
        }

        const recommendation =
            student.recommendations.find(
                item =>
                    item.recommendationId ===
                    recommendationId
            );

        if (!recommendation) {
            throw new Error(
                "Recommendation not found."
            );
        }

        const previousStatus =
            recommendation.status;

        recommendation.status =
            ACTIVITY_STATUS.COMPLETED;

        recommendation.completedAt =
            now();

        recommendation.updatedAt =
            now();

        recommendation.completion =
            completionData || null;

        student.audit.push({
            auditId: createId("audit"),

            action:
                "ADAPTIVE_ACTIVITY_COMPLETED",

            studentId: studentId,

            recommendationId:
                recommendationId,

            previousStatus:
                previousStatus,

            newStatus:
                recommendation.status,

            createdAt: now()
        });

        student.updatedAt = now();

        if (!safeWrite(data)) {
            throw new Error(
                "Unable to save completed activity."
            );
        }

        return Object.freeze({
            ...recommendation
        });
    }

    /*
     * General activity-status update.
     */
    function updateActivityStatus(
        studentId,
        recommendationId,
        status,
        reason
    ) {
        if (
            !Object.values(
                ACTIVITY_STATUS
            ).includes(status)
        ) {
            throw new Error(
                "Unsupported activity status."
            );
        }

        const data = safeRead();

        const student = data[studentId];

        if (!student) {
            throw new Error(
                "Student record not found."
            );
        }

        const recommendation =
            student.recommendations.find(
                item =>
                    item.recommendationId ===
                    recommendationId
            );

        if (!recommendation) {
            throw new Error(
                "Recommendation not found."
            );
        }

        const previousStatus =
            recommendation.status;

        recommendation.status =
            status;

        recommendation.updatedAt =
            now();

        student.audit.push({
            auditId: createId("audit"),

            action:
                "ADAPTIVE_ACTIVITY_STATUS_CHANGED",

            studentId: studentId,

            recommendationId:
                recommendationId,

            previousStatus:
                previousStatus,

            newStatus:
                status,

            reason:
                reason || null,

            createdAt: now()
        });

        student.updatedAt = now();

        if (!safeWrite(data)) {
            throw new Error(
                "Unable to save activity status."
            );
        }

        return Object.freeze({
            ...recommendation
        });
    }

    /*
     * Ask Stage 1 Student Skills Engine for the
     * current skill status where available.
     */
    function getSkillCapability(
        studentId,
        skillId
    ) {
        if (
            !window.PacificEducationStudentSkillsEngine
        ) {
            return null;
        }

        const engine =
            window.PacificEducationStudentSkillsEngine;

        try {
            if (
                typeof engine.getSkill ===
                "function"
            ) {
                return engine.getSkill(
                    studentId,
                    skillId
                );
            }
        } catch (error) {
            console.warn(
                "Student Skills Engine connection warning:",
                error
            );
        }

        return null;
    }

    /*
     * Get Stage 2 evidence summary where available.
     */
    function getEvidenceSummary(studentId) {
        if (
            !window.PacificEducationStudentEvidenceEngine
        ) {
            return null;
        }

        const engine =
            window.PacificEducationStudentEvidenceEngine;

        try {
            if (
                typeof engine.getStudentEvidenceSummary ===
                "function"
            ) {
                return engine.getStudentEvidenceSummary(
                    studentId
                );
            }
        } catch (error) {
            console.warn(
                "Student Evidence Engine connection warning:",
                error
            );
        }

        return null;
    }

    /*
     * Build the next activity from the student's
     * demonstrated capability.
     */
    function buildNextActivity(options) {
        if (!options || !options.studentId) {
            throw new Error(
                "Student ID is required."
            );
        }

        let capabilityStatus =
            options.capabilityStatus ||
            null;

        /*
         * If no status was supplied, try Stage 1.
         */
        if (
            !capabilityStatus &&
            options.skillId
        ) {
            const skill =
                getSkillCapability(
                    options.studentId,
                    options.skillId
                );

            if (
                skill &&
                skill.status
            ) {
                capabilityStatus =
                    skill.status;
            }
        }

        if (!capabilityStatus) {
            capabilityStatus =
                CAPABILITY_STATUS.INSUFFICIENT_EVIDENCE;
        }

        const pathway =
            determinePathway(
                capabilityStatus
            );

        const type =
            determineActivityType(
                capabilityStatus
            );

        return recommendNextActivity({
            ...options,

            capabilityStatus:
                capabilityStatus,

            pathway:
                pathway,

            type:
                type
        });
    }

    /*
     * Generate the next activity from Stage 1
     * and Stage 2 information.
     */
    function generateNextIndividualActivity(
        options
    ) {
        if (!options || !options.studentId) {
            throw new Error(
                "Student ID is required."
            );
        }

        const evidenceSummary =
            getEvidenceSummary(
                options.studentId
            );

        const activity =
            buildNextActivity({
                ...options,

                evidenceSummary:
                    evidenceSummary
            });

        return activity;
    }

    /*
     * Provide a simple explanation for the pathway.
     */
    function explainPathway(
        capabilityStatus
    ) {
        switch (capabilityStatus) {
            case CAPABILITY_STATUS.DEMONSTRATED:
                return (
                    "Demonstrated capability: " +
                    "provide deeper application, " +
                    "creative work, problem solving " +
                    "or extension while preserving " +
                    "required curriculum outcomes."
                );

            case CAPABILITY_STATUS.DEVELOPING:
                return (
                    "Developing capability: " +
                    "continue planned learning with " +
                    "appropriate practice."
                );

            case CAPABILITY_STATUS.EMERGING:
                return (
                    "Emerging capability: " +
                    "provide guided practice, examples " +
                    "and additional explanation."
                );

            case CAPABILITY_STATUS.REQUIRES_PRACTICE:
                return (
                    "Further practice indicated: " +
                    "provide targeted practice and " +
                    "another opportunity to demonstrate learning."
                );

            case CAPABILITY_STATUS.REQUIRES_SUPPORT:
                return (
                    "Additional support indicated: " +
                    "provide intervention, guided learning " +
                    "and appropriate reassessment."
                );

            case CAPABILITY_STATUS.NOT_YET_INTRODUCED:
                return (
                    "Learning has not yet been introduced: " +
                    "introduce the required learning before " +
                    "expecting demonstration."
                );

            case CAPABILITY_STATUS.INSUFFICIENT_EVIDENCE:
            default:
                return (
                    "Evidence is insufficient for an " +
                    "individual capability decision: " +
                    "continue appropriate core learning and " +
                    "collect further evidence."
                );
        }
    }

    /*
     * Return engine status.
     */
    function getStatus() {
        return Object.freeze({
            engine:
                "Pacific Education Adaptive Activity Engine",

            version:
                VERSION,

            stage:
                3,

            prototype:
                true,

            productionReady:
                false,

            storage:
                "localStorage",

            curriculumProtected:
                true,

            officialCurriculumReplacement:
                false,

            individualPathways:
                true,

            capabilityBasedAdaptation:
                true,

            supportPathway:
                true,

            corePathway:
                true,

            extensionPathway:
                true,

            accessibilityPathway:
                true,

            permanentCapabilityLabels:
                false,

            productionSecurityRequired:
                true,

            serverSideAuthorizationRequired:
                true,

            productionStudentDataProtectionRequired:
                true,

            productionCurriculumAuthorityRequired:
                true
        });
    }

    const api = Object.freeze({

        VERSION,

        PATHWAYS,

        CAPABILITY_STATUS,

        ACTIVITY_TYPES,

        ACTIVITY_STATUS,

        determinePathway,

        determineActivityType,

        createRecommendation,

        saveRecommendation,

        recommendNextActivity,

        createSupportActivity,

        createCoreActivity,

        createExtensionActivity,

        createAccessibilityActivity,

        getRecommendations,

        getRecommendationById,

        assignActivity,

        startActivity,

        completeActivity,

        updateActivityStatus,

        getSkillCapability,

        getEvidenceSummary,

        buildNextActivity,

        generateNextIndividualActivity,

        explainPathway,

        getStatus
    });

    window.PacificEducationAdaptiveActivityEngine =
        api;

})();
