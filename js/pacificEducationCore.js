/*
 * =========================================================
 * PACIFIC EDUCATION
 * CENTRAL EDUCATION CORE
 * Version 1.2.0
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

    const VERSION = "1.2.0";
    const STORAGE_KEY = "pacificEducationCoreState";
    const PASS_MARK = 80;

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
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            return null;
        }
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
                .substring(2, 9)
        );
    }

    function loadState() {
        try {
            if (
                typeof window.localStorage ===
                "undefined"
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
                typeof window.localStorage !==
                "undefined"
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

    function audit(action, details) {
        state.audit.push({
            auditId: createId("AUDIT"),
            action: action,
            details:
                isPlainObject(details)
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
            typeof window.CustomEvent ===
                "function" &&
            typeof window.dispatchEvent ===
                "function"
        ) {
            window.dispatchEvent(
                new CustomEvent(
                    "pacificEducation:" +
                        eventName,
                    {
                        detail:
                            safePayload
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
        return !!(
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
            "AUTHORIZATION_GRANTED
