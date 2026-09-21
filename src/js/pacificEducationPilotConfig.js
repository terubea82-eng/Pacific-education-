(function (global) {
    "use strict";

    /*
     * Pacific Education Pilot Configuration
     * Owner-controlled prototype setting.
     * Change the dates here for a future pilot extension.
     * This configuration does NOT provide production security,
     * authentication, payment verification, or server authorization.
     */

    var CONFIG = Object.freeze({
        releaseType: "controlled-prototype-pilot",
        pilotName: "1-Month Controlled Pilot",
        startDate: "2026-09-21",
        endDate: "2026-10-21",
        durationMonths: 1,
        automaticPilotClose: true,
        automaticProductionDecision: true,
        productionApprovalRequiresServerAuthority: true,
        failClosed: true,
        prototypeOnly: true
    });

    global.PacificEducationPilotConfig = CONFIG;
})(window);
