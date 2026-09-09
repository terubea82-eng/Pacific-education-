
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
       MODULE FILES
    ===================================================== */

    const MODULES = Object.freeze([

        /*
         * Existing secure authorization layer.
         */
        "js/pacificEducationSecureLinkAuthorization.js",

        /*
         * Secure communication layer.
         */
        "js/pacificEducationSecureCommunication.js",

        /*
         * Existing Education Link Center.
         */
        "js/pacificEducationEducationLinkCenter.js",

        /*
         * Education Link Bridge.
         */
        "js/pacificEducationEducationLinkBridge.js"

    ]);


    /* =====================================================
       STATE
    ===================================================== */

    let started = false;
    let loading = false;


    /* =====================================================
       FIND EXISTING SCRIPT
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
                 * If the script already exists,
                 * do not load it twice.
                 */
                if (existing) {

                    /*
                     * If already loaded by another
                     * startup process, continue.
                     */
                    if (
                        existing.dataset &&
                        existing.dataset.pacificEducationLoaded ===
                            "true"
                    ) {

                        resolve(src);

                        return;
                    }


                    /*
                     * If the script is already loading,
                     * wait for its load/error event.
                     */
                    existing.addEventListener(
                        "load",
                        () => resolve(src),
                        {
                            once: true
                        }
                    );

                    existing.addEventListener(
                        "error",
                        () =>
                            reject(
                                new Error(
                                    `Failed to load ${src}`
                                )
                            ),
                        {
                            once: true
                        }
                    );

                    return;
                }


                /*
                 * Create the script dynamically.
                 */
                const script =
                    document.createElement(
                        "script"
                    );

                script.src = src;

                /*
                 * Preserve module order.
                 */
                script.async = false;

                /*
                 * Mark successful loading.
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
                 * Handle loading failure.
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
                 * Add to document.
                 */
                document.body.appendChild(
                    script
                );

            }
        );

    }


    /* =====================================================
       REQUIRED MODULE CHECK
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

            center:
                Boolean(
                    window
                        .PacificEducationEducationLinkCenter
                ),

            bridge:
                Boolean(
                    window
                        .PacificEducationEducationLinkBridge
                )

        };


        status.ready =
            status.authorization &&
            status.communication &&
            status.center &&
            status.bridge;


        return Object.freeze(status);

    }


    /* =====================================================
       EDUCATION LINK READY EVENT
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

                        centerLoaded:
                            status.center,

                        bridgeLoaded:
                            status.bridge,

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
       START
    ===================================================== */

    async function start() {

        /*
         * Prevent duplicate startup.
         */
        if (started) {

            return getStatus();

        }


        /*
         * Prevent simultaneous startup calls.
         */
        if (loading) {

            return getStatus();

        }


        loading = true;


        try {

            /*
             * Load each required module in order.
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
             * Confirm required modules.
             */
            const status =
                checkModules();


            /*
             * If required modules are missing,
             * do not claim the system is ready.
             */
            if (!status.ready) {

                console.error(
                    "Pacific Education Education Link " +
                    "startup incomplete.",
                    status
                );


                window.dispatchEvent(

                    new CustomEvent(
                        "pacificEducationEducationLinkError",
                        {

                            detail: {

                                version: VERSION,

                                status

                            }

                        }
                    )

                );


                return status;

            }


            /*
             * Mark startup complete.
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


            window.dispatchEvent(

                new CustomEvent(
                    "pacificEducationEducationLinkError",
                    {

                        detail: {

                            version: VERSION,

                            error:
                                error &&
                                error.message
                                    ? error.message
                                    : String(error)

                        }

                    }
                )

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
       STATUS
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

            centerLoaded:
                modules.center,

            bridgeLoaded:
                modules.bridge,

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
       PUBLIC API
    ===================================================== */

    window.PacificEducationEducationLinkStartup =

        Object.freeze({

            version: VERSION,

            start,

            getStatus

        });


})();
