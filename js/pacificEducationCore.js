/*
 * =========================================================
 * PACIFIC EDUCATION
 * CENTRAL EDUCATION CORE
 * Version 1.1.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Central protected education-state layer.
 *
 * CONNECTS:
 * • identity
 * • workspace
 * • student
 * • curriculum
 * • lesson
 * • daily learning check
 * • activities
 * • learning history
 * • assessments
 * • marks
 * • interventions
 * • events
 * • audit history
 *
 * SECURITY RULE
 * ---------------------------------------------------------
 * Authorization is never inferred from identity alone.
 *
 * Prototype note:
 * localStorage is suitable for the current prototype only.
 * Production requires secure authentication, server-side
 * authorization, encrypted storage, audit controls,
 * backup, recovery and jurisdiction-compliant education
 * record protection.
 * =========================================================
 */

(function (window) {
    "use strict";

    const VERSION = "1.1.0";
    const STORAGE_KEY = "pacificEducationCoreState";

    const ROLES = Object.freeze([
        "student",
        "teacher",
        "parent",
        "ministry",
        "head_of_school",
        "examiner",
        "owner",
        "admin"
    ]);

    const DEFAULT_STATE = {
        version: VERSION,

        identity: {
            userId: null,
            name: "",
            role: null,
            country: "",
            jurisdiction: "",
            schoolId: null,
            classId: null,
            authorized: false
        },

        workspace: {
            workspaceId: null,
            type: "personal",
            status: "active"
        },

        student: {
            studentId: null,
            name: "",
            yearForm: "",
            className: "",
            subjects: []
        },

        curriculum: {
            country: "",
            jurisdiction: "",
            version: "",
            yearForm: "",
            subject: "",
            currentConcept: "",
            verified: false
        },

        lesson: {
            lessonId: null,
            day: null,
            subject: "",
            title: "",
            concept: "",
            status: "not_started"
        },

        dailyLearningCheck: {
            checkId: null,
            concept: "",
            questions: [],
            attempted: false,
            score: null,
            understandingPercent: null,
            status: "not_started"
        },

        activities: [],
        learningHistory: [],
        assessments: [],
        marks: [],
        interventions: [],
        audit: [],
        events: []
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function isPlainObject(value) {
        return !!(
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function mergeState(base, source) {
        if (!isPlainObject(source)) {
            return base;
        }

        Object.keys(source).forEach(function (key) {
            if (
                isPlainObject(source[key]) &&
                isPlainObject(base[key])
            ) {
                base[key] = mergeState(
                    base[key],
                    source[key]
                );
            } else {
                base[key] = source[key];
            }
        });

        return base;
    }

    function loadState() {
        try {
            if (
                typeof window.localStorage === "undefined"
            ) {
                return clone(DEFAULT_STATE);
            }

            const saved =
                window.localStorage.getItem(
                    STORAGE_KEY
                );

            if (!saved) {
                return clone(DEFAULT_STATE);
            }

            const parsed = JSON.parse(saved);

            if (!isPlainObject(parsed)) {
                return clone(DEFAULT_STATE);
            }

            return mergeState(
                clone(DEFAULT_STATE),
                parsed
            );
        } catch (error) {
            console.error(
                "Pacific Education Core: unable to load state.",
                error
            );

            return clone(DEFAULT_STATE);
        }
    }

    let state = loadState();

    function saveState() {
        state.version = VERSION;

        try {
            if (
                typeof window.localStorage !== "undefined"
            ) {
                window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(state)
                );
            }
        } catch (error) {
            console.error(
                "Pacific Education Core: save failed.",
                error
            );
        }
    }

    function timestamp() {
        return new Date().toISOString();
    }

    function createId(prefix) {
        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );
    }

    function audit(action, details) {
        state.audit.push({
            auditId: createId("AUDIT"),
            action: action,
            details: isPlainObject(details)
                ? clone(details)
                : {},
            timestamp: timestamp()
        });

        saveState();
    }

    function emit(eventName, payload) {
        const safePayload =
            isPlainObject(payload) ||
            Array.isArray(payload)
                ? clone(payload)
                : {};

        const event = {
            eventId: createId("EVENT"),
            name: eventName,
            payload: safePayload,
            timestamp: timestamp()
        };

        state.events.push(event);

        if (
            typeof window.CustomEvent === "function" &&
            typeof window.dispatchEvent === "function"
        ) {
            window.dispatchEvent(
                new CustomEvent(
                    "pacificEducation:" + eventName,
                    {
                        detail: safePayload
                    }
                )
            );
        }

        saveState();

        return clone(event);
    }

    function getState() {
        return clone(state);
    }

    /*
     * =====================================================
     * AUTHORIZATION
     * =====================================================
     */

    function isAuthorized() {
        return (
            state.identity &&
            state.identity.authorized === true
        );
    }

    function authorizeUser(permissionContext) {
        const context =
            isPlainObject(permissionContext)
                ? permissionContext
                : {};

        if (context.authorized !== true) {
            state.identity.authorized = false;

            audit(
                "AUTHORIZATION_DENIED",
                {
                    reason:
                        "Explicit authorization was not provided."
                }
            );

            emit("authorizationDenied");

            return false;
        }

        state.identity.authorized = true;

        audit(
            "AUTHORIZATION_GRANTED",
            {
                userId: state.identity.userId,
                role: state.identity.role
            }
        );

        emit(
            "authorizationGranted",
            {
                userId: state.identity.userId,
                role: state.identity.role
            }
        );

        return true;
    }

    function requireAuthorization(action) {
        if (isAuthorized()) {
            return true;
        }

        audit(
            action + "_BLOCKED",
            {
                reason:
                    "User is not authorized."
            }
        );

        return false;
    }

    function validRole(role) {
        return ROLES.indexOf(role) !== -1;
    }

    function validIdentityObject(identity) {
        return !!(
            isPlainObject(identity) &&
            typeof identity.userId === "string" &&
            identity.userId.trim() &&
            validRole(identity.role)
        );
    }

    /*
     * =====================================================
     * IDENTITY
     * =====================================================
     */

    function setIdentity(identity) {
        if (!isPlainObject(identity)) {
            return false;
        }

        state.identity = mergeState(
            state.identity,
            identity
        );

        /*
         * Authorization is never inherited from an
         * untrusted identity update.
         *
         * Only an explicit authorized:true may grant
         * prototype authorization.
         */
        if (identity.authorized !== true) {
            state.identity.authorized = false;
        }

        audit(
            "IDENTITY_UPDATED",
            {
                userId: state.identity.userId,
                role: state.identity.role,
                authorized:
                    state.identity.authorized
            }
        );

        emit(
            "identityUpdated",
            {
                userId: state.identity.userId,
                role: state.identity.role,
                authorized:
                    state.identity.authorized
            }
        );

        return clone(state.identity);
    }

    function getIdentity() {
        return clone(state.identity);
    }

    /*
     * =====================================================
     * WORKSPACE
     * =====================================================
     */

    function setWorkspace(workspace) {
        if (
            !requireAuthorization(
                "WORKSPACE"
            )
        ) {
            return false;
        }

        if (!isPlainObject(workspace)) {
            return false;
        }

        state.workspace = mergeState(
            state.workspace,
            workspace
        );

        audit(
            "WORKSPACE_UPDATED",
            {
                workspaceId:
                    state.workspace.workspaceId
            }
        );

        emit(
            "workspaceUpdated",
            state.workspace
        );

        return clone(state.workspace);
    }

    function getWorkspace() {
        return clone(state.workspace);
    }

    /*
     * =====================================================
     * STUDENT
     * =====================================================
     */

    function setStudent(student) {
        if (
            !requireAuthorization(
                "STUDENT_ACCESS"
            )
        ) {
            return false;
        }

        if (!isPlainObject(student)) {
            return false;
        }

        state.student = mergeState(
            state.student,
            student
        );

        audit(
            "STUDENT_PROFILE_UPDATED",
            {
                studentId:
                    state.student.studentId
            }
        );

        emit(
            "studentUpdated",
            state.student
        );

        return clone(state.student);
    }

    function getStudent() {
        return clone(state.student);
    }

    /*
     * =====================================================
     * CURRICULUM
     * =====================================================
     */

    function setCurriculum(curriculum) {
        if (
            !requireAuthorization(
                "CURRICULUM"
            )
        ) {
            return false;
        }

        if (!isPlainObject(curriculum)) {
            return false;
        }

        state.curriculum = mergeState(
            state.curriculum,
            curriculum
        );

        audit(
            "CURRICULUM_UPDATED",
            {
                subject:
                    state.curriculum.subject,
                verified:
                    state.curriculum.verified
            }
        );

        emit(
            "curriculumUpdated",
            state.curriculum
        );

        return clone(state.curriculum);
    }

    function getCurriculum() {
        return clone(state.curriculum);
    }

    /*
     * =====================================================
     * LESSON
     * =====================================================
     */

    function setLesson(lesson) {
        if (
            !requireAuthorization(
                "LESSON"
            )
        ) {
            return false;
        }

        if (!isPlainObject(lesson)) {
            return false;
        }

        state.lesson = mergeState(
            state.lesson,
            lesson
        );

        audit(
            "LESSON_UPDATED",
            {
                lessonId:
                    state.lesson.lessonId,
                day:
                    state.lesson.day,
                subject:
                    state.lesson.subject
            }
        );

        emit(
            "lessonUpdated",
            state.lesson
        );

        return clone(state.lesson);
    }

    function getLesson() {
        return clone(state.lesson);
    }

    /*
     * =====================================================
     * DAILY LEARNING CHECK
     * =====================================================
     */

    function createDailyLearningCheck(check) {
        if (
            !requireAuthorization(
                "DAILY_LEARNING_CHECK_CREATE"
            )
        ) {
            return false;
        }

        const data =
            isPlainObject(check)
                ? check
                : {};

        state.dailyLearningCheck = {
            checkId:
                typeof data.checkId === "string" &&
                data.checkId
                    ? data.checkId
                    : createId("CHECK"),

            concept:
                typeof data.concept === "string"
                    ? data.concept
                    : "",

            questions:
                Array.isArray(data.questions)
                    ? clone(data.questions)
                    : [],

            attempted: false,
            score: null,
            understandingPercent: null,
            status: "not_started"
        };

        audit(
            "DAILY_LEARNING_CHECK_CREATED",
            {
                checkId:
                    state.dailyLearningCheck.checkId,
                concept:
                    state.dailyLearningCheck.concept
            }
        );

        emit(
            "dailyLearningCheckCreated",
            state.dailyLearningCheck
        );

        return clone(
            state.dailyLearningCheck
        );
    }

    function recordDailyLearningCheck(result) {
        if (
            !requireAuthorization(
                "DAILY_LEARNING_CHECK_RECORD"
            )
        ) {
            return false;
        }

        const data =
            isPlainObject(result)
                ? result
                : {};

        const total =
            Number(data.total);

        const correct =
            Number(data.correct);

        let understanding = null;

        if (
            Number.isFinite(total) &&
            total > 0 &&
            Number.isFinite(correct)
        ) {
            const boundedCorrect =
                Math.max(
                    0,
                    Math.min(correct, total)
                );

            understanding =
                Math.round(
                    (
                        boundedCorrect /
                        total
                    ) * 100
                );
        }

        state.dailyLearningCheck.attempted =
            true;

        state.dailyLearningCheck.score = {
            correct:
                Number.isFinite(correct)
                    ? correct
                    : 0,
            total:
                Number.isFinite(total)
                    ? total
                    : 0
        };

        state.dailyLearningCheck
            .understandingPercent =
            understanding;

        if (understanding === null) {
            state.dailyLearningCheck.status =
                "teacher_review_required";
        } else if (understanding < 80) {
            state.dailyLearningCheck.status =
                "intervention_required";
        } else {
            state.dailyLearningCheck.status =
                "continue";
        }

        audit(
            "DAILY_LEARNING_CHECK_RECORDED",
            {
                checkId:
                    state.dailyLearningCheck.checkId,
                understandingPercent:
                    understanding,
                status:
                    state.dailyLearningCheck.status
            }
        );

        emit(
            "dailyLearningCheckRecorded",
            state.dailyLearningCheck
        );

        return clone(
            state.dailyLearningCheck
        );
    }

    function getDailyLearningCheck() {
        return clone(
            state.dailyLearningCheck
        );
    }

    /*
     * =====================================================
     * ACTIVITIES
     * =====================================================
     */

    function addActivity(activity) {
        if (
            !requireAuthorization(
                "ACTIVITY_ADD"
            )
        ) {
            return false;
        }

        const data =
            isPlainObject(activity)
                ? activity
                : {};

        const record = {
            activityId:
                typeof data.activityId === "string" &&
                data.activityId
                    ? data.activityId
                    : createId("ACT"),

            date:
                typeof data.date === "string" &&
                data.date
                    ? data.date
                    : timestamp(),

            subject:
                typeof data.subject === "string"
                    ? data.subject
                    : state.lesson.subject,

            concept:
                typeof data.concept === "string"
                    ? data.concept
                    : state.lesson.concept,

            curriculumVersion:
                typeof data.curriculumVersion === "string"
                    ? data.curriculumVersion
                    : state.curriculum.version,

            title:
                typeof data.title === "string"
                    ? data.title
                    : "",

            instructions:
                typeof data.instructions === "string"
                    ? data.instructions
                    : "",

            assessmentRequired:
                data.assessmentRequired !== false,

            attempted: false,
            status: "assigned"
        };

        state.activities.push(record);

        audit(
            "ACTIVITY_ADDED",
            {
                activityId:
                    record.activityId,
                subject:
                    record.subject,
                concept:
                    record.concept
            }
        );

        emit(
            "activityAdded",
            record
        );

        return clone(record);
    }

    function recordActivityAttempt(
        activityId,
        result
    ) {
        if (
            !requireAuthorization(
                "ACTIVITY_ATTEMPT"
            )
        ) {
            return false;
        }

        if (
            typeof activityId !== "string" ||
            !activityId.trim()
        ) {
            return false;
        }

        const activity =
            state.activities
