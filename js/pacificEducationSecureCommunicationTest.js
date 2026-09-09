/*
============================================================
PACIFIC EDUCATION
SECURE COMMUNICATION SECURITY TEST
VERSION 1.3.0

OWNER / DEVELOPER TEST HARNESS

Purpose:
Verify that secure communication follows:

Identity
→ Role
→ Verified Relationship
→ Approved Link
→ Communication Permission
→ Conversation
→ Message
→ Relationship Revocation
→ Access Denied

This file is a TEST HARNESS only.
It must NOT be added to production startup.

Production security must still be enforced server-side.
============================================================
*/

(function () {
    "use strict";

    const VERSION = "1.3.0";

    const parent = {
        id: "parent-001",
        role: "parent",
        authorized: true
    };

    const teacher = {
        id: "teacher-001",
        role: "teacher",
        authorized: true
    };

    const unauthorizedParent = {
        id: "parent-unauthorized-001",
        role: "parent",
        authorized: true
    };

    const nonParticipant = {
        id: "student-001",
        role: "student",
        authorized: true
    };

    const TEST_GROUP = {
        name: "Pacific Education Secure Communication Test Group",
        jurisdiction: "Fiji"
    };

    const results = [];

    let relationshipId = null;
    let linkId = null;
    let conversationId = null;

    function record(name, passed, details) {
        const result = {
            name,
            passed: Boolean(passed),
            details: details || "",
            timestamp: new Date().toISOString()
        };

        results.push(result);

        if (passed) {
            console.log("PASS:", name, details || "");
        } else {
            console.error("FAIL:", name, details || "");
        }

        return result;
    }

    function expectSuccess(name, action) {
        try {
            const value = action();

            if (value === undefined || value === null) {
                return record(name, false, "Expected successful result but received no result.");
            }

            return record(name, true, "Successful.");
        } catch (error) {
            return record(
                name,
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }

    function expectDeniedByThrow(name, action) {
        try {
            action();

            return record(
                name,
                false,
                "Expected access to be denied, but the operation succeeded."
            );
        } catch (error) {
            return record(
                name,
                true,
                "Access correctly denied."
            );
        }
    }

    function expectDeniedResult(name, action) {
        try {
            const value = action();

            if (value && value.allowed === false) {
                return record(
                    name,
                    true,
                    value.reason || "Access correctly denied."
                );
            }

            return record(
                name,
                false,
                "Expected allowed:false."
            );
        } catch (error) {
            return record(
                name,
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }

    function getModules() {
        return {
            identity: window.PacificEducationIdentity,
            relationship: window.PacificEducationVerifiedEducationRelationship,
            authorization: window.PacificEducationSecureLinkAuthorization,
            communication: window.PacificEducationSecureCommunication
        };
    }

    function assertModules(modules) {
        const required = [
            "identity",
            "relationship",
            "authorization",
            "communication"
        ];

        const missing = required.filter(function (name) {
            return !modules[name];
        });

        if (missing.length > 0) {
            throw new Error(
                "Required module(s) missing: " + missing.join(", ")
            );
        }

        return true;
    }

    function resetTestState() {
        const modules = getModules();

        try {
            if (
                modules.relationship &&
                typeof modules.relationship.resetPrototypeState === "function"
            ) {
                modules.relationship.resetPrototypeState();
            }
        } catch (error) {
            console.warn(
                "Relationship reset warning:",
                error && error.message
                    ? error.message
                    : error
            );
        }

        try {
            localStorage.removeItem("pacificEducationSecureLinks");
        } catch (error) {
            console.warn("Secure link storage reset warning.");
        }

        try {
            localStorage.removeItem("pacificEducationSecureMessages");
        } catch (error) {
            console.warn("Secure message storage reset warning.");
        }

        relationshipId = null;
        linkId = null;
        conversationId = null;
    }

    /*
    ============================================================
    1. MODULE AVAILABILITY
    ============================================================
    */

    function testModuleAvailability() {
        const modules = getModules();

        try {
            assertModules(modules);

            return record(
                "module_availability",
                true,
                "All required security modules are available."
            );
        } catch (error) {
            return record(
                "module_availability",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    2. CLEAN STATE
    ============================================================
    */

    function testCleanState() {
        resetTestState();

        return record(
            "clean_test_state",
            relationshipId === null &&
            linkId === null &&
            conversationId === null,
            "Security test state reset."
        );
    }

    /*
    ============================================================
    3. IDENTITY
    ============================================================
    */

    function testIdentity() {
        const modules = getModules();

        try {
            assertModules(modules);

            if (!parent.id || !teacher.id) {
                throw new Error("Test identities are incomplete.");
            }

            if (!parent.authorized || !teacher.authorized) {
                throw new Error("Test identities must be authorized.");
            }

            return record(
                "identity_validation",
                true,
                "Parent and teacher identities are valid."
            );
        } catch (error) {
            return record(
                "identity_validation",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    4. VERIFIED RELATIONSHIP
    ============================================================
    */

    function createVerifiedRelationship() {
        const modules = getModules();

        try {
            const result = modules.relationship.verifyRelationship({
                requester: parent,
                target: teacher,
                relationshipType: "parent_teacher",
                jurisdiction: TEST_GROUP.jurisdiction,
                evidence: {
                    type: "linked_student_relationship",
                    verified: true
                },
                authority: {
                    consent: true
                }
            });

            relationshipId = result.relationshipId;

            return record(
                "verified_relationship_created",
                Boolean(relationshipId),
                relationshipId
                    ? "Verified parent-teacher relationship created."
                    : "Relationship ID was not returned."
            );
        } catch (error) {
            return record(
                "verified_relationship_created",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    5. SECURE LINK REQUEST
    ============================================================
    */

    function requestSecureLink() {
        const modules = getModules();

        try {
            const result = modules.authorization.requestLink({
                requester: parent,
                target: teacher,
                linkType: "parent_teacher",
                relationship: {
                    id: relationshipId,
                    type: "parent_teacher"
                },
                relationshipId: relationshipId,
                jurisdiction: TEST_GROUP.jurisdiction,
                evidenceReference: {
                    type: "linked_student_relationship",
                    verified: true
                }
            });

            linkId = result.linkId;

            return record(
                "secure_link_requested",
                Boolean(linkId),
                linkId
                    ? "Secure communication link requested."
                    : "Link ID was not returned."
            );
        } catch (error) {
            return record(
                "secure_link_requested",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    6. LINK APPROVAL
    ============================================================
    */

    function approveSecureLink() {
        const modules = getModules();

        try {
            const result = modules.authorization.approveLink({
                linkId: linkId,
                approver: teacher,
                permissions: [
                    "communication"
                ]
            });

            return record(
                "secure_link_approved",
                Boolean(result),
                "Secure link approved with communication permission."
            );
        } catch (error) {
            return record(
                "secure_link_approved",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    7. COMMUNICATION AUTHORIZATION
    ============================================================
    */

    function authorizeCommunication() {
        const modules = getModules();

        try {
            const result = modules.authorization.authorizeAccess({
                linkId: linkId,
                requester: parent,
                requiredPermission: "communication"
            });

            return record(
                "communication_authorized",
                Boolean(result && result.allowed === true),
                result && result.allowed === true
                    ? "Communication permission correctly authorized."
                    : "Communication authorization failed."
            );
        } catch (error) {
            return record(
                "communication_authorized",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    8. CONVERSATION CREATION
    ============================================================
    */

    function createSecureConversation() {
        const modules = getModules();

        try {
            const result = modules.communication.createConversation(
                parent,
                teacher,
                {
                    linkId: linkId
                }
            );

            conversationId = result.conversationId;

            return record(
                "conversation_created",
                Boolean(conversationId),
                conversationId
                    ? "Authorized conversation created."
                    : "Conversation ID was not returned."
            );
        } catch (error) {
            return record(
                "conversation_created",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    9. AUTHORIZED MESSAGE
    ============================================================
    */

    function sendAuthorizedMessage() {
        const modules = getModules();

        try {
            const result = modules.communication.sendMessage({
                conversationId: conversationId,
                sender: parent,
                recipient: teacher,
                text: "Secure communication test message.",
                linkId: linkId
            });

            return record(
                "authorized_message_sent",
                Boolean(result),
                "Authorized message sent."
            );
        } catch (error) {
            return record(
                "authorized_message_sent",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    10. AUTHORIZED READ
    ============================================================
    */

    function readAuthorizedConversation() {
        const modules = getModules();

        try {
            const result = modules.communication.getConversation(
                conversationId,
                parent
            );

            return record(
                "authorized_conversation_read",
                Boolean(result),
                "Authorized conversation read successfully."
            );
        } catch (error) {
            return record(
                "authorized_conversation_read",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    11. PRE-REVOCATION HARDENING
    ============================================================
    */

    function testWrongLinkId() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_wrong_link_id",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: "wrong-link-id",
                    requester: parent,
                    requiredPermission: "communication"
                });
            }
        );
    }

    function testUnauthorizedParentAuthorization() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_unauthorized_parent",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: unauthorizedParent,
                    requiredPermission: "communication"
                });
            }
        );
    }

    function testNonParticipantAuthorization() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_non_participant",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: nonParticipant,
                    requiredPermission: "communication"
                });
            }
        );
    }

    function testWrongPermission() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_wrong_permission",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: parent,
                    requiredPermission: "learning_summary"
                });
            }
        );
    }

    function testUnauthorizedConversationAccess() {
        const modules = getModules();

        return expectDeniedByThrow(
            "hardening_unauthorized_conversation_access",
            function () {
                modules.communication.getConversation(
                    conversationId,
                    unauthorizedParent
                );
            }
        );
    }

    /*
    ============================================================
    12. RELATIONSHIP REVOCATION
    ============================================================
    */

    function revokeVerifiedRelationship() {
        const modules = getModules();

        try {
            const result = modules.relationship.revokeRelationship({
                relationshipId: relationshipId,
                revoker: parent,
                reason: "Security test revocation."
            });

            return record(
                "relationship_revoked",
                Boolean(result),
                "Verified relationship revoked."
            );
        } catch (error) {
            return record(
                "relationship_revoked",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    13. DIRECT REVOCATION CHECK
    ============================================================
    */

    function testRelationshipRevoked() {
        const modules = getModules();

        try {
            const result = modules.relationship.checkRelationship({
                relationshipId: relationshipId,
                requester: parent,
                target: teacher,
                relationshipType: "parent_teacher"
            });

            const revoked =
                result &&
                (
                    result.active === false ||
                    result.status === "revoked" ||
                    result.allowed === false
                );

            return record(
                "relationship_revocation_verified",
                revoked,
                revoked
                    ? "Relationship is no longer active."
                    : "Relationship still appears active."
            );
        } catch (error) {
            return record(
                "relationship_revocation_verified",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    14. AUTHORIZATION AFTER REVOCATION
    ============================================================
    */

    function testAuthorizationAfterRevocation() {
        const modules = getModules();

        return expectDeniedResult(
            "authorization_denied_after_revocation",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: parent,
                    requiredPermission: "communication"
                });
            }
        );
    }

    /*
    ============================================================
    15. OLD / REVOKED LINK HARDENING
    ============================================================
    */

    function testOldLinkCannotRestoreAccess() {
        const modules = getModules();

        return expectDeniedResult(
            "old_link_cannot_restore_access",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: parent,
                    requiredPermission: "communication"
                });
            }
        );
    }

    function testRevokedLink() {
        const modules = getModules();

        try {
            const result = modules.authorization.revokeLink({
                linkId: linkId,
                revoker: parent,
                reason: "Security test link revocation."
            });

            return record(
                "revoked_link_verified",
                Boolean(result),
                "Link revocation processed."
            );
        } catch (error) {
            return record(
                "revoked_link_verified",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    16. POST-REVOCATION COMMUNICATION DENIAL
    ============================================================
    */

    function testConversationDeniedAfterRevocation() {
        const modules = getModules();

        return expectDeniedByThrow(
            "conversation_denied_after_revocation",
            function () {
                modules.communication.getConversation(
                    conversationId,
                    parent
                );
            }
        );
    }

    function testMessageDeniedAfterRevocation() {
        const modules = getModules();

        return expectDeniedByThrow(
            "message_denied_after_revocation",
            function () {
                modules.communication.sendMessage({
                    conversationId: conversationId,
                    sender: parent,
                    recipient: teacher,
                    text: "This message must be denied after revocation.",
                    linkId: linkId
                });
            }
        );
    }

    function testCloseDeniedAfterRevocation() {
        const modules = getModules();

        return expectDeniedByThrow(
            "close_denied_after_revocation",
            function () {
                modules.communication.closeConversation(
                    conversationId,
                    parent
                );
            }
        );
    }

    /*
    ============================================================
    17. SECURITY STATUS
    ============================================================
    */

    function testSecurityStatus() {
        const modules = getModules();

        try {
            const status = modules.communication.getStatus
                ? modules.communication.getStatus()
                : null;

            const authorizationStatus =
                modules.authorization.getStatus
                    ? modules.authorization.getStatus()
                    : null;

            const relationshipStatus =
                modules.relationship.getStatus
                    ? modules.relationship.getStatus()
                    : null;

            const valid =
                Boolean(status) ||
                Boolean(authorizationStatus) ||
                Boolean(relationshipStatus);

            return record(
                "security_status",
                valid,
                "Security module status APIs are available."
            );
        } catch (error) {
            return record(
                "security_status",
                false,
                error.message || String(error)
            );
        }
    }

    /*
    ============================================================
    18. FINAL FAIL-CLOSED CHECK
    ============================================================
    */

    function finalFailClosedCheck() {
        const criticalTests = [
            "hardening_wrong_link_id",
            "hardening_unauthorized_parent",
            "hardening_non_participant",
            "hardening_wrong_permission",
            "hardening_unauthorized_conversation_access",
            "relationship_revocation_verified",
            "authorization_denied_after_revocation",
            "old_link_cannot_restore_access",
            "revoked_link_verified",
            "conversation_denied_after_revocation",
            "message_denied_after_revocation",
            "close_denied_after_revocation"
        ];

        const failures = criticalTests.filter(function (testName) {
            const result = results.find(function (item) {
                return item.name === testName;
            });

            return !result || result.passed !== true;
        });

        return record(
            "final_fail_closed_check",
            failures.length === 0,
            failures.length === 0
                ? "All critical denial paths passed."
                : "Critical denial test(s) failed: " + failures.join(", ")
        );
    }

    /*
    ============================================================
    REPORT
    ============================================================
    */

    function getPassedCount() {
        return results.filter(function (result) {
            return result.passed;
        }).length;
    }

    function getFailedCount() {
        return results.filter(function (result) {
            return !result.passed;
        }).length;
    }

    function getReport() {
        return {
            version: VERSION,
            group: TEST_GROUP,
            totalTests: results.length,
            passed: getPassedCount(),
            failed: getFailedCount(),
            passedAll: getFailedCount() === 0,
            relationshipId: relationshipId,
            linkId: linkId,
            conversationId: conversationId,
            results: results.slice()
        };
    }

    function printReport() {
        const report = getReport();

        console.log(
            "============================================================"
        );

        console.log(
            "PACIFIC EDUCATION SECURE COMMUNICATION SECURITY TEST"
        );

        console.log("VERSION:", report.version);
        console.log("TOTAL:", report.totalTests);
        console.log("PASSED:", report.passed);
        console.log("FAILED:", report.failed);
        console.log("PASSED ALL:", report.passedAll);

        console.log(
            "============================================================"
        );

        report.results.forEach(function (result) {
            console.log(
                result.passed ? "PASS" : "FAIL",
                result.name,
                result.details
            );
        });

        return report;
    }

    /*
    ============================================================
    MAIN TEST RUNNER
    ============================================================
    */

    function runSecurityTest() {
        results.length = 0;

        relationshipId = null;
        linkId = null;
        conversationId = null;

        console.log(
            "Starting
