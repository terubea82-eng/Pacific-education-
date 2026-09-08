/*
 * Pacific Education — Core Bridge
 * Version: 1.0.0
 */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    function getCore() {
        return window.PacificEducationCore || null;
    }

    function isReady() {
        const core = getCore();

        return !!(
            core &&
            typeof core.getState === "function" &&
            core.identity &&
            typeof core.identity.isAuthorized === "function"
        );
    }

    function isAuthorized() {
        const core = getCore();

        return !!(
            core &&
            core.identity &&
            typeof core.identity.isAuthorized === "function" &&
            core.identity.isAuthorized()
        );
    }

    function getState() {
        if (!isReady() || !isAuthorized()) {
            return null;
        }

        return getCore().getState();
    }

    function connect() {
        const core = getCore();

        if (!core) {
            return {
                success: false,
                reason: "core_unavailable"
            };
        }

        if (!isAuthorized()) {
            return {
                success: false,
                reason: "authorization_required"
            };
        }

        if (
            typeof core.connectModules === "function"
        ) {
            core.connectModules();
        }

        return {
            success: true,
            version: VERSION
        };
    }

    window.PacificEducationCoreBridge = Object.freeze({
        version: VERSION,
        isReady: isReady,
        isAuthorized: isAuthorized,
        getState: getState,
        connect: connect
    });

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationCoreBridgeLoaded",
            {
                detail: {
                    version: VERSION
                }
            }
        )
    );

})();
