
/*
 * =========================================================
 * PACIFIC EDUCATION
 * EMERGENCY ACTIVATION & RECOVERY CONTROLLER
 * VERSION 1.0.0
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Controlled emergency continuity and self-recovery layer.
 *
 * DESIGN PRINCIPLES
 * ---------------------------------------------------------
 * 1. Detect activation failures quickly.
 * 2. Never bypass security.
 * 3. Never invent authorization or relationships.
 * 4. Never load the known legacy/broken Bridge.
 * 5. Never load the same recovery path repeatedly forever.
 * 6. Never load duplicate module instances unnecessarily.
 * 7. Use only explicitly approved recovery candidates.
 * 8. Verify APIs after every recovery attempt.
 * 9. Preserve safe user flow where possible.
 * 10. Enter safe mode if approved recovery fails.
 * 11. Keep recovery auditable.
 * 12. Do not rewrite application source code automatically.
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
 * Production backend recovery infrastructure is required
 * before commercial deployment.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.0.0";

    const CONTROLLER_NAME =
        "PacificEducationEmergencyRecoveryController";

    const MAX_ATTEMPTS_PER_PATH = 1;

    const MAX_TOTAL_ATTEMPTS = 3;

    const RECOVERY_TIMEOUT_MS = 8000;

    /*
     * Only approved recovery candidates belong here.
     *
     * The v1.4.0 Bridge backup already exists in the
     * repository and is therefore registered as the first
     * controlled recovery candidate.
     *
     * DO NOT add the legacy top-level Bridge here.
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

            securityRequired: true
        })
    });

    let recoveryRunning = false;
    let safeMode = false;

    const attemptHistory = [];

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
        const target = getGlobal(globalName);

        if (!target) {
            return false;
        }

        return requiredMethods.every(
            method =>
                typeof target[method] === "function"
        );
    }

    function pathAlreadyLoaded(path) {
        return Array.from(
            document.querySelectorAll("script[src]")
        ).some(
            script =>
                script.getAttribute("src") === path
        );
    }

    function getExistingScript(path) {
        return Array.from(
            document.querySelectorAll("script[src]")
        ).find(
            script =>
                script.getAttribute("src") === path
        ) || null;
    }

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
        if (attemptHistory.length > 50) {
            attemptHistory.shift();
        }
    }

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

    function enterSafeMode(
        reason
    ) {
        safeMode = true;

        const detail = Object.freeze({
            controllerVersion: VERSION,
            time: now(),
            safeMode: true,
            reason:
                reason ||
                "Approved recovery paths unavailable.",
            securityBypass: false
        });

        dispatchEvent(
            "pacificEducationEmergencySafeMode",
            detail
        );

        return detail;
    }

    function isCandidateApproved(
        component,
        path
    ) {
        const definition =
            RECOVERY_MANIFEST[component];

        if (!definition) {
            return false;
        }

        return definition.approvedBackups
            .includes(path);
    }

    function getCandidates(
        component
    ) {
        const definition =
            RECOVERY_MANIFEST[component];

        if (!definition) {
            return [];
        }

        return [
            ...definition.approvedBackups
        ];
    }

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
                    RECOVERY_MANIFEST[component];

                if (
                    hasRequiredAPI(
                        definition.component,
                        definition.requiredMethods
                    )
                ) {
                    resolve({
                        component,
                        path,
                        alreadyReady: true
                    });

                    return;
                }

                let existing =
                    getExistingScript(path);

                if (existing) {

                    const existingFailed =
                        existing.dataset &&
                        existing.dataset
                            .pacificEducationRecoveryFailed ===
                        "true";

                    if (existingFailed) {
                        existing.remove();
                        existing = null;
                    }
                }

                if (existing) {

                    let settled = false;

                    const timeout =
                        setTimeout(
                            () => {

                                if (settled) {
                                    return;
                                }

                                settled = true;

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

                            if (settled) {
                                return;
                            }

                            clearTimeout(timeout);

                            if (
                                hasRequiredAPI(
                                    definition.component,
                                    definition.requiredMethods
                                )
                            ) {
                                settled = true;

                                resolve({
                                    component,
                                    path,
                                    alreadyReady: false
                                });

                            } else {
                                settled = true;

                                existing.dataset
                                    .pacificEducationRecoveryFailed =
                                    "true";

                                reject(
                                    new Error(
                                        "Recovery script loaded without required API."
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

                            if (settled) {
                                return;
                            }

                            clearTimeout(timeout);

                            settled = true;

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

                const script =
                    document.createElement(
                        "script"
                    );

                script.src = path;

                script.async = false;

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

                        clearTimeout(timeout);

                        if (
                            hasRequiredAPI(
                                definition.component,
                                definition.requiredMethods
                            )
                        ) {

                            resolve({
                                component,
                                path,
                                alreadyReady: false
                            });

                        } else {

                            script.dataset
                                .pacificEducationRecoveryFailed =
                                "true";

                            reject(
                                new Error(
                                    "Recovery script loaded without required API."
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

                        clearTimeout(timeout);

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

                    clearTimeout(timeout);

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

    async function recoverComponent(
        component
    ) {
        if (safeMode) {
            return Object.freeze({
                recovered: false,
                safeMode: true,
                reason:
                    "Emergency recovery is already in safe mode."
            });
        }

        if (recoveryRunning) {
            return Object.freeze({
                recovered: false,
                recoveryInProgress: true
            });
        }

        const definition =
            RECOVERY_MANIFEST[component];

        if (!definition) {

            return Object.freeze({
                recovered: false,
                reason:
                    "No approved recovery manifest exists."
            });
        }

        recoveryRunning = true;

        let totalAttempts = 0;

        try {

            dispatchEvent(
                "pacificEducationEmergencyRecoveryStarted",
                {
                    controllerVersion: VERSION,
                    component,
                    time: now()
                }
            );

            /*
             * Never use the primary path as an emergency
             * backup. Recovery candidates must be explicitly
             * registered in approvedBackups.
             */
            const candidates =
                getCandidates(component);

            for (const path of candidates) {

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

                if (
                    pathAlreadyLoaded(path)
                ) {
                    /*
                     * Existing backup script may already be
                     * loaded. API verification determines
                     * whether it is actually usable.
                     */
                }

                let pathAttempts = 0;

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

                        if (
                            hasRequiredAPI(
                                definition.component,
                                definition.requiredMethods
                            )
                        ) {

                            recordAttempt(
                                component,
                                path,
                                "success",
                                "Approved recovery path verified."
                            );

                            dispatchEvent(
                                "pacificEducationEmergencyRecoverySuccess",
                                {
                                    controllerVersion:
                                        VERSION,
                                    component,
                                    path,
                                    time: now(),
                                    attempts:
                                        totalAttempts,
                                    securityVerified:
                                        true
                                }
                            );

                            return Object.freeze({
                                recovered: true,
                                component,
                                path,
                                attempts:
                                    totalAttempts,
                                securityVerified:
                                    true,
                                result
                            });
                        }

                        recordAttempt(
                            component,
                            path,
                            "failed",
                            "Required API verification failed."
                        );

                    } catch (error) {

                        recordAttempt(
                            component,
                            path,
                            "failed",
                            error &&
                            error.message
                                ? error.message
                                : String(error)
                        );
                    }
                }
            }

            return enterSafeMode(
                `Automatic recovery failed for ${component}.`
            );

        } finally {

            recoveryRunning = false;
        }
    }

    function verifyComponent(
        component
    ) {
        const definition =
            RECOVERY_MANIFEST[component];

        if (!definition) {
            return false;
        }

        return hasRequiredAPI(
            definition.component,
            definition.requiredMethods
        );
    }

    function getStatus() {

        const components = {};

        Object.keys(
            RECOVERY_MANIFEST
        ).forEach(
            component => {

                components[component] =
                    verifyComponent(
                        component
                    );
            }
        );

        return Object.freeze({
            controllerVersion: VERSION,
            controllerName: CONTROLLER_NAME,
            recoveryRunning,
            safeMode,
            totalHistoryEntries:
                attemptHistory.length,
            components,
            securityBypass:
                false,
            sourceCodeSelfModification:
                false,
            unauthorizedRecoveryPaths:
                false,
            productionBackendRequired:
                true,
            prototypeOnly:
                true
        });
    }

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

    function resetSafeMode() {

        /*
         * Safe-mode reset is deliberately manual through
         * this controlled API. It does not automatically
         * override a confirmed failure.
         */
        safeMode = false;

        dispatchEvent(
            "pacificEducationEmergencySafeModeReset",
            {
                controllerVersion:
                    VERSION,
                time: now()
            }
        );

        return getStatus();
    }

    window[
        CONTROLLER_NAME
    ] = Object.freeze({

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
     * Controller is intentionally NOT automatically
     * connected to Startup in this first stage.
     *
     * Startup integration happens only after this file
     * has been independently checked and verified.
     */

})();
