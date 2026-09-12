/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK HEALTH MONITOR
 * =========================================================
 * Version: 1.0.0
 * Purpose:
 *   Verify that the live Education Link security chain is
 *   loaded and connected correctly.
 *
 * IMPORTANT:
 *   - Diagnostic/verification layer only.
 *   - Does NOT replace security modules.
 *   - Does NOT grant permissions.
 *   - Does NOT approve links.
 *   - Does NOT bypass authorization.
 *   - Does NOT send real communication.
 * =========================================================
 */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    const MODULE_NAME =
        "PacificEducationEducationLinkHealthMonitor";

    const REQUIRED_APIS = {
        relationship: [
            "PacificEducationVerifiedEducationRelationship"
        ],

        authorization: [
            "PacificEducationSecureLinkAuthorization"
        ],

        communication: [
            "PacificEducationSecureCommunication"
        ],

        bridge: [
            "PacificEducationEducationLinkBridge"
        ],

        center: [
            "PacificEducationEducationLinkCenter"
        ]
    };

    function getGlobal(name) {
        try {
            return window[name] || null;
        } catch (error) {
            return null;
        }
    }

    function hasObject(name) {
        const value = getGlobal(name);

        return !!value &&
            typeof value === "object";
    }

    function hasMethod(object, methodName) {
        return !!object &&
            typeof object[methodName] === "function";
    }

    function inspectModule(name) {
        const module = getGlobal(name);

        return {
            name: name,
            loaded: !!module,
            type: module
                ? typeof module
                : "missing"
        };
    }

    function inspectRequiredApis() {
        const result = {
            relationship: [],
            authorization: [],
            communication: [],
            bridge: [],
            center: []
        };

        Object.keys(REQUIRED_APIS).forEach(function (group) {
            result[group] =
                REQUIRED_APIS[group].map(inspectModule);
        });

        return result;
    }

    function checkRelationship() {
        const api =
            getGlobal(
                "PacificEducationVerifiedEducationRelationship"
            );

        return {
            loaded: !!api,
            checkRelationship:
                hasMethod(api, "checkRelationship"),
            verifyRelationship:
                hasMethod(api, "verifyRelationship"),
            getUserRelationships:
                hasMethod(api, "getUserRelationships")
        };
    }

    function checkAuthorization() {
        const api =
            getGlobal(
                "PacificEducationSecureLinkAuthorization"
            );

        return {
            loaded: !!api,
            requestLink:
                hasMethod(api, "requestLink"),
            approveLink:
                hasMethod(api, "approveLink"),
            authorizeAccess:
                hasMethod(api, "authorizeAccess"),
            revokeLink:
                hasMethod(api, "revokeLink"),
            getUserLinks:
                hasMethod(api, "getUserLinks"),
            getStatus:
                hasMethod(api, "getStatus")
        };
    }

    function checkCommunication() {
        const api =
            getGlobal(
                "PacificEducationSecureCommunication"
            );

        return {
            loaded: !!api,
            openConversation:
                hasMethod(api, "openConversation"),
            sendMessage:
                hasMethod(api, "sendMessage"),
            getStatus:
                hasMethod(api, "getStatus")
        };
    }

    function checkBridge() {
        const api =
            getGlobal(
                "PacificEducationEducationLinkBridge"
            );

        return {
            loaded: !!api,
            requestConnection:
                hasMethod(api, "requestConnection"),
            approveConnection:
                hasMethod(api, "approveConnection"),
            checkAccess:
                hasMethod(api, "checkAccess"),
            revokeConnection:
                hasMethod(api, "revokeConnection"),
            openConversation:
                hasMethod(api, "openConversation"),
            sendAuthorizedMessage:
                hasMethod(api, "sendAuthorizedMessage"),
            getUserLinks:
                hasMethod(api, "getUserLinks"),
            getStatus:
                hasMethod(api, "getStatus")
        };
    }

    function checkCenter() {
        const api =
            getGlobal(
                "PacificEducationEducationLinkCenter"
            );

        return {
            loaded: !!api,
            requestLink:
                hasMethod(api, "requestLink"),
            approveLink:
                hasMethod(api, "approveLink"),
            checkAccess:
                hasMethod(api, "checkAccess"),
            revokeLink:
                hasMethod(api, "revokeLink"),
            getUserLinks:
                hasMethod(api, "getUserLinks"),
            getUserRelationships:
                hasMethod(api, "getUserRelationships"),
            getDashboardModel:
                hasMethod(api, "getDashboardModel"),
            getStatus:
                hasMethod(api, "getStatus")
        };
    }

    function checkStartup() {
        const api =
            getGlobal(
                "PacificEducationEducationLinkStartup"
            );

        return {
            loaded: !!api,
            start:
                hasMethod(api, "start"),
            getStatus:
                hasMethod(api, "getStatus")
        };
    }

    function evaluateConnection() {
        const relationship =
            checkRelationship();

        const authorization =
            checkAuthorization();

        const communication =
            checkCommunication();

        const bridge =
            checkBridge();

        const center =
            checkCenter();

        const startup =
            checkStartup();

        const requiredChecks = [
            relationship.loaded &&
            relationship.checkRelationship,

            authorization.loaded &&
            authorization.requestLink &&
            authorization.approveLink &&
            authorization.authorizeAccess &&
            authorization.revokeLink,

            communication.loaded &&
            communication.openConversation &&
            communication.sendMessage,

            bridge.loaded &&
            bridge.requestConnection &&
            bridge.approveConnection &&
            bridge.checkAccess &&
            bridge.revokeConnection,

            center.loaded &&
            center.requestLink &&
            center.approveLink &&
            center.checkAccess &&
            center.revokeLink &&
            center.getDashboardModel,

            startup.loaded &&
            startup.start
        ];

        const healthy =
            requiredChecks.every(Boolean);

        return {
            healthy: healthy,

            status: healthy
                ? "HEALTHY"
                : "INCOMPLETE",

            modules: {
                relationship: relationship,
                authorization: authorization,
                communication: communication,
                bridge: bridge,
                center: center,
                startup: startup
            },

            securityPrinciples: {
                authorizationRequired: true,
                communicationPermissionRequired: true,
                bridgeRequired: true,
                relationshipVerificationRequired: true,
                centerRequiresBridge: true,
                diagnosticOnly: true
            }
        };
    }

    function getStatus() {
        const evaluation =
            evaluateConnection();

        return {
            module: MODULE_NAME,
            version: VERSION,

            healthy:
                evaluation.healthy,

            status:
                evaluation.status,

            checkedAt:
                new Date().toISOString(),

            evaluation:
                evaluation
        };
    }

    function runHealthCheck() {
        const result =
            getStatus();

        try {
            window.dispatchEvent(
                new CustomEvent(
                    "pacificEducationEducationLinkHealthChecked",
                    {
                        detail: result
                    }
                )
            );
        } catch (error) {
            // Diagnostic event failure must never
            // interfere with the application.
        }

        return result;
    }

    const publicAPI = Object.freeze({
        version: VERSION,

        getStatus:
            getStatus,

        runHealthCheck:
            runHealthCheck,

        evaluateConnection:
            evaluateConnection
    });

    window.PacificEducationEducationLinkHealthMonitor =
        publicAPI;

    /*
     * Do not automatically start security operations.
     *
     * This monitor only checks the already-loaded APIs.
     */
    try {
        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationEducationLinkHealthMonitorReady",
                {
                    detail: {
                        module: MODULE_NAME,
                        version: VERSION
                    }
                }
            )
        );
    } catch (error) {
        // Never block application startup.
    }

})();
