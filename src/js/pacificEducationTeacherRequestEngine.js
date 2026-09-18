/*
 * =========================================================
 * PACIFIC EDUCATION
 * TEACHER REQUEST ENGINE
 * =========================================================
 *
 * Version: 1.0.0
 *
 * Stage 4
 *
 * Purpose:
 * Allow an authorised teacher to request additional,
 * targeted learning support, practice, extension,
 * reassessment or accessibility adjustments for an
 * individual student.
 *
 * Core principle:
 * "Teacher request changes the learning pathway,
 * not the official curriculum."
 *
 * Prototype boundary:
 * - Uses browser localStorage.
 * - NOT a production security boundary.
 * - Production teacher identity, authorisation,
 *   student data, safeguarding, audit protection
 *   and permissions require secure server-side systems.
 * =========================================================
 */

(function (window) {
    "use strict";

    const VERSION = "1.0.0";

    const STORAGE_KEY =
        "pacificEducationTeacherRequests";

    const REQUEST_TYPES = Object.freeze({
        SUPPORT: "Support",
        PRACTICE: "Practice",
        EXTENSION: "Extension",
        REASSESSMENT: "Reassessment",
        ACCESSIBILITY: "Accessibility",
        ADDITIONAL_EXPLANATION: "Additional Explanation",
        REAL_LIFE_APPLICATION: "Real-Life Application",
        OTHER_EDUCATIONAL_SUPPORT: "Other Educational Support"
    });

    const REQUEST_STATUS = Object.freeze({
        REQUESTED: "Requested",
        REVIEWED: "Reviewed",
        APPROVED: "Approved",
        ASSIGNED: "Assigned",
        COMPLETED: "Completed",
        REQUIRES_REVIEW: "Requires Review",
        DECLINED: "Declined",
        CANCELLED: "Cancelled"
    });

    const VALID_ROLES = Object.freeze([
        "teacher",
        "head_of_school",
        "examiner",
        "owner",
        "admin"
    ]);

    function now() {
        return new Date().toISOString();
    }

    function createId(prefix) {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }

    function safeRead() {
        try {
            const raw =
                window.localStorage.getItem(
                    STORAGE_KEY
                );

            return raw
                ? JSON.parse(raw)
                : {};
        } catch (error) {
            return {};
        }
    }

    function safeWrite(data) {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

            return true;
        } catch (error) {
            return false;
        }
    }

    function ensureTeacher(data, teacherId) {
        if (!teacherId) {
            throw new Error(
                "Teacher ID is required."
            );
        }

        if (!data[teacherId]) {
            data[teacherId] = {
                teacherId: teacherId,
                createdAt: now(),
                updatedAt: now(),
                requests: [],
                audit: []
            };
        }

        return data[teacherId];
    }

    function validateTeacherContext(context) {
        if (
            !context ||
            typeof context !== "object"
        ) {
            throw new Error(
                "Teacher authorisation context is required."
            );
        }

        if (!context.teacherId) {
            throw new Error(
                "Teacher ID is required."
            );
        }

        if (!context.role) {
            throw new Error(
                "Teacher role is required."
            );
        }

        if (
            !VALID_ROLES.includes(
                context.role
            )
        ) {
            throw new Error(
                "Invalid teacher role."
            );
        }

        if (context.authorized !== true) {
            throw new Error(
                "Authorised teacher access is required."
            );
        }

        return true;
    }

    function validateRequest(request) {
        if (
            !request ||
            typeof request !== "object"
        ) {
            throw new Error(
                "Teacher request object is required."
            );
        }

        if (!request.teacherId) {
            throw new Error(
                "Teacher ID is required."
            );
        }

        if (!request.studentId) {
            throw new Error(
                "Student ID is required."
            );
        }

        if (!request.requestType) {
            throw new Error(
                "Request type is required."
            );
        }

        if (
            !Object.values(
                REQUEST_TYPES
            ).includes(
                request.requestType
            )
        ) {
            throw new Error(
                "Unsupported teacher request type."
            );
        }

        if (!request.reason) {
            throw new Error(
                "Educational reason is required."
            );
        }

        return true;
    }

    /*
     * Create a teacher request.
     *
     * The request must identify:
     * - teacher
     * - student
     * - subject/activity where available
     * - curriculum indicator where available
     * - educational reason
     *
     * The request does NOT replace official curriculum.
     */

    function createRequest(
        context,
        options
    ) {
        validateTeacherContext(
            context
        );

        if (
            !options ||
            typeof options !== "object"
        ) {
            throw new Error(
                "Request options are required."
            );
        }

        if (!options.studentId) {
            throw new Error(
                "Student ID is required."
            );
        }

        if (!options.requestType) {
            throw new Error(
                "Request type is required."
            );
        }

        if (
            !Object.values(
                REQUEST_TYPES
            ).includes(
                options.requestType
            )
        ) {
            throw new Error(
                "Unsupported teacher request type."
            );
        }

        if (!options.reason) {
            throw new Error(
                "Educational reason is required."
            );
        }

        const request = {
            requestId:
                options.requestId ||
                createId("teacherRequest"),

            teacherId:
                context.teacherId,

            teacherRole:
                context.role,

            studentId:
                options.studentId,

            subject:
                options.subject ||
                null,

            classLevel:
                options.classLevel ||
                null,

            age:
                options.age ||
                null,

            activityId:
                options.activityId ||
                null,

            skillId:
                options.skillId ||
                null,

            skillName:
                options.skillName ||
                null,

            curriculumIndicator:
                options.curriculumIndicator ||
                null,

            requestType:
                options.requestType,

            reason:
                options.reason,

            requestedSupport:
                options.requestedSupport ||
                null,

            requestedOutcome:
                options.requestedOutcome ||
                null,

            requestedTime:
                options.requestedTime ||
                null,

            accessibilityNeed:
                options.accessibilityNeed ||
                null,

            teacherNotes:
                options.teacherNotes ||
                null,

            curriculumProtected:
                true,

            officialCurriculumReplacement:
                false,

            status:
                REQUEST_STATUS.REQUESTED,

            createdAt:
                now(),

            updatedAt:
                now()
        };

        validateRequest(request);

        return Object.freeze(
            request
        );
    }

    /*
     * Save a teacher request.
     */

    function saveRequest(request) {
        validateRequest(request);

        const data =
            safeRead();

        const teacher =
            ensureTeacher(
                data,
                request.teacherId
            );

        teacher.requests.push({
            ...request
        });

        teacher.audit.push({
            auditId:
                createId("audit"),

            action:
                "TEACHER_REQUEST_CREATED",

            requestId:
                request.requestId,

            teacherId:
                request.teacherId,

            studentId:
                request.studentId,

            requestType:
                request.requestType,

            status:
                request.status,

            createdAt:
                now()
        });

        teacher.updatedAt =
            now();

        if (!safeWrite(data)) {
            throw new Error(
                "Unable to save teacher request."
            );
        }

        return Object.freeze({
            ...request
        });
    }

    /*
     * Submit a teacher request.
     */

    function submitRequest(
        context,
        options
    ) {
        const request =
            createRequest(
                context,
                options
            );

        return saveRequest(
            request
        );
    }

    /*
     * Get requests for a teacher.
     */

    function getTeacherRequests(
        teacherId,
        filters
    ) {
        const data =
            safeRead();

        const teacher =
            data[teacherId];

        if (!teacher) {
            return [];
        }

        let requests = [
            ...teacher.requests
        ];

        if (
            filters &&
            filters.studentId
        ) {
            requests =
                requests.filter(
                    item =>
                        item.studentId ===
                        filters.studentId
                );
        }

        if (
            filters &&
            filters.requestType
        ) {
            requests =
                requests.filter(
                    item =>
                        item.requestType ===
                        filters.requestType
                );
        }

        if (
            filters &&
            filters.status
        ) {
            requests =
                requests.filter(
                    item =>
                        item.status ===
                        filters.status
                );
        }

        if (
            filters &&
            filters.subject
        ) {
            requests =
                requests.filter(
                    item =>
                        item.subject ===
                        filters.subject
                );
        }

        return requests;
    }

    /*
     * Get requests for one student.
     */

    function getStudentRequests(
        studentId,
        filters
    ) {
        const data =
            safeRead();

        let results = [];

        Object.keys(data)
            .forEach(
                teacherId => {
                    const teacher =
                        data[teacherId];

                    if (
                        !teacher ||
                        !Array.isArray(
                            teacher.requests
                        )
                    ) {
                        return;
                    }

                    teacher.requests
                        .forEach(
                            request => {
                                if (
                                    request.studentId ===
                                    studentId
                                ) {
                                    results.push(
                                        request
                                    );
                                }
                            }
                        );
                }
            );

        if (
            filters &&
            filters.status
        ) {
            results =
                results.filter(
                    item =>
                        item.status ===
                        filters.status
                );
        }

        if (
            filters &&
            filters.requestType
        ) {
            results =
                results.filter(
                    item =>
                        item.requestType ===
                        filters.requestType
                );
        }

        return results;
    }

    /*
     * Find one request.
     */

    function getRequestById(
        teacherId,
        requestId
    ) {
        return (
            getTeacherRequests(
                teacherId
            ).find(
                request =>
                    request.requestId ===
                    requestId
            ) ||
            null
        );
    }

    /*
     * Change request status.
     *
     * Every status change creates an
     * audit record.
     */

    function updateRequestStatus(
        context,
        requestId,
        newStatus,
        reason
    ) {
        validateTeacherContext(
            context
        );

        if (
            !Object.values(
                REQUEST_STATUS
            ).includes(
                newStatus
            )
        ) {
            throw new Error(
                "Unsupported request status."
            );
        }

        const data =
            safeRead();

        const teacher =
            data[
                context.teacherId
            ];

        if (!teacher) {
            throw new Error(
                "Teacher record not found."
            );
        }

        const request =
            teacher.requests.find(
                item =>
                    item.requestId ===
                    requestId
            );

        if (!request) {
            throw new Error(
                "Teacher request not found."
            );
        }

        const previousStatus =
            request.status;

        request.status =
            newStatus;

        request.updatedAt =
            now();

        if (
            newStatus ===
            REQUEST_STATUS.REVIEWED
        ) {
            request.reviewedAt =
                now();

            request.reviewedBy =
                context.teacherId;
        }

        if (
            newStatus ===
            REQUEST_STATUS.APPROVED
        ) {
            request.approvedAt =
                now();

            request.approvedBy =
                context.teacherId;
        }

        if (
            newStatus ===
            REQUEST_STATUS.ASSIGNED
        ) {
            request.assignedAt =
                now();
        }

        if (
            newStatus ===
            REQUEST_STATUS.COMPLETED
        ) {
            request.completedAt =
                now();
        }

        request.statusReason =
            reason ||
            null;

        teacher.audit.push({
            auditId:
                createId("audit"),

            action:
                "TEACHER_REQUEST_STATUS_CHANGED",

            requestId:
                requestId,

            teacherId:
                context.teacherId,

            studentId:
                request.studentId,

            previousStatus:
                previousStatus,

            newStatus:
                newStatus,

            reason:
                reason ||
                null,

            createdAt:
                now()
        });

        teacher.updatedAt =
            now();

        if (!safeWrite(data)) {
            throw new Error(
                "Unable to update teacher request."
            );
        }

        return Object.freeze({
            ...request
        });
    }

    /*
     * Convenience functions.
     */

    function approveRequest(
        context,
        requestId,
        reason
    ) {
        return updateRequestStatus(
            context,
            requestId,
            REQUEST_STATUS.APPROVED,
            reason
        );
    }

    function assignRequest(
        context,
        requestId,
        reason
    ) {
        return updateRequestStatus(
            context,
            requestId,
            REQUEST_STATUS.ASSIGNED,
            reason
        );
    }

    function completeRequest(
        context,
        requestId,
        reason
    ) {
        return updateRequestStatus(
            context,
            requestId,
            REQUEST_STATUS.COMPLETED,
            reason
        );
    }

    /*
     * Create a request specifically for
     * additional support.
     */

    function requestSupport(
        context,
        options
    ) {
        return submitRequest(
            context,
            {
                ...options,

                requestType:
                    REQUEST_TYPES.SUPPORT
            }
        );
    }

    /*
     * Create a practice request.
     */

    function requestPractice(
        context,
        options
    ) {
        return submitRequest(
            context,
            {
                ...options,

                requestType:
                    REQUEST_TYPES.PRACTICE
            }
        );
    }

    /*
     * Create an extension request.
     */

    function requestExtension(
        context,
        options
    ) {
        return submitRequest(
            context,
            {
                ...options,

                requestType:
                    REQUEST_TYPES.EXTENSION
            }
        );
    }

    /*
     * Create a reassessment request.
     */

    function requestReassessment(
        context,
        options
    ) {
        return submitRequest(
            context,
            {
                ...options,

                requestType:
                    REQUEST_TYPES.REASSESSMENT
            }
        );
    }

    /*
     * Create an accessibility request.
     */

    function requestAccessibility(
        context,
        options
    ) {
        return submitRequest(
            context,
            {
                ...options,

                requestType:
                    REQUEST_TYPES.ACCESSIBILITY
            }
        );
    }

    /*
     * Connect to Stage 3 Adaptive Activity Engine.
     *
     * This connection creates an adaptive activity
     * recommendation from an approved teacher request.
     */

    function generateAdaptiveActivity(
        request
    ) {
        if (
            !window
                .PacificEducationAdaptiveActivityEngine
        ) {
            return null;
        }

        const engine =
            window
                .PacificEducationAdaptiveActivityEngine;

        if (
            typeof engine
                .recommendNextActivity !==
            "function"
        ) {
            return null;
        }

        try {
            return engine
                .recommendNextActivity({
                    studentId:
                        request.studentId,

                    subject:
                        request.subject,

                    classLevel:
                        request.classLevel,

                    age:
                        request.age,

                    curriculumIndicator:
                        request.curriculumIndicator,

                    skillId:
                        request.skillId,

                    skillName:
                        request.skillName,

                    activityTitle:
                        request.requestedSupport ||
                        "Teacher Requested Learning Activity",

                    instructions:
                        request.teacherNotes ||
                        request.reason,

                    expectedOutcome:
                        request.requestedOutcome ||
                        null,

                    timeAllocation:
                        request.requestedTime ||
                        null,

                    supportReason:
                        request.reason,

                    capabilityStatus:
                        request.capabilityStatus ||
                        "Insufficient Evidence"
                });
        } catch (error) {
            console.warn(
                "Adaptive Activity Engine connection warning:",
                error
            );

            return null;
        }
    }

    /*
     * Explain what a teacher request can do.
     */

    function explainRequestType(
        requestType
    ) {
        switch (requestType) {
            case REQUEST_TYPES.SUPPORT:
                return (
                    "Request additional guided " +
                    "support, explanation, practice " +
                    "or intervention."
                );

            case REQUEST_TYPES.PRACTICE:
                return (
                    "Request additional practice " +
                    "to strengthen demonstrated learning."
                );

            case REQUEST_TYPES.EXTENSION:
                return (
                    "Request deeper application, " +
                    "problem solving or creative extension " +
                    "without removing required curriculum."
                );

            case REQUEST_TYPES.REASSESSMENT:
                return (
                    "Request another appropriate opportunity " +
                    "to demonstrate learning."
                );

            case REQUEST_TYPES.ACCESSIBILITY:
                return (
                    "Request an authorised accessibility " +
                    "adjustment while preserving the intended " +
                    "learning outcome."
                );

            case REQUEST_TYPES.ADDITIONAL_EXPLANATION:
                return (
                    "Request another explanation or teaching approach."
                );

            case REQUEST_TYPES.REAL_LIFE_APPLICATION:
                return (
                    "Request a real-life or community-based " +
                    "application of the learning."
                );

            case REQUEST_TYPES.OTHER_EDUCATIONAL_SUPPORT:
                return (
                    "Request another educational support " +
                    "appropriate to the learner's needs."
                );

            default:
                return (
                    "Teacher request must remain educationally " +
                    "relevant and curriculum-aligned."
                );
        }
    }

    /*
     * Return engine status.
     */

    function getStatus() {
        return Object.freeze({
            engine:
                "Pacific Education Teacher Request Engine",

            version:
                VERSION,

            stage:
                4,

            prototype:
                true,

            productionReady:
                false,

            storage:
                "localStorage",

            teacherAuthorisationRequired:
                true,

            individualStudentRequests:
                true,

            curriculumProtected:
                true,

            officialCurriculumReplacement:
                false,

            supportRequests:
                true,

            practiceRequests:
                true,

            extensionRequests:
                true,

            reassessmentRequests:
                true,

            accessibilityRequests:
                true,

            auditTrail:
                true,

            adaptiveActivityConnection:
                true,

            permanentStudentLabels:
                false,

            productionSecurityRequired:
                true,

            productionServerSideAuthorisationRequired:
                true,

            productionStudentDataProtectionRequired:
                true
        });
    }

    const api = Object.freeze({

        VERSION,

        REQUEST_TYPES,

        REQUEST_STATUS,

        VALID_ROLES,

        createRequest,

        saveRequest,

        submitRequest,

        getTeacherRequests,

        getStudentRequests,

        getRequestById,

        updateRequestStatus,

        approveRequest,

        assignRequest,

        completeRequest,

        requestSupport,

        requestPractice,

        requestExtension,

        requestReassessment,

        requestAccessibility,

        generateAdaptiveActivity,

        explainRequestType,

        getStatus
    });

    window.PacificEducationTeacherRequestEngine =
        api;

})(window);
