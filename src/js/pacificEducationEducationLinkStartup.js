/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK STARTUP
 * VERSION 1.2.2
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
 * Reliability:
 * - Existing scripts are re-checked immediately.
 * - Already-completed load events are not required.
 * - Existing-script waits have a bounded timeout.
 * - Failed script instances may be safely removed.
 * - Duplicate module loading is prevented.
 *
 * Prototype only.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.2.2";

    const MODULE_LOAD_TIMEOUT_MS = 8000;

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


    /*
     * =======================================================
     * BASIC HELPERS
     * =======================================================
     */

    function getGlobal(name) {

        return window[name] || null;
    }


    function moduleReady(module) {

        const target =
            getGlobal(
                module.global
            );

        if (!target) {
            return false;
        }

        return module.requiredMethods.every(
            method =>
                typeof target[method] ===
                "function"
        );
    }


    function findScript(src) {

        return Array.from(
            document.querySelectorAll(
                "script[src]"
            )
        ).find(
            script =>
                script.getAttribute(
                    "src"
                ) === src
        ) || null;
    }


    /*
     * =======================================================
     * CONTROLLED SCRIPT LOADER
     * =======================================================
     */

    function loadScript(module) {

        return new Promise(
            (resolve, reject) => {

                /*
                 * First check whether the module is already
                 * completely available.
                 *
                 * This prevents waiting for a load event
                 * that has already happened.
                 */

                if (
                    moduleReady(
                        module
                    )
                ) {

                    resolve(
                        module.path
                    );

                    return;
                }


                let existing =
                    findScript(
                        module.path
                    );


                /*
                 * Remove a script that has already been
                 * marked as failed by this startup layer.
                 */

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


                /*
                 * Existing script instance.
                 */

                if (existing) {

                    let settled = false;

                    const cleanup =
                        () => {

                            existing.removeEventListener(
                                "load",
                                finish
                            );

                            existing.removeEventListener(
                                "error",
                                fail
                            );

                            clearTimeout(
                                timeout
                            );
                        };


                    const succeed =
                        () => {

                            if (
                                settled
                            ) {
                                return;
                            }

                            settled = true;

                            cleanup();

                            existing.dataset
                                .pacificEducationLoaded =
                                "true";

                            resolve(
                                module.path
                            );
                        };


                    const fail =
                        () => {

                            if (
                                settled
                            ) {
                                return;
                            }

                            settled = true;

                            cleanup();

                            existing.dataset
                                .pacificEducationLoadFailed =
                                "true";

                            reject(
                                new Error(
                                    `Failed to load ${module.path}`
                                )
                            );
                        };


                    const finish =
                        () => {

                            if (
                                settled
                            ) {
                                return;
                            }

                            /*
                             * A load event alone is NOT
                             * considered sufficient.
                             *
                             * The actual exported API must
                             * be present.
                             */

                            if (
                                moduleReady(
                                    module
                                )
                            ) {

                                succeed();

                                return;
                            }


                            settled = true;

                            cleanup();

                            existing.dataset
                                .pacificEducationLoadFailed =
                                "true";

                            reject(
                                new Error(
                                    `Loaded ${module.path} but its required API is unavailable.`
                                )
                            );
                        };


                    const timeout =
                        setTimeout(
                            () => {

                                if (
                                    settled
                                ) {
                                    return;
                                }

                                settled = true;

                                cleanup();

                                existing.dataset
                                    .pacificEducationLoadFailed =
                                    "true";

                                reject(
                                    new Error(
                                        `Timed out waiting for ${module.path}.`
                                    )
                                );

                            },
                            MODULE_LOAD_TIMEOUT_MS
                        );


                    /*
                     * IMPORTANT v1.2.2 FIX:
                     *
                     * The existing script may have completed
                     * loading before listeners were attached.
                     *
                     * Check the API immediately before waiting
                     * for future events.
                     */

                    if (
                        moduleReady(
                            module
                        )
                    ) {

                        settled = true;

                        cleanup();

                        resolve(
                            module.path
                        );

                        return;
                    }


                    existing.addEventListener(
                        "load",
                        finish,
                        {
                            once: true
                        }
                    );


                    existing.addEventListener(
                        "error",
                        fail,
                        {
                            once: true
                        }
                    );


                    /*
                     * Re-check once more after listeners are
                     * attached to reduce a race where the API
                     * becomes available between the first check
                     * and listener registration.
                     */

                    if (
                        moduleReady(
                            module
                        )
                    ) {

                        succeed();

                    }

                    return;
                }


                /*
                 * =================================================
                 * NEW CONTROLLED SCRIPT INSTANCE
                 * =================================================
                 */

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    module.path;

                script.async =
                    false;


                let settled =
                    false;


                const cleanup =
                    () => {

                        script.removeEventListener(
                            "load",
                            finish
                        );

                        script.removeEventListener(
                            "error",
                            fail
                        );

                        clearTimeout(
                            timeout
                        );
                    };


                const succeed =
                    () => {

                        if (
                            settled
                        ) {
                            return;
                        }

                        settled = true;

                        cleanup();

                        script.dataset
                            .pacificEducationLoaded =
                            "true";

                        resolve(
                            module.path
                        );
                    };


                const fail =
                    () => {

                        if (
                            settled
                        ) {
                            return;
                        }

                        settled = true;

                        cleanup();

                        script.dataset
                            .pacificEducationLoadFailed =
                            "true";

                        reject(
                            new Error(
                                `Failed to load ${module.path}`
                            )
                        );
                    };


                const finish =
                    () => {

                        if (
                            settled
                        ) {
                            return;
                        }


                        if (
                            moduleReady(
                                module
                            )
                        ) {

                            succeed();

                            return;
                        }


                        settled = true;

                        cleanup();

                        script.dataset
                            .pacificEducationLoadFailed =
                            "true";

                        reject(
                            new Error(
                                `Loaded ${module.path} but its required API is unavailable.`
                            )
                        );
                    };


                const timeout =
                    setTimeout(
                        () => {

                            if (
                                settled
                            ) {
                                return;
                            }

                            settled = true;

                            cleanup();

                            script.dataset
                                .pacificEducationLoadFailed =
                                "true";

                            script.remove();

                            reject(
                                new Error(
                                    `Timed out waiting for ${module.path}.`
                                )
                            );

                        },
                        MODULE_LOAD_TIMEOUT_MS
                    );


                script.addEventListener(
                    "load",
                    finish,
                    {
                        once: true
                    }
                );


                script.addEventListener(
                    "error",
                    fail,
                    {
                        once: true
                    }
                );


                const parent =
                    document.head ||
                    document.documentElement ||
                    document.body;


                if (!parent) {

                    settled = true;

                    cleanup();

                    reject(
                        new Error(
                            "Document container unavailable."
                        )
                    );

                    return;
                }


                parent.appendChild(
                    script
                );
            }
        );
    }


    /*
     * =======================================================
     * MODULE STATUS
     * =======================================================
     */

    function checkModules() {

        const status = {};


        for (
            const module of MODULES
        ) {

            status[
                module.global
            ] =
                moduleReady(
                    module
                );
        }


        status.ready =
            MODULES.every(
                module =>
                    status[
                        module.global
                    ] === true
            );


        return Object.freeze(
            status
        );
    }


    /*
     * =======================================================
     * READY EVENT
     * =======================================================
     */

    function dispatchReady(
        status
    ) {

        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationEducationLinkReady",
                {
                    detail: {

                        version:
                            VERSION,

                        modules:
                            status,

                        ready:
                            true,

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


    /*
     * =======================================================
     * ERROR EVENT
     * =======================================================
     */

    function dispatchError(
        error,
        status = null
    ) {

        const message =
            error &&
            error.message
                ? error.message
                : String(
                    error
                );


        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationEducationLinkError",
                {
                    detail: {

                        version:
                            VERSION,

                        error:
                            message,

                        status,

                        ready:
                            false,

                        verifiedRelationshipRequired:
                            true,

                        productionBackendRequired:
                            true
                    }
                }
            )
        );
    }


    /*
     * =======================================================
     * STARTUP
     * =======================================================
     */

    async function start() {

        if (started) {

            return getStatus();
        }


        if (loading) {

            return getStatus();
        }


        loading =
            true;


        try {

            /*
             * Strict sequential startup.
             *
             * Security dependencies must load before
             * dependent modules.
             */

            for (
                const module of MODULES
            ) {

                await loadScript(
                    module
                );
            }


            const status =
                checkModules();


            if (
                !status.ready
            ) {

                const error =
                    new Error(
                        "One or more Education Link modules failed API verification."
                    );


                dispatchError(
                    error,
                    status
                );


                return Object.freeze({

                    version:
                        VERSION,

                    started:
                        false,

                    loading:
                        false,

                    ready:
                        false,

                    modules:
                        status,

                    error:
                        error.message,

                    verifiedRelationshipRequired:
                        true,

                    productionBackendRequired:
                        true
                });
            }


            started =
                true;


            dispatchReady(
                status
            );


            return getStatus();


        } catch (
            error
        ) {

            const status =
                checkModules();


            console.error(
                "Pacific Education Education Link startup failed.",
                error
            );


            dispatchError(
                error,
                status
            );


            return Object.freeze({

                version:
                    VERSION,

                started:
                    false,

                loading:
                    false,

                ready:
                    false,

                modules:
                    status,

                error:
                    error &&
                    error.message
                        ? error.message
                        : String(
                            error
                        ),

                verifiedRelationshipRequired:
                    true,

                productionBackendRequired:
                    true
            });


        } finally {

            loading =
                false;
        }
    }


    /*
     * =======================================================
     * STATUS
     * =======================================================
     */

    function getStatus() {

        const modules =
            checkModules();


        return Object.freeze({

            version:
                VERSION,

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


    /*
     * =======================================================
     * PUBLIC API
     * =======================================================
     */

    window.PacificEducationEducationLinkStartup =
        Object.freeze({

            version:
                VERSION,

            start,

            getStatus
        });


})();
