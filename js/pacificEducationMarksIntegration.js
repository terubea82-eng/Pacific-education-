/*
 * =========================================================
 * PACIFIC EDUCATION
 * MARKS INTEGRATION
 * Version: 1.1.0
 *
 * EXISTING FILE:
 * js/pacificEducationMarksIntegration.js
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Connects the marks interface to the protected
 * Pacific Education Core.
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * The Core owns:
 * • authorization
 * • mark storage
 * • mark transfer
 * • mark editing
 * • audit history
 *
 * This integration does NOT create a second marks store.
 *
 * SECURITY
 * ---------------------------------------------------------
 * • No mark operation occurs without Core authorization.
 * • No silent mark movement.
 * • Mark edits require a reason.
 * • Assessment ID is required for mark transfer.
 * • Mark ID is required for mark editing.
 * • No payment information is handled here.
 * • No payment secrets are stored here.
 * =========================================================
 */

(function (window) {

    "use strict";


    const VERSION = "1.1.0";


    /* =====================================================
       CORE CONNECTION
    ===================================================== */

    function getCore() {

        return (
            window.PacificEducationCore ||
            null
        );

    }


    /* =====================================================
       AUTHORIZATION
    ===================================================== */

    function isAuthorized() {

        const core =
            getCore();

        return !!(
            core &&
            core.identity &&
            typeof core.identity.isAuthorized ===
                "function" &&
            core.identity.isAuthorized()
        );

    }


    /* =====================================================
       TRANSFER MARK
       -----------------------------------------------------
       VERIFIED CORE SIGNATURE:
         transfer(assessmentId, markData)
    ===================================================== */

    function transferMark(
        assessmentId,
        markData
    ) {

        const core =
            getCore();


        if (
            !core ||
            !isAuthorized()
        ) {

            return false;

        }


        if (
            !core.marks ||
            typeof core.marks.transfer !==
                "function"
        ) {

            return false;

        }


        if (
            !assessmentId ||
            typeof assessmentId !==
                "string"
        ) {

            return false;

        }


        if (
            !markData ||
            typeof markData !==
                "object" ||
            Array.isArray(markData)
        ) {

            return false;

        }


        /*
         * IMPORTANT:
         * Pass both arguments exactly as required
         * by the existing Pacific Education Core.
         */
        return core.marks.transfer(
            assessmentId,
            markData
        );

    }


    /* =====================================================
       EDIT MARK
       -----------------------------------------------------
       VERIFIED CORE SIGNATURE:
         edit(markId, changes, reason)
    ===================================================== */

    function editMark(
        markId,
        changes,
        reason
    ) {

        const core =
            getCore();


        if (
            !core ||
            !isAuthorized()
        ) {

            return false;

        }


        if (
            !core.marks ||
            typeof core.marks.edit !==
                "function"
        ) {

            return false;

        }


        if (
            !markId ||
            typeof markId !==
                "string"
        ) {

            return false;

        }


        if (
            !changes ||
            typeof changes !==
                "object" ||
            Array.isArray(changes)
        ) {

            return false;

        }


        /*
         * Mark changes must have an explicit reason.
         * This protects the audit trail.
         */
        if (
            !reason ||
            typeof reason !==
                "string" ||
            !reason.trim()
        ) {

            return false;

        }


        return core.marks.edit(
            markId,
            changes,
            reason.trim()
        );

    }


    /* =====================================================
       CONNECTION STATUS
    ===================================================== */

    function getConnectionStatus() {

        const core =
            getCore();


        return {

            version:
                VERSION,

            core:
                !!core,

            authorized:
                isAuthorized(),

            marks:
                !!(
                    core &&
                    core.marks
                ),

            transfer:
                !!(
                    core &&
                    core.marks &&
                    typeof core.marks.transfer ===
                        "function"
                ),

            edit:
                !!(
                    core &&
                    core.marks &&
                    typeof core.marks.edit ===
                        "function"
                )

        };

    }


    /* =====================================================
       REFRESH CONNECTION
    ===================================================== */

    function refreshConnection() {

        return getConnectionStatus();

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.PacificEducationMarksIntegration =
        Object.freeze({

            version:
                VERSION,

            isAuthorized:
                isAuthorized,

            transferMark:
                transferMark,

            editMark:
                editMark,

            getConnectionStatus:
                getConnectionStatus,

            refreshConnection:
                refreshConnection

        });


    /* =====================================================
       STARTUP CHECK
    ===================================================== */

    function initialize() {

        const status =
            getConnectionStatus();


        if (!status.core) {

            console.warn(
                "Pacific Education: Marks Integration is waiting for PacificEducationCore."
            );

            return;

        }


        if (!status.marks) {

            console.warn(
                "Pacific Education: Core marks interface is unavailable."
            );

            return;

        }


        if (
            !status.transfer ||
            !status.edit
        ) {

            console.warn(
                "Pacific Education: Marks Integration is not fully connected."
            );

            return;

        }


        console.info(
            "Pacific Education: Marks Integration connected.",
            status
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }


})(window);


/* =========================================================
   END MARKS INTEGRATION
========================================================= */
