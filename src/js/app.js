/* =========================================
   PACIFIC EDUCATION — MAIN APPLICATION SHELL
   File: src/js/app.js
   Version: 1.1.0

   PURPOSE
   -------
   Connect the visible application shell to
   Pacific Education Core without creating a
   second competing education-state authority.

   SECURITY PRINCIPLES
   -------------------
   - Pacific Education Core is the preferred
     authority for protected education state.
   - Browser localStorage is compatibility
     storage only and is never treated as proof
     of authorization.
   - No passwords, authentication tokens,
     payment secrets, API keys or private
     credentials are stored here.
   - Application actions do not bypass Core
     authorization.
========================================= */

(function (window, document) {

    "use strict";


    const APP_VERSION = "1.1.0";


    /* =========================================
       APPLICATION STATE
    ========================================= */

    const state = {

        initialized: false,

        user: null,

        workspace: {

            currentPage: "home",

            language: "en"
        },

        system: {

            online:
                typeof navigator !== "undefined"
                    ? navigator.onLine
                    : true,

            lastAudit: null,

            coreConnected: false,

            authorized: false
        }
    };


    /* =========================================
       CORE ACCESS
    ========================================= */

    function getCore() {

        return (
            window.PacificEducationCore ||
            null
        );
    }


    function coreAvailable() {

        const core = getCore();

        return !!(
            core &&
            typeof core === "object"
        );
    }


    function coreAuthorized() {

        const core = getCore();

        if (
            !core ||
            !core.identity ||
            typeof core.identity.isAuthorized !==
                "function"
        ) {

            return false;
        }

        try {

            return (
                core.identity.isAuthorized() === true
            );

        } catch (error) {

            console.warn(
                "Pacific Education Core authorization check unavailable."
            );

            return false;
        }
    }


    function updateCoreStatus() {

        state.system.coreConnected =
            coreAvailable();

        state.system.authorized =
            coreAuthorized();

        return {

            coreConnected:
                state.system.coreConnected,

            authorized:
                state.system.authorized
        };
    }


    /* =========================================
       AUTHORIZATION GUARD
    ========================================= */

    function requireAuthorization(actionName) {

        const core = getCore();

        if (!coreAvailable()) {

            audit(
                "CORE_UNAVAILABLE",
                {
                    action:
                        actionName || "unknown"
                }
            );

            return false;
        }

        if (!coreAuthorized()) {

            audit(
                "AUTHORIZATION_REQUIRED",
                {
                    action:
                        actionName || "unknown"
                }
            );

            return false;
        }

        return true;
    }


    /* =========================================
       INITIALIZE APPLICATION
    ========================================= */

    function initialize() {

        if (state.initialized) {

            updateCoreStatus();

            return getState();
        }

        state.initialized = true;

        updateNetworkStatus();

        restoreSafeLanguage();

        updateCoreStatus();

        audit(
            "APPLICATION_INITIALIZED",
            {
                version: APP_VERSION,
                coreConnected:
                    state.system.coreConnected,
                authorized:
                    state.system.authorized
            }
        );

        console.info(
            "Pacific Education initialized — version",
            APP_VERSION
        );

        return getState();
    }


    /* =========================================
       USER SESSION
    ========================================= */

    function setUser(user) {

        if (
            !user ||
            typeof user !== "object"
        ) {

            return false;
        }

        /*
         * Do not copy confidential authentication
         * material into the application shell.
         *
         * Only ordinary display/session fields
         * are retained here.
         */

        state.user = {

            id:
                typeof user.id === "string"
                    ? user.id
                    : null,

            role:
                typeof user.role === "string"
                    ? user.role
                    : "student",

            name:
                typeof user.name === "string"
                    ? user.name
                    : "",

            country:
                typeof user.country === "string"
                    ? user.country
                    : null,

            authorized:
                user.authorized === true
        };


        updateCoreStatus();


        audit(
            "USER_SESSION_SET",
            {
                role:
                    state.user.role,

                authorized:
                    state.user.authorized
            }
        );


        return true;
    }


    function clearUser() {

        state.user = null;

        updateCoreStatus();

        audit(
            "USER_SESSION_CLEARED"
        );

        return true;
    }


    function getUser() {

        if (!state.user) {

            return null;
        }

        return {

            id:
                state.user.id,

            role:
                state.user.role,

            name:
                state.user.name,

            country:
                state.user.country,

            authorized:
                state.user.authorized
        };
    }


    /* =========================================
       WORKSPACE
    ========================================= */

    function setWorkspace(page) {

        if (
            !page ||
            typeof page !== "string"
        ) {

            return false;
        }

        state.workspace.currentPage =
            page;

        audit(
            "WORKSPACE_CHANGED",
            {
                page: page
            }
        );

        return true;
    }


    function getWorkspace() {

        return {

            currentPage:
                state.workspace.currentPage,

            language:
                state.workspace.language
        };
    }


    /* =========================================
       LANGUAGE
    ========================================= */

    function setLanguage(language) {

        if (
            !language ||
            typeof language !== "string"
        ) {

            return false;
        }

        const normalized =
            language
                .trim()
                .toLowerCase();


        if (!normalized) {

            return false;
        }


        state.workspace.language =
            normalized;


        /*
         * Compatibility preference only.
         * This is not authorization data.
         */

        try {

            localStorage.setItem(
                "pacificEducationLanguage",
                normalized
            );

        } catch (error) {

            console.warn(
                "Language preference could not be stored."
            );
        }


        audit(
            "LANGUAGE_CHANGED",
            {
                language:
                    normalized
            }
        );


        return true;
    }


    function restoreSafeLanguage() {

        try {

            const savedLanguage =
                localStorage.getItem(
                    "pacificEducationLanguage"
                );


            if (
                typeof savedLanguage === "string" &&
                savedLanguage.trim()
            ) {

                state.workspace.language =
                    savedLanguage
                        .trim()
                        .toLowerCase();
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
            typeof navigator !== "undefined"
                ? navigator.onLine
                : true;


        if (
            document &&
            document.documentElement
        ) {

            document.documentElement.dataset.network =
                state.system.online
                    ? "online"
                    : "offline";
        }


        return state.system.online;
    }


    window.addEventListener(
        "online",
        function () {

            state.system.online = true;

            updateNetworkStatus();

            audit(
                "NETWORK_ONLINE"
            );
        }
    );


    window.addEventListener(
        "offline",
        function () {

            state.system.online = false;

            updateNetworkStatus();

            audit(
                "NETWORK_OFFLINE"
            );
        }
    );


    /* =========================================
       CORE STATE SNAPSHOT
    ========================================= */

    function getCoreState() {

        const core = getCore();

        if (
            !core ||
            typeof core.getState !==
                "function"
        ) {

            return null;
        }


        try {

            return core.getState();

        } catch (error) {

            console.warn(
                "Pacific Education Core state unavailable."
            );

            return null;
        }
    }


    /* =========================================
       APPLICATION STATE ACCESS
    ========================================= */

    function getState() {

        updateCoreStatus();


        const applicationState = {

            initialized:
                state.initialized,

            user:
                getUser(),

            workspace:
                getWorkspace(),

            system: {

                online:
                    state.system.online,

                lastAudit:
                    state.system.lastAudit,

                coreConnected:
                    state.system.coreConnected,

                authorized:
                    state.system.authorized
            }
        };


        return JSON.parse(
            JSON.stringify(
                applicationState
            )
        );
    }


    /* =========================================
       AUTHORITATIVE EDUCATION STATE
    ========================================= */

    function getEducationState() {

        const coreState =
            getCoreState();


        if (coreState) {

            return JSON.parse(
                JSON.stringify(
                    coreState
                )
            );
        }


        return null;
    }


    /* =========================================
       SAFE APPLICATION ACTION
    ========================================= */

    function performAuthorizedAction(
        actionName,
        callback
    ) {

        if (
            typeof callback !==
                "function"
        ) {

            return {

                success: false,

                reason:
                    "invalid_callback"
            };
        }


        if (
            !requireAuthorization(
                actionName
            )
        ) {

            return {

                success: false,

                reason:
                    "authorization_required"
            };
        }


        try {

            const result =
                callback(
                    getCore()
                );


            audit(
                "AUTHORIZED_ACTION_COMPLETED",
                {
                    action:
                        actionName
                }
            );


            return {

                success: true,

                result:
                    result
            };

        } catch (error) {

            audit(
                "AUTHORIZED_ACTION_FAILED",
                {
                    action:
                        actionName
                }
            );


            console.error(
                "Pacific Education authorized action failed.",
                error
            );


            return {

                success: false,

                reason:
                    "action_failed"
            };
        }
    }


    /* =========================================
       APPLICATION EVENTS
    ========================================= */

    function dispatch(
        eventName,
        detail
    ) {

        if (
            !eventName ||
            typeof eventName !==
                "string"
        ) {

            return false;
        }


        if (
            typeof document.dispatchEvent !==
                "function"
        ) {

            return false;
        }


        try {

            document.dispatchEvent(

                new CustomEvent(

                    "pacificEducation:" +
                        eventName,

                    {

                        detail:
                            detail || {}
                    }
                )
            );


            return true;

        } catch (error) {

            console.warn(
                "Pacific Education event dispatch unavailable."
            );

            return false;
        }
    }


    /* =========================================
       AUDIT HOOK
       -----------------------------------------
       Do not place passwords, tokens, payment
       secrets, API keys or private records here.
    ========================================= */

    function audit(
        action,
        details
    ) {

        if (
            !action ||
            typeof action !==
                "string"
        ) {

            return false;
        }


        state.system.lastAudit = {

            action:
                action,

            timestamp:
                new Date().toISOString(),

            details:
                details || {}
        };


        dispatch(
            "audit",
            {
                action:
                    action,

                details:
                    details || {}
            }
        );


        return true;
    }


    /* =========================================
       CONNECTION STATUS
    ========================================= */

    function getConnectionStatus() {

        const status =
            updateCoreStatus();


        return {

            application:
                true,

            coreConnected:
                status.coreConnected,

            authorized:
                status.authorized,

            localStorageTrusted:
                false,

            secretsStored:
                false,

            automaticInformationAccess:
                false
        };
    }


    /* =========================================
       PUBLIC API
    ========================================= */

    window.PacificEducationApp = {

        version:
            APP_VERSION,

        initialize:
            initialize,

        setUser:
            setUser,

        clearUser:
            clearUser,

        getUser:
            getUser,

        setWorkspace:
            setWorkspace,

        getWorkspace:
            getWorkspace,

        setLanguage:
            setLanguage,

        getState:
            getState,

        getCoreState:
            getCoreState,

        getEducationState:
            getEducationState,

        requireAuthorization:
            requireAuthorization,

        performAuthorizedAction:
            performAuthorizedAction,

        dispatch:
            dispatch,

        audit:
            audit,

        getConnectionStatus:
            getConnectionStatus
    };


    /* =========================================
       START
    ========================================= */

    if (
        document.readyState ===
            "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }


})(window, document);


/* Firebase backend bridge: server authority, no secrets in browser. */
(function () {
    "use strict";
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = src; script.async = false;
            script.onload = resolve; script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    function status(message) {
        var el = document.getElementById("pacificEducationBackendStatus");
        if (el) el.textContent = message;
    }
    function installUI() {
        if (document.getElementById("pacificEducationBackend")) return;
        var section = document.createElement("section");
        section.id = "pacificEducationBackend";
        section.style.cssText = "border:2px solid #444;padding:16px;margin:16px 0;";
        section.innerHTML =
            "<h2>Pacific Education Account</h2>" +
            "<p id='pacificEducationBackendStatus'>Connecting to secure backend...</p>" +
            "<button type='button' id='pacificEducationGoogleLogin'>Sign in with Google</button>" +
            "<button type='button' id='pacificEducationGoogleLogout' style='display:none'>Sign out</button>" +
            "<button type='button' id='pacificEducationOwnerBootstrap' style='display:none'>Activate Owner Control</button>";
        var app = document.getElementById("app") || document.body;
        app.insertBefore(section, app.firstChild);

        document.getElementById("pacificEducationGoogleLogin").onclick = async function () {
            try { await window.PacificEducationFirebaseBackend.signInWithGoogle(); }
            catch (error) { status("Google sign-in failed: " + (error.message || "unknown error")); }
        };
        document.getElementById("pacificEducationGoogleLogout").onclick = async function () {
            try { await window.PacificEducationFirebaseBackend.signOut(); status("Signed out."); }
            catch (error) { status("Sign-out failed."); }
        };
        document.getElementById("pacificEducationOwnerBootstrap").onclick = async function () {
            try {
                await window.PacificEducationFirebaseBackend.bootstrapOwner();
                status("Owner activation completed. Sign out and sign in again.");
            } catch (error) { status("Owner activation denied: " + (error.message || "unknown error")); }
        };
    }
    async function start() {
        installUI();
        try {
            await loadScript("js/pacificEducationFirebaseConfig.js");
            await loadScript("js/pacificEducationFirebaseBackend.js");
            await window.PacificEducationFirebaseBackend.onAuthStateChanged(async function (user) {
                var login = document.getElementById("pacificEducationGoogleLogin");
                var logout = document.getElementById("pacificEducationGoogleLogout");
                var owner = document.getElementById("pacificEducationOwnerBootstrap");
                if (!user) {
                    if (login) login.style.display = "";
                    if (logout) logout.style.display = "none";
                    if (owner) owner.style.display = "none";
                    status("Not signed in.");
                    return;
                }
                if (login) login.style.display = "none";
                if (logout) logout.style.display = "";
                if (owner) owner.style.display = "";
                try {
                    await window.PacificEducationFirebaseBackend.upsertProfile({
                        displayName: user.displayName || "",
                        country: "Fiji"
                    });
                    status("Secure backend connected: " + (user.email || "account"));
                    if (window.PacificEducationApp) {
                        window.PacificEducationApp.setUser({
                            id: user.uid, name: user.displayName || "", authorized: true
                        });
                    }
                } catch (error) {
                    status("Signed in, but backend profile setup failed: " + (error.message || "unknown error"));
                }
            });
        } catch (error) {
            status("Backend configuration is not installed yet. Add src/js/pacificEducationFirebaseConfig.js.");
        }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
})();
