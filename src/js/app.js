/* =========================================
   PACIFIC EDUCATION — APPLICATION CORE
   File: src/js/app.js
   Version: 0.1.0
========================================= */

(function () {

    "use strict";

    const APP_VERSION = "0.1.0";

    const state = {
        initialized: false,

        user: null,

        workspace: {
            currentPage: "home",
            language: "en"
        },

        system: {
            online: navigator.onLine,
            lastAudit: null
        }
    };


    /* =========================================
       INITIALIZE APPLICATION
    ========================================= */

    function initialize() {

        if (state.initialized) {
            return;
        }

        state.initialized = true;

        updateNetworkStatus();

        restoreSafeLanguage();

        audit("APPLICATION_INITIALIZED", {
            version: APP_VERSION
        });

        console.log(
            "Pacific Education initialized — version",
            APP_VERSION
        );
    }


    /* =========================================
       USER STATE
    ========================================= */

    function setUser(user) {

        if (!user || typeof user !== "object") {
            return false;
        }

        state.user = {
            id: user.id || null,
            role: user.role || "student",
            name: user.name || "",
            country: user.country || null
        };

        audit("USER_SESSION_SET", {
            role: state.user.role
        });

        return true;
    }


    function clearUser() {

        state.user = null;

        audit("USER_SESSION_CLEARED");

        return true;
    }


    /* =========================================
       WORKSPACE
    ========================================= */

    function setWorkspace(page) {

        if (!page || typeof page !== "string") {
            return false;
        }

        state.workspace.currentPage = page;

        audit("WORKSPACE_CHANGED", {
            page: page
        });

        return true;
    }


    /* =========================================
       LANGUAGE
    ========================================= */

    function setLanguage(language) {

        if (!language || typeof language !== "string") {
            return false;
        }

        state.workspace.language =
            language.toLowerCase();

        audit("LANGUAGE_CHANGED", {
            language: state.workspace.language
        });

        return true;
    }


    function restoreSafeLanguage() {

        try {

            const savedLanguage =
                localStorage.getItem(
                    "pacificEducationLanguage"
                );

            if (savedLanguage) {
                state.workspace.language =
                    savedLanguage;
            }

        } catch (error) {

            console.warn(
                "Language restoration unavailable."
            );
        }
    }


    /* =========================================
       NETWORK STATUS
    ========================================= */

    function updateNetworkStatus() {

        state.system.online =
            navigator.onLine;

        document.documentElement.dataset.network =
            state.system.online
                ? "online"
                : "offline";
    }


    window.addEventListener(
        "online",
        function () {

            state.system.online = true;

            updateNetworkStatus();

            audit("NETWORK_ONLINE");
        }
    );


    window.addEventListener(
        "offline",
        function () {

            state.system.online = false;

            updateNetworkStatus();

            audit("NETWORK_OFFLINE");
        }
    );


    /* =========================================
       STATE ACCESS
    ========================================= */

    function getState() {

        return JSON.parse(
            JSON.stringify(state)
        );
    }


    /* =========================================
       APPLICATION EVENTS
    ========================================= */

    function dispatch(eventName, detail) {

        if (!eventName) {
            return false;
        }

        document.dispatchEvent(
            new CustomEvent(
                "pacificEducation:" + eventName,
                {
                    detail: detail || {}
                }
            )
        );

        return true;
    }


    /* =========================================
       AUDIT HOOK
       No passwords, tokens, payment secrets,
       or private user records are stored here.
    ========================================= */

    function audit(action, details) {

        state.system.lastAudit = {
            action: action,
            timestamp: new Date().toISOString(),
            details: details || {}
        };

        dispatch("audit", {
            action: action,
            details: details || {}
        });
    }


    /* =========================================
       PUBLIC API
    ========================================= */

    window.PacificEducationApp = {

        version: APP_VERSION,

        initialize: initialize,

        setUser: setUser,

        clearUser: clearUser,

        setWorkspace: setWorkspace,

        setLanguage: setLanguage,

        getState: getState,

        dispatch: dispatch,

        audit: audit
    };


    /* =========================================
       START
    ========================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();
