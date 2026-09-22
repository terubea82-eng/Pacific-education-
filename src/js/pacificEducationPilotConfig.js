(function (global) {
    "use strict";

    /*
     * Pacific Education Pilot Configuration
     * Owner-controlled prototype setting.
     * Initial pilot: 1 month.
     * Optional extension: only if genuinely needed and explicitly approved by the owner.
     * Maximum total pilot duration: 3 months.
     * No automatic extension is permitted.
     * This configuration does NOT provide production security,
     * authentication, payment verification, or server authorization.
     */

    var CONFIG = Object.freeze({
        releaseType: "controlled-prototype-pilot",
        pilotName: "1-Month Controlled Pilot",
        startDate: "2026-09-21",
        endDate: "2026-10-21",
        durationMonths: 1,
        extensionAllowed: true,
        extensionRequiresOwnerApproval: true,
        automaticExtension: false,
        maximumDurationMonths: 3,
        maximumEndDate: "2026-12-21",
        automaticPilotClose: true,

        /*
         * This flag is deliberately false. The browser may evaluate and
         * close the pilot window, but it must never make a production
         * approval decision. Production authority is server-side only.
         */
        automaticProductionDecision: false,

        productionApprovalRequiresServerAuthority: true,
        failClosed: true,
        prototypeOnly: true
    });

    global.PacificEducationPilotConfig = CONFIG;
})(window);
