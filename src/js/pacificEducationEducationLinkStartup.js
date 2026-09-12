/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK STARTUP
 * VERSION 1.2.1
 * =========================================================
 *
 * Secure startup order:
 *
 * Verified Education Relationship
 *        ↓
 * Secure Link Authorization
 *        ↓
 * Secure Communication
 *        ↓
 * Education Link Bridge
 *        ↓
 * Education Link Center
 *
 * Security:
 * - Required APIs are verified before readiness.
 * - Relationship verification requires BOTH:
 *   getUserRelationships
 *   checkRelationship
 * - Verified relationship loads before authorization.
 * - Authorization loads before communication.
 * - Communication loads before bridge.
 * - Bridge loads before center.
 * - Link availability does not grant information access.
 * - No passwords, API keys or tokens are exposed.
 * - Production backend authorization is required.
 *
 * Prototype only.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.2.1";

    const MODULES = Object.freeze([
        {
            path:
                "js/pacificEducationVerifiedEducationRelationship.js",
            global:
                "PacificEducationVerifiedEducationRelationship",
            requiredMethods: [
                "getUserRelationships",
                "checkRelationship"
            ]
        },

        {
            path:
                "../js/pacificEducationSecureLinkAuthorization.js",
            global:
                "PacificEducationSecureLinkAuthorization",
            requiredMethods: [
                "requestLink",
                "approveLink",
                "authorizeAccess",
                "revokeLink",
                "getUserLinks"
            ]
        },

        {
            path:
                "../js/pacificEducationSecureCommunication.js",
            global:
                "PacificEducationSecureCommunication",
            requiredMethods: [
                "createConversation",
                "sendMessage",
                "getConversation",
                "closeConversation"
            ]
        },

        {
            path:
                "js/pacificEducationEducationLinkBridge.js",
            global:
                "PacificEducationEducationLinkBridge",
            requiredMethods: [
                "requestConnection",
                "approveConnection",
                "checkAccess",
                "revokeConnection"
            ]
        },

        {
            path:
                "js/pacificEducationEducationLinkCenter.js",
            global:
                "PacificEducationEducationLinkCenter",
            requiredMethods: [
                "requestLink",
                "approveLink",
                "checkAccess",
                "revokeLink",
                "getUserLinks",
                "getDashboardModel",
                "getStatus"
            ]
        }
    ]);

    let started = false;
    let loading = false;

    function getGlobal(name) {
        return window[name] || null;
    }

    function moduleReady(module) {
        const target = getGlobal(module.global);

        if (!target) {
            return false;
        }

        return module.requiredMethods.every(
            method =>
                typeof target[method] === "function"
        );
    }

    function findScript(src) {
        return Array.from(
            document.querySelectorAll("script[src]")
        ).find(
            script =>
                script.getAttribute("src") === src
        ) || null;
    }

    function loadScript(module) {
        return new Promise(
            (resolve, reject) => {

                if (moduleReady(module)) {
                    resolve(module.path);
                    return;
                }

                let existing =
                    findScript(module.path);

                if (
                    existing &&
                    existing.dataset &&
                    existing.dataset
                        .pacificEducationLoadFailed ===
                        "true"
                ) {
                    existing.remove();
                    existing = null;
                }

                if (existing) {

                    const finish = () => {
                        existing.dataset
                            .pacificEducationLoaded =
                            "true";

                        if (moduleReady(module)) {
                            resolve(module.path);
                        } else {
                            reject(
                                new Error(
                                    `Loaded ${module.path} ` +
                                    "but its required API is unavailable."
                                )
                            );
                        }
                    };

                    const fail = () => {
                        existing.dataset
                            .pacificEducationLoadFailed =
                            "true";

                        reject(
                            new Error(
                                `Failed to load ${module.path}`
                            )
                        );
                    };

                    existing.addEventListener(
                        "load",
                        finish,
                        { once: true }
                    );

                    existing.addEventListener(
                        "error",
                        fail,
                        { once: true }
                    );

                    if (moduleReady(module)) {
                        resolve(module.path);
                    }

                    return;
                }

                const script =
                    document.createElement(
                        "script"
                    );

                script.src = module.path;
                script.async = false;

                script.addEventListener(
                    "load",
                    () => {

                        script.dataset
                            .pacificEducationLoaded =
                            "true";

                        if (moduleReady(module)) {
                            resolve(module.path);
                        } else {
                            script.dataset
                                .pacificEducationLoadFailed =
                                "true";

                            reject(
                                new Error(
                                    `Loaded ${module.path} ` +
                                    "but its required API is unavailable."
                                )
                            );
                        }
                    },
                    { once: true }
                );

                script.addEventListener(
                    "error",
                    () => {

                        script.dataset
                            .pacificEducationLoadFailed =
                            "true";

                        reject(
                            new Error(
                                `Failed to load ${module.path}`
                            )
                        );
                    },
                    { once: true }
                );

                const parent =
                    document.head ||
                    document.documentElement ||
                    document.body;

                if (!parent) {
                    reject(
                        new Error(
                            "Document container unavailable."
                        )
                    );
                    return;
                }

                parent.appendChild(script);
            }
        );
    }

    function checkModules() {
        const status = {};

        for (const module of MODULES) {
            status[module.global] =
                moduleReady(module);
        }

        status.ready =
            MODULES.every(
                module =>
                    status[module.global] === true
            );

        return Object.freeze(status);
    }

    function dispatchReady(status) {
        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationEducationLinkReady",
                {
                    detail: {
                        version: VERSION,
                        modules: status,
                        ready: true,
                        verifiedRelationshipRequired:
                            true,
                        authorizationRequired:
                            true,
                        permissionRequired:
                            true,
                        automaticInformationAccess:
                            false,
                        productionBackendRequired:
                            true
                    }
                }
            )
        );
    }

    function dispatchError(
        error,
        status = null
    ) {
        const message =
            error &&
            error.message
                ? error.message
                : String(error);

        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationEducationLinkError",
                {
                    detail: {
                        version: VERSION,
                        error: message,
                        status,
                        ready: false,
                        verifiedRelationshipRequired:
                            true,
                        productionBackendRequired:
                            true
                    }
                }
            )
        );
    }

    async function start() {

        if (started) {
            return getStatus();
        }

        if (loading) {
            return getStatus();
        }

        loading = true;

        try {

            for (const module of MODULES) {
                await loadScript(module);
            }

            const status =
                checkModules();

            if (!status.ready) {

                const error =
                    new Error(
                        "One or more Education Link " +
                        "modules failed API verification."
                    );

                dispatchError(
                    error,
                    status
                );

                return Object.freeze({
                    version: VERSION,
                    started: false,
                    loading: false,
                    ready: false,
                    modules: status,
                    error: error.message,
                    verifiedRelationshipRequired:
                        true,
                    productionBackendRequired:
                        true
                });
            }

            started = true;

            dispatchReady(status);

            return getStatus();

        } catch (error) {

            const status =
                checkModules();

            console.error(
                "Pacific Education Education Link " +
                "startup failed.",
                error
            );

            dispatchError(
                error,
                status
            );

            return Object.freeze({
                version: VERSION,
                started: false,
                loading: false,
                ready: false,
                modules: status,
                error:
                    error &&
                    error.message
                        ? error.message
                        : String(error),
                verifiedRelationshipRequired:
                    true,
                productionBackendRequired:
                    true
            });

        } finally {
            loading = false;
        }
    }

    function getStatus() {
        const modules =
            checkModules();

        return Object.freeze({
            version: VERSION,
            started,
            loading,

            relationshipReady:
                modules
                    .PacificEducationVerifiedEducationRelationship ===
                true,

            authorizationReady:
                modules
                    .PacificEducationSecureLinkAuthorization ===
                true,

            communicationReady:
                modules
                    .PacificEducationSecureCommunication ===
                true,

            bridgeReady:
                modules
                    .PacificEducationEducationLinkBridge ===
                true,

            centerReady:
                modules
                    .PacificEducationEducationLinkCenter ===
                true,

            ready:
                Boolean(
                    started &&
                    modules.ready
                ),

            verifiedRelationshipRequired:
                true,

            authorizationRequired:
                true,

            permissionRequired:
                true,

            automaticInformationAccess:
                false,

            prototypeOnly:
                true,

            productionBackendRequired:
                true
        });
    }

    window.PacificEducationEducationLinkStartup =
        Object.freeze({
            version: VERSION,
            start,
            getStatus
        });

})();
