/*
 * =========================================================
 * PACIFIC EDUCATION
 * EMERGENCY ACTIVATION & RECOVERY CONTROLLER
 * VERSION 1.0.2
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Controlled emergency continuity and self-recovery layer.
 *
 * RECOVERY FLOW
 * ---------------------------------------------------------
 * DETECT FAILURE
 *      ↓
 * ISOLATE FAILED PATH
 *      ↓
 * APPROVED BACKUP PATH
 *      ↓
 * VERIFY COMPONENT API
 *      ↓
 * VERIFY SECURITY DEPENDENCIES
 *      ↓
 * RESTORE SERVICE
 *      ↓
 * AUDIT + CONTINUE MONITORING
 *
 * DESIGN PRINCIPLES
 * ---------------------------------------------------------
 * 1. Detect activation failures quickly.
 * 2. Never bypass security.
 * 3. Never invent authorization or relationships.
 * 4. Never load the known legacy/broken Bridge.
 * 5. Never retry the same path forever.
 * 6. Never create duplicate module instances unnecessarily.
 * 7. Use only explicitly approved recovery candidates.
 * 8. Verify APIs after every recovery attempt.
 * 9. Verify required security dependencies before success.
 * 10. Preserve safe user flow where possible.
 * 11. Enter safe mode if approved recovery fails.
 * 12. Keep recovery auditable.
 * 13. Do not rewrite application source code automatically.
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This controller coordinates recovery.
 *
 * It does NOT:
 * - bypass authorization
 * - create users
 * - create permissions
 * - create relationships
 * - expose secrets
 * - modify JavaScript source code
 * - hack or retaliate against systems
 *
 * Prototype / controlled recovery layer.
 *
 * Production backend recovery infrastructure is required
 * before commercial deployment.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.0.2";

    const CONTROLLER_NAME =
        "PacificEducationEmergencyRecoveryController";

    const MAX_ATTEMPTS_PER_PATH = 1;

    const MAX_TOTAL_ATTEMPTS = 3;

    const RECOVERY_TIMEOUT_MS = 8000;


    /*
     * =======================================================
     * APPROVED RECOVERY MANIFEST
     * =======================================================
     *
     * Only explicitly approved recovery paths may be used.
     *
     * The legacy top-level Bridge is deliberately excluded.
     */

    const RECOVERY_MANIFEST = Object.freeze({

        bridge: Object.freeze({

            component:
                "PacificEducationEducationLinkBridge",

            primary:
                "js/pacificEducationEducationLinkBridge.js",

            approvedBackups: Object.freeze([
                "js/pacificEducationEducationLinkBridge_v1_4_0.js"
            ]),

            requiredMethods: Object.freeze([
                "requestConnection",
                "approveConnection",
                "checkAccess",
                "revokeConnection"
            ]),

            /*
             * The Bridge cannot be considered recovered unless
             * its complete security dependency chain is healthy.
             */

            dependencies: Object.freeze([

                Object.freeze({
                    global:
                        "PacificEducationVerifiedEducationRelationship",

                    requiredMethods: Object.freeze([
                        "getUserRelationships",
                        "checkRelationship"
                    ])
                }),

                Object.freeze({
                    global:
                        "PacificEducationSecureLinkAuthorization",

                    requiredMethods: Object.freeze([
                        "requestLink",
                        "approveLink",
                        "authorizeAccess",
                        "revokeLink",
                        "getUserLinks"
                    ])
                }),

                Object.freeze({
                    global:
                        "PacificEducationSecureCommunication",

                    requiredMethods: Object.freeze([
                        "createConversation",
                        "sendMessage",
                        "getConversation",
                        "closeConversation"
                    ])
                })

            ]),

            securityRequired: true
        })

    });

    let recoveryRunning = false;

    let safeMode = false;

    const attemptHistory = [];


    /*
     * =======================================================
     * BASIC HELPERS
     * =======================================================
     */

    function now() {
        return new Date().toISOString();
    }


    function getGlobal(name) {
        return window[name] || null;
    }


    function hasRequiredAPI(
        globalName,
        requiredMethods
    ) {
        const target =
            getGlobal(globalName);

        if (!target) {
            return false;
        }

        return requiredMethods.every(
            method =>
                typeof target[method] ===
                "function"
        );
    }


    /*
     * =======================================================
     * SECURITY DEPENDENCY VERIFICATION
     * =======================================================
     */

    function verifyDependencies(
        component
    ) {
        const definition =
            RECOVERY_MANIFEST[component];

        if (!definition) {
            return false;
        }

        if (
            !definition.dependencies ||
            !Array.isArray(
                definition.dependencies
            )
        ) {
            return true;
        }

        return definition.dependencies.every(
            dependency =>
                hasRequiredAPI(
                    dependency.global,
                    dependency.requiredMethods
                )
        );
    }


    function getDependencyStatus(
        component
    ) {
        const definition =
            RECOVERY_MANIFEST[component];

        if (!definition) {
            return {
                available: false,
                dependencies: {}
            };
        }

        const dependencies = {};

        (
            definition.dependencies ||
            []
        ).forEach(
            dependency => {

                dependencies[
                    dependency.global
                ] = hasRequiredAPI(
                    dependency.global,
                    dependency.requiredMethods
                );
            }
        );

        return {
            available:
                verifyDependencies(
                    component
                ),
            dependencies
        };
    }


    /*
     * =======================================================
     * SCRIPT DETECTION
     * =======================================================
     */

    function pathAlreadyLoaded(
        path
    ) {
        return Array.from(
            document.querySelectorAll(
                "script[src]"
            )
        ).some(
            script =>
                script.getAttribute(
                    "src"
                ) === path
        );
    }


    function getExistingScript(
        path
    ) {
        return Array.from(
            document.querySelectorAll(
                "script[src]"
            )
        ).find(
            script =>
                script.getAttribute(
                    "src"
                ) === path
        ) || null;
    }


    /*
     * =======================================================
     * AUDIT HISTORY
     * =======================================================
     */

    function recordAttempt(
        component,
        path,
        result,
        message
    ) {
        attemptHistory.push({

            time: now(),

            component,

            path,

            result,

            message
        });

        /*
         * Keep diagnostic history bounded.
         */

        if (
            attemptHistory.length >
            50
        ) {
            attemptHistory.shift();
        }
    }


    /*
     * =======================================================
     * EVENT DISPATCH
     * =======================================================
     */

    function dispatchEvent(
        eventName,
        detail
    ) {
        try {

            window.dispatchEvent(
                new CustomEvent(
                    eventName,
                    {
                        detail
                    }
                )
            );

        } catch (error) {

            console.error(
                "Pacific Education emergency event failed.",
                error
            );
        }
    }


    /*
     * =======================================================
     * SAFE MODE
     * =======================================================
     */

    function enterSafeMode(
        reason
    ) {
        safeMode = true;

        const detail =
            Object.freeze({

                controllerVersion:
                    VERSION,

                time:
                    now(),

                safeMode:
                    true,

                reason:
                    reason ||
                    "Approved recovery paths unavailable.",

                securityBypass:
                    false
            });

        dispatchEvent(
            "pacificEducationEmergencySafeMode",
            detail
        );

        return detail;
    }


    /*
     * =======================================================
     * APPROVED PATH VALIDATION
     * =======================================================
     */

    function isCandidateApproved(
        component,
        path
    ) {
        const definition =
            RECOVERY_MANIFEST[
                component
            ];

        if (!definition) {
            return false;
        }

        return definition
            .approvedBackups
            .includes(path);
    }


    function getCandidates(
        component
    ) {
        const definition =
            RECOVERY_MANIFEST[
                component
            ];

        if (!definition) {
            return [];
        }

        return [
            ...definition.approvedBackups
        ];
    }


    /*
     * =======================================================
     * COMPLETE RECOVERY VERIFICATION
     * =======================================================
     */

    function verifyComponent(
        component
    ) {
        const definition =
            RECOVERY_MANIFEST[
                component
            ];

        if (!definition) {
            return false;
        }

        /*
         * First verify the recovered component itself.
         */

        const componentReady =
            hasRequiredAPI(
                definition.component,
                definition.requiredMethods
            );

        if (!componentReady) {
            return false;
        }

        /*
         * Then verify every required security
         * dependency.
         */

        if (
            definition.securityRequired ===
            true
        ) {
            if (
                !verifyDependencies(
                    component
                )
            ) {
                return false;
            }
        }

        return true;
    }


    /*
     * =======================================================
     * RECOVERY SCRIPT LOADER
     * =======================================================
     */

    function loadRecoveryScript(
        component,
        path
    ) {
        return new Promise(
            (resolve, reject) => {

                if (
                    !isCandidateApproved(
                        component,
                        path
                    )
                ) {
                    reject(
                        new Error(
                            "Recovery path is not approved."
                        )
                    );

                    return;
                }

                const definition =
                    RECOVERY_MANIFEST[
                        component
                    ];

                /*
                 * If the component and all of its
                 * security dependencies are already
                 * healthy, no additional script is loaded.
                 */

                if (
                    verifyComponent(
                        component
                    )
                ) {
                    resolve({

                        component,

                        path,

                        alreadyReady:
                            true

                    });

                    return;
                }

                let existing =
                    getExistingScript(
                        path
                    );

                /*
                 * Remove a previously failed recovery
                 * script before allowing another controlled
                 * attempt.
                 */

                if (existing) {

                    const existingFailed =
                        existing.dataset &&
                        existing.dataset
                            .pacificEducationRecoveryFailed ===
                        "true";

                    if (
                        existingFailed
                    ) {
                        existing.remove();

                        existing = null;
                    }
                }


                /*
                 * Existing script instance.
                 */

                if (existing) {

                    /*
                     * IMPORTANT v1.0.2 FIX:
                     *
                     * The script may already have finished
                     * loading before this controller attached
                     * its event listeners.
                     *
                     * Re-check the actual component immediately.
                     * If it is already healthy, recovery succeeds
                     * without waiting for an event that has already
                     * happened.
                     */

                    if (
                        verifyComponent(
                            component
                        )
                    ) {
                        resolve({

                            component,

                            path,

                            alreadyReady:
                                true

                        });

                        return;
                    }


                    let settled =
                        false;

                    const timeout =
                        setTimeout(
                            () => {

                                if (
                                    settled
                                ) {
                                    return;
                                }

                                settled =
                                    true;

                                reject(
                                    new Error(
                                        "Recovery script timed out."
                                    )
                                );

                            },
                            RECOVERY_TIMEOUT_MS
                        );


                    existing.addEventListener(
                        "load",
                        () => {

                            if (
                                settled
                            ) {
                                return;
                            }

                            clearTimeout(
                                timeout
                            );

                            if (
                                verifyComponent(
                                    component
                                )
                            ) {

                                settled =
                                    true;

                                resolve({

                                    component,

                                    path,

                                    alreadyReady:
                                        false

                                });

                            } else {

                                settled =
                                    true;

                                existing.dataset
                                    .pacificEducationRecoveryFailed =
                                    "true";

                                reject(
                                    new Error(
                                        "Recovery script loaded, but component or security dependencies failed verification."
                                    )
                                );
                            }

                        },
                        {
                            once: true
                        }
                    );


                    existing.addEventListener(
                        "error",
                        () => {

                            if (
                                settled
                            ) {
                                return;
                            }

                            clearTimeout(
                                timeout
                            );

                            settled =
                                true;

                            existing.dataset
                                .pacificEducationRecoveryFailed =
                                "true";

                            reject(
                                new Error(
                                    "Recovery script failed to load."
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
                 * New controlled recovery script.
                 */

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    path;

                script.async =
                    false;

                script.dataset
                    .pacificEducationEmergencyRecovery =
                    "true";


                const timeout =
                    setTimeout(
                        () => {

                            script.dataset
                                .pacificEducationRecoveryFailed =
                                "true";

                            script.remove();

                            reject(
                                new Error(
                                    "Recovery script timed out."
                                )
                            );

                        },
                        RECOVERY_TIMEOUT_MS
                    );


                script.addEventListener(
                    "load",
                    () => {

                        clearTimeout(
                            timeout
                        );

                        /*
                         * Critical security check:
                         * loading successfully is NOT enough.
                         */

                        if (
                            verifyComponent(
                                component
                            )
                        ) {

                            resolve({

                                component,

                                path,

                                alreadyReady:
                                    false

                            });

                        } else {

                            script.dataset
                                .pacificEducationRecoveryFailed =
                                "true";

                            reject(
                                new Error(
                                    "Recovery script loaded, but component or security dependencies failed verification."
                                )
                            );
                        }

                    },
                    {
                        once: true
                    }
                );


                script.addEventListener(
                    "error",
                    () => {

                        clearTimeout(
                            timeout
                        );

                        script.dataset
                            .pacificEducationRecoveryFailed =
                            "true";

                        reject(
                            new Error(
                                "Recovery script failed to load."
                            )
                        );

                    },
                    {
                        once: true
                    }
                );


                const parent =
                    document.head ||
                    document.documentElement ||
                    document.body;


                if (!parent) {

                    clearTimeout(
                        timeout
                    );

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
     * MAIN RECOVERY ENGINE
     * =======================================================
     */

    async function recoverComponent(
        component
    ) {

        if (safeMode) {

            return Object.freeze({

                recovered:
                    false,

                safeMode:
                    true,

                reason:
                    "Emergency recovery is already in safe mode."
            });
        }


        if (recoveryRunning) {

            return Object.freeze({

                recovered:
                    false,

                recoveryInProgress:
                    true
            });
        }


        const definition =
            RECOVERY_MANIFEST[
                component
            ];


        if (!definition) {

            return Object.freeze({

                recovered:
                    false,

                reason:
                    "No approved recovery manifest exists."
            });
        }


        recoveryRunning =
            true;

        let totalAttempts =
            0;


        try {

            dispatchEvent(
                "pacificEducationEmergencyRecoveryStarted",
                {

                    controllerVersion:
                        VERSION,

                    component,

                    time:
                        now()
                }
            );


            /*
             * Never use the primary path as an
             * emergency backup.
             */

            const candidates =
                getCandidates(
                    component
                );


            for (
                const path of candidates
            ) {

                if (
                    totalAttempts >=
                    MAX_TOTAL_ATTEMPTS
                ) {
                    break;
                }


                if (
                    !isCandidateApproved(
                        component,
                        path
                    )
                ) {
                    continue;
                }


                /*
                 * A previously loaded backup path
                 * is not automatically trusted.
                 * Full verification decides.
                 */

                if (
                    pathAlreadyLoaded(
                        path
                    )
                ) {
                    /*
                     * Intentionally continue to
                     * verification/loader logic.
                     */
                }


                let pathAttempts =
                    0;


                while (
                    pathAttempts <
                        MAX_ATTEMPTS_PER_PATH &&
                    totalAttempts <
                        MAX_TOTAL_ATTEMPTS
                ) {

                    pathAttempts += 1;

                    totalAttempts += 1;


                    try {

                        const result =
                            await loadRecoveryScript(
                                component,
                                path
                            );


                        /*
                         * FINAL SECURITY GATE
                         *
                         * Component + all declared
                         * security dependencies must
                         * be healthy.
                         */

                        if (
                            verifyComponent(
                                component
                            )
                        ) {

                            const dependencyStatus =
                                getDependencyStatus(
                                    component
                                );


                            recordAttempt(
                                component,
                                path,
                                "success",
                                "Approved recovery path and complete security dependency chain verified."
                            );


                            dispatchEvent(
                                "pacificEducationEmergencyRecoverySuccess",
                                {

                                    controllerVersion:
                                        VERSION,

                                    component,

                                    path,

                                    time:
                                        now(),

                                    attempts:
                                        totalAttempts,

                                    securityVerified:
                                        true,

                                    dependencyStatus
                                }
                            );


                            return Object.freeze({

                                recovered:
                                    true,

                                component,

                                path,

                                attempts:
                                    totalAttempts,

                                securityVerified:
                                    true,

                                dependencyStatus,

                                result
                            });
                        }


                        recordAttempt(
                            component,
                            path,
                            "failed",
                            "Component API or security dependency verification failed."
                        );


                    } catch (
                        error
                    ) {

                        recordAttempt(
                            component,
                            path,
                            "failed",
                            error &&
                            error.message
                                ? error.message
                                : String(
                                    error
                                )
                        );
                    }
                }
            }


            return enterSafeMode(
                `Automatic recovery failed for ${component}. Component or security dependency chain could not be verified.`
            );


        } finally {

            recoveryRunning =
                false;
        }
    }


    /*
     * =======================================================
     * STATUS
     * =======================================================
     */

    function getStatus() {

        const components = {};

        const dependencyStatus =
            {};


        Object.keys(
            RECOVERY_MANIFEST
        ).forEach(
            component => {

                components[
                    component
                ] =
                    verifyComponent(
                        component
                    );

                dependencyStatus[
                    component
                ] =
                    getDependencyStatus(
                        component
                    );
            }
        );


        return Object.freeze({

            controllerVersion:
                VERSION,

            controllerName:
                CONTROLLER_NAME,

            recoveryRunning,

            safeMode,

            totalHistoryEntries:
                attemptHistory.length,

            components,

            dependencyStatus,

            securityBypass:
                false,

            sourceCodeSelfModification:
                false,

            unauthorizedRecoveryPaths:
                false,

            legacyBridgeExcluded:
                true,

            duplicateRecoveryLoop:
                false,

            productionBackendRequired:
                true,

            prototypeOnly:
                true
        });
    }


    /*
     * =======================================================
     * RECOVERY HISTORY
     * =======================================================
     */

    function getRecoveryHistory() {

        return Object.freeze(

            attemptHistory.map(
                entry =>
                    Object.freeze({
                        ...entry
                    })
            )

        );
    }


    /*
     * =======================================================
     * MANUAL SAFE-MODE RESET
     * =======================================================
     */

    function resetSafeMode() {

        /*
         * Manual reset only.
         *
         * Resetting safe mode does NOT manufacture
         * missing security dependencies.
         */

        safeMode =
            false;


        dispatchEvent(
            "pacificEducationEmergencySafeModeReset",
            {

                controllerVersion:
                    VERSION,

                time:
                    now()
            }
        );


        return getStatus();
    }


    /*
     * =======================================================
     * PUBLIC CONTROLLER API
     * =======================================================
     */

    window[
        CONTROLLER_NAME
    ] =
        Object.freeze({

            version:
                VERSION,

            recoverComponent,

            verifyComponent,

            getStatus,

            getRecoveryHistory,

            resetSafeMode,

            recoveryManifest:
                RECOVERY_MANIFEST
        });


    /*
     * =======================================================
     * STARTUP CONNECTION INTENTIONALLY DISABLED
     * =======================================================
     *
     * Do NOT connect this controller automatically to
     * Education Link Startup yet.
     *
     * Startup must first be corrected so that it requires
     * both:
     *
     * getUserRelationships()
     * AND
     * checkRelationship()
     *
     * before declaring the security chain ready.
     *
     * No duplicate script tags are added here.
     * No legacy Bridge is added here.
     */

})();
