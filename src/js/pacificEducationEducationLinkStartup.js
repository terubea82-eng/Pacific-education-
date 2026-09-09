/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK STARTUP
 * =========================================================
 *
 * Purpose:
 * Safely starts the Education Link system after the
 * Pacific Education page has loaded.
 *
 * Link architecture:
 *
 * Student  <-> Teacher
 * Parent   <-> Student
 * Parent   <-> Teacher
 * Teacher/School <-> Ministry of Education
 *
 * Access pattern:
 *
 * Link Available
 *      ↓
 * Verify
 *      ↓
 * Authorize
 *      ↓
 * Connect
 *      ↓
 * Communicate
 *
 * Security:
 * - Does not create authorization by itself.
 * - Does not bypass role permissions.
 * - Does not expose passwords, API keys or tokens.
 * - Does not grant automatic access to student records.
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

    const VERSION = "1.0.0";


    /* =====================================================
       MODULE PATHS
       ===================================================== */

    /*
     * IMPORTANT:
     *
     * This file is located at:
     *
     * src/js/pacificEducationEducationLinkStartup.js
     *
     * Therefore:
     *
     * ../js/  = root js/
     * js/     = src/js/
     */

    const MODULES = Object.freeze([

        /*
         * Root secure authorization module.
         */
        "../js/pacificEducationSecureLinkAuthorization.js",

        /*
         * Root secure communication module.
         */
        "../js/pacificEducationSecureCommunication.js",

        /*
         * Education Link Bridge.
         *
         * Must load before the Center because
         * the Center checks for the Bridge.
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
                 * Create the script element.
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

                        version: VERSION,

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

    function dispatchError(error, status = null) {

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

                    version: VERSION,

                    started: false,

                    loading: false,

                    ready: false,

                    modules: status,

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
            dispatchReady(status);


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

                version: VERSION,

                started: false,

                loading: false,

                ready: false,

                error:
                    error &&
                    error.message
                        ? error.message
                        : String(error),

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

            version: VERSION,

            started,

            loading,

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

            productionBackendRequired:
                true

        });

    }


    /* =====================================================
       PUBLIC STARTUP API
    ===================================================== */

    window.PacificEducationEducationLinkStartup =

        Object.freeze({

            version: VERSION,

            start,

            getStatus

        });


})();
