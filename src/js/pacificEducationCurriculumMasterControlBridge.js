/*
 * Pacific Education — Curriculum Master Control Bridge
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Connects curriculum dependency/readiness status to the existing
 * Pacific Education Master Control registry. This is coordination
 * metadata only and is NOT a production security boundary.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function masterControl() {
        return window.PacificEducationMasterControl || null;
    }

    function dependencyValidator() {
        return window.PacificEducationCurriculumDependencyValidator || null;
    }

    function run() {
        var mc = masterControl();
        var validator = dependencyValidator();
        var dependencyStatus = validator && typeof validator.check === "function"
            ? validator.check()
            : { valid:false, missing:[{ name:"Curriculum Dependency Validator" }] };

        var result = {
            module:"PacificEducationCurriculumMasterControlBridge",
            version:VERSION,
            prototype:true,
            productionEligible:false,
            dependencyReady:dependencyStatus.valid === true,
            loadedDependencies:dependencyStatus.loaded || 0,
            totalDependencies:dependencyStatus.total || 0,
            missingDependencies:dependencyStatus.missing || [],
            masterControlAvailable:!!mc,
            status:dependencyStatus.valid === true ? "prototype-ready" : "prototype-dependency-missing"
        };

        /*
         * The bridge intentionally does not mutate Master Control's
         * authoritative registry because its API/version may differ.
         * It exposes a safe coordination snapshot instead.
         */
        try {
            window.PacificEducationCurriculumMasterControlStatus = Object.freeze(result);
        } catch (ignore) {
            window.PacificEducationCurriculumMasterControlStatus = result;
        }

        document.dispatchEvent(new CustomEvent("pacificEducationMasterControlRefresh", {
            detail:result
        }));

        return result;
    }

    function getStatus() {
        return window.PacificEducationCurriculumMasterControlStatus || run();
    }

    function init() {
        run();
    }

    window.PacificEducationCurriculumMasterControlBridge = Object.freeze({
        name:"PacificEducationCurriculumMasterControlBridge",
        version:VERSION,
        run:run,
        getStatus:getStatus,
        init:init
    });

    document.addEventListener("pacificEducationScheduleChanged", run);
    document.addEventListener("pacificEducationCoverageRefresh", run);
    document.addEventListener("pacificEducationStudentChanged", run);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
