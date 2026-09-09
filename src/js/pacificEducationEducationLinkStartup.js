/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK STARTUP
 * =========================================================
 *
 * Version: 1.1.0
 *
 * Secure startup order:
 *
 * Identity
 *   ↓
 * Verified Education Relationship
 *   ↓
 * Secure Link Authorization
 *   ↓
 * Secure Communication
 *   ↓
 * Education Link Bridge
 *   ↓
 * Education Link Center
 *
 * Student • Teacher • Parent • Ministry
 *
 * Security:
 * - Verification layer loads before authorization.
 * - Authorization cannot activate an unverified relationship.
 * - Link availability does not grant information access.
 * - No passwords, API keys or tokens are exposed.
 * - Production backend authorization is required.
 *
 * Prototype only.
 * =========================================================
 */

(() => {

    "use strict";


    /* =====================================================
       VERSION
    ===================================================== */

    const VERSION = "1.1.0";


    /* =====================================================
       MODULE PATHS
    ===================================================== */

    const MODULES = Object.freeze([

        /*
         * Verified Education Relationship.
         *
         * MUST load before Secure Link Authorization.
         */
        "js/pacificEducationVerifiedEducationRelationship.js",

        /*
         * Secure Link Authorization.
         */
        "../js/pacificEducationSecureLinkAuthorization.js",

        /*
         * Secure Communication.
         */
        "../js/pacificEducationSecureCommunication.js",

        /*
         * Education Link Bridge.
         */
        "js/pacificEducationEducationLinkBridge.js",

        /*
         * Education Link Center.
         */
        "js/pacificEducationEducationLinkCenter.js"

    ]);


    /* =====================================================
       STARTUP STATE
    ===================================================== */

    let started = false;

    let loading = false;


    /* =====================================================
       FIND SCRIPT
    ===================================================== */

    function findScript(src) {

        return document.querySelector(
            `script[src="${src}"]`
        );

    }


    /* =====================================================
       LOAD SCRIPT
    ===================================================== */

    function loadScript(src) {

        return new Promise(
            (resolve, reject) => {

                const existing =
                    findScript(src);


                /*
                 * Script already exists.
                 */
                if (existing) {

                    /*
                     * Already marked as loaded.
                     */
                    if (
                        existing.dataset &&
                        existing.dataset
                            .pacificEducationLoaded ===
                            "true"
                    ) {

                        resolve(src);

                        return;

                    }


                    /*
                     * Existing script may still
                     * be loading.
                     */
                    existing.addEventListener(
                        "load",
                        () => {

                            existing.dataset
                                .pacificEducationLoaded =
                                "true";

                            resolve(src);

                        },
                        {
                            once: true
                        }
                    );


                    existing.addEventListener(
                        "error",
                        () => {

                            reject(
                                new Error(
                                    `Failed to load ${src}`
                                )
                            );

                        },
                        {
                            once: true
                        }
                    );

                    return;

                }


                /*
                 * Create script element.
                 */
                const script =
                    document.createElement(
                        "script"
                    );


                script.src = src;


                /*
                 * Preserve dependency order.
                 */
                script.async = false;


                /*
                 * Successful loading.
                 */
                script.addEventListener(
                    "load",
                    () => {

                        script.dataset
                            .pacificEducationLoaded =
                            "true";

                        resolve(src);

                    },
                    {
                        once: true
                    }
                );


                /*
                 * Loading failure.
                 */
                script.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                `Failed to load ${src}`
                            )
                        );

                    },
                    {
                        once: true
                    }
                );


                /*
                 * Add script to document.
                 */
                document.body.appendChild(
                    script
                );

            }
        );

    }


    /* =====================================================
       CHECK REQUIRED MODULES
    ===================================================== */

    function checkModules() {

        const status = {

            relationship:
                Boolean(
                    window
                        .PacificEducationVerifiedEducationRelationship
                ),

            authorization:
                Boolean(
                    window
                        .PacificEducationSecureLinkAuthorization
                ),

            communication:
                Boolean(
                    window
                        .PacificEducationSecureCommunication
                ),

            bridge:
                Boolean(
                    window
                        .PacificEducationEducationLinkBridge
                ),

            center:
                Boolean(
                    window
                        .PacificEducationEducationLinkCenter
                )

        };


        status.ready =
            status.relationship &&
            status.authorization &&
            status.communication &&
            status.bridge &&
            status.center;


        return Object.freeze(status);

    }


    /* =====================================================
       DISPATCH READY EVENT
    ===================================================== */

    function dispatchReady(status) {

        window.dispatchEvent(

            new CustomEvent(
                "pacificEducationEducationLinkReady",
                {

                    detail: {

                        version:
                            VERSION,

                        relationshipLoaded:
                            status.relationship,

                        authorizationLoaded:
                            status.authorization,

                        communicationLoaded:
                            status.communication,

                        bridgeLoaded:
                            status.bridge,

                        centerLoaded:
                            status.center,

                        ready:
                            status.ready,

                        verifiedRelationshipRequired:
                            true,

                        productionBackendRequired:
                            true

                    }

                }

            )

        );

    }


    /* =====================================================
       DISPATCH ERROR EVENT
    ===================================================== */

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

                        version:
                            VERSION,

                        error:
                            message,

                        status

                    }

                }

            )

        );

    }


    /* =====================================================
       START EDUCATION LINK
    ===================================================== */

    async function start() {

        /*
         * Prevent duplicate startup.
         */
        if (started) {

            return getStatus();

        }


        /*
         * Prevent simultaneous startup.
         */
        if (loading) {

            return getStatus();

        }


        loading = true;


        try {

            /*
             * Load modules sequentially.
             *
             * This guarantees the verified relationship
             * layer loads before authorization.
             */
            for (
                const modulePath
                of MODULES
            ) {

                await loadScript(
                    modulePath
                );

            }


            /*
             * Verify modules after loading.
             */
            const status =
                checkModules();


            /*
             * Never claim readiness when
             * a required module is missing.
             */
            if (!status.ready) {

                console.error(
                    "Pacific Education Education Link " +
                    "startup incomplete.",
                    status
                );


                dispatchError(
                    new Error(
                        "One or more Education Link " +
                        "modules are unavailable."
                    ),
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

                    verifiedRelationshipRequired:
                        true,

                    productionBackendRequired:
                        true

                });

            }


            /*
             * Startup successful.
             */
            started = true;


            /*
             * Notify the application.
             */
            dispatchReady(
                status
            );


            /*
             * Return final status.
             */
            return getStatus();

        }

        catch (error) {

            console.error(
                "Pacific Education Education Link " +
                "startup failed.",
                error
            );


            dispatchError(
                error
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

        }

        finally {

            loading = false;

        }

    }


    /* =====================================================
       GET STATUS
    ===================================================== */

    function getStatus() {

        const modules =
            checkModules();


        return Object.freeze({

            version:
                VERSION,

            started,

            loading,

            relationshipLoaded:
                modules.relationship,

            authorizationLoaded:
                modules.authorization,

            communicationLoaded:
                modules.communication,

            bridgeLoaded:
                modules.bridge,

            centerLoaded:
                modules.center,

            ready:
                Boolean(
                    started &&
                    modules.ready
                ),

            verifiedRelationshipRequired:
                true,

            automaticInformationAccess:
                false,

            productionBackendRequired:
                true

        });

    }


    /* =====================================================
       PUBLIC STARTUP API
    ===================================================== */

    window.PacificEducationEducationLinkStartup =

        Object.freeze({

            version:
                VERSION,

            start,

            getStatus

        });


})();
