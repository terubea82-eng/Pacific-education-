/*
============================================================
PACIFIC EDUCATION
SECURE COMMUNICATION SECURITY TEST
VERSION 1.4.0

OWNER / DEVELOPER TEST HARNESS

Purpose:
Verify:

Identity
→ Role
→ Verified Relationship
→ Approved Link
→ Permission
→ Conversation
→ Message
→ Revocation
→ Access Denied

IMPORTANT:
This is a TEST HARNESS only.

Do NOT add this file to normal production startup.

Production security MUST be enforced server-side.

Prototype storage is NOT production-grade secure storage.
============================================================
*/

(function () {
    "use strict";

    const VERSION = "1.4.0";

    const TEST_GROUP = Object.freeze({
        name: "Pacific Education Secure Communication Test Group",
        jurisdiction: "Fiji"
    });

    const parent = Object.freeze({
        id: "parent-001",
        role: "parent",
        authorized: true
    });

    const teacher = Object.freeze({
        id: "teacher-001",
        role: "teacher",
        authorized: true
    });

    const unauthorizedParent = Object.freeze({
        id: "parent-unauthorized-001",
        role: "parent",
        authorized: true
    });

    const nonParticipant = Object.freeze({
        id: "student-001",
        role: "student",
        authorized: true
    });

    const results = [];

    let relationshipId = null;
    let linkId = null;
    let conversationId = null;


    /* =====================================================
       MODULE ACCESS
       ===================================================== */

    function getModules() {
        return {
            relationship:
                window.PacificEducationVerifiedEducationRelationship ||
                null,

            authorization:
                window.PacificEducationSecureLinkAuthorization ||
                null,

            communication:
                window.PacificEducationSecureCommunication ||
                null
        };
    }


    function assertModules(modules) {
        const missing = [];

        if (!modules.relationship) {
            missing.push("relationship");
        }

        if (!modules.authorization) {
            missing.push("authorization");
        }

        if (!modules.communication) {
            missing.push("communication");
        }

        if (missing.length > 0) {
            throw new Error(
                "Required security module(s) missing: " +
                missing.join(", ")
            );
        }

        return true;
    }


    /* =====================================================
       TEST RESULT HELPERS
       ===================================================== */

    function record(name, passed, details) {
        const result = {
            name: name,
            passed: Boolean(passed),
            details: details || "",
            timestamp: new Date().toISOString()
        };

        results.push(result);

        if (result.passed) {
            console.log(
                "PACIFIC SECURITY TEST PASS:",
                name,
                result.details
            );
        } else {
            console.error(
                "PACIFIC SECURITY TEST FAIL:",
                name,
                result.details
            );
        }

        return result;
    }


    function expectDeniedResult(name, action) {
        try {
            const value = action();

            if (value && value.allowed === false) {
                return record(
                    name,
                    true,
                    value.reason ||
                    "Access correctly denied."
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


    function expectDeniedByThrow(name, action) {
        try {
            action();

            return record(
                name,
                false,
                "Expected operation to be denied."
            );

        } catch (error) {
            return record(
                name,
                true,
                "Operation correctly denied."
            );
        }
    }


    function expectSuccess(name, action) {
        try {
            const value = action();

            if (
                value === undefined ||
                value === null
            ) {
                return record(
                    name,
                    false,
                    "Expected a successful result."
                );
            }

            return record(
                name,
                true,
                "Operation completed successfully."
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


    /* =====================================================
       RESET
       ===================================================== */

    function resetTestState() {
        const modules = getModules();

        try {
            if (
                modules.relationship &&
                typeof modules.relationship.resetPrototypeState ===
                    "function"
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
            if (
                modules.authorization &&
                typeof modules.authorization.resetPrototypeState ===
                    "function"
            ) {
                modules.authorization.resetPrototypeState();
            }
        } catch (error) {
            console.warn(
                "Authorization reset warning:",
                error && error.message
                    ? error.message
                    : error
            );
        }

        try {
            if (
                modules.communication &&
                typeof modules.communication.resetPrototypeState ===
                    "function"
            ) {
                modules.communication.resetPrototypeState();
            }
        } catch (error) {
            console.warn(
                "Communication reset warning:",
                error && error.message
                    ? error.message
                    : error
            );
        }

        try {
            localStorage.removeItem(
                "pacificEducationSecureLinks"
            );

            localStorage.removeItem(
                "pacificEducationSecureMessages"
            );

            localStorage.removeItem(
                "pacificEducationVerifiedRelationships"
            );
        } catch (error) {
            console.warn(
                "Local test storage reset warning."
            );
        }

        relationshipId = null;
        linkId = null;
        conversationId = null;
    }


    /* =====================================================
       1. MODULE AVAILABILITY
       ===================================================== */

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
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       2. CLEAN STATE
       ===================================================== */

    function testCleanState() {
        resetTestState();

        return record(
            "clean_test_state",
            relationshipId === null &&
            linkId === null &&
            conversationId === null,
            "Prototype security test state reset."
        );
    }


    /* =====================================================
       3. TEST IDENTITIES
       ===================================================== */

    function testIdentityValidation() {
        const validParent =
            typeof parent.id === "string" &&
            parent.id.trim() &&
            parent.role === "parent" &&
            parent.authorized === true;

        const validTeacher =
            typeof teacher.id === "string" &&
            teacher.id.trim() &&
            teacher.role === "teacher" &&
            teacher.authorized === true;

        return record(
            "identity_validation",
            Boolean(validParent && validTeacher),
            validParent && validTeacher
                ? "Parent and teacher test identities are valid."
                : "Test identity validation failed."
        );
    }


    /* =====================================================
       4. VERIFIED RELATIONSHIP
       ===================================================== */

    function createVerifiedRelationship() {
        const modules = getModules();

        try {
            const result =
                modules.relationship.verifyRelationship({
                    requester: parent,
                    target: teacher,
                    relationshipType: "parent_teacher",
                    jurisdiction:
                        TEST_GROUP.jurisdiction,
                    evidence: {
                        type:
                            "linked_student_relationship",
                        verified: true
                    },
                    authority: {
                        consent: true
                    }
                });

            /*
             * IMPORTANT:
             * The current relationship layer returns:
             * relationship.id
             *
             * It does NOT return:
             * relationship.relationshipId
             */
            relationshipId =
                result && result.id
                    ? result.id
                    : null;

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
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       5. SECURE LINK REQUEST
       ===================================================== */

    function requestSecureLink() {
        const modules = getModules();

        try {
            if (!relationshipId) {
                throw new Error(
                    "Relationship must exist before requesting the test link."
                );
            }

            const result =
                modules.authorization.requestLink({
                    requester: parent,
                    target: teacher,
                    linkType: "parent_teacher",

                    relationship: {
                        id: relationshipId,
                        type: "parent_teacher"
                    },

                    relationshipId: relationshipId,

                    jurisdiction:
                        TEST_GROUP.jurisdiction,

                    evidenceReference: {
                        type:
                            "linked_student_relationship",
                        verified: true
                    }
                });

            linkId =
                result && result.id
                    ? result.id
                    : null;

            return record(
                "secure_link_requested",
                Boolean(linkId),
                linkId
                    ? "Secure link created in pending state."
                    : "Link ID was not returned."
            );

        } catch (error) {
            return record(
                "secure_link_requested",
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       6. LINK APPROVAL
       ===================================================== */

    function approveSecureLink() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.approveLink({
                    linkId: linkId,
                    approver: teacher,
                    permissions: [
                        "communication"
                    ]
                });

            const approved =
                Boolean(
                    result &&
                    result.status === "active" &&
                    Array.isArray(result.permissions) &&
                    result.permissions.includes(
                        "communication"
                    )
                );

            return record(
                "secure_link_approved",
                approved,
                approved
                    ? "Link is active with communication permission."
                    : "Link approval did not produce the expected active state."
            );

        } catch (error) {
            return record(
                "secure_link_approved",
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       7. COMMUNICATION AUTHORIZATION
       ===================================================== */

    function authorizeCommunication() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: parent,
                    requiredPermission:
                        "communication"
                });

            return record(
                "communication_authorized",
                Boolean(
                    result &&
                    result.allowed === true
                ),
                result && result.allowed === true
                    ? "Communication authorization granted."
                    : "Communication authorization was not granted."
            );

        } catch (error) {
            return record(
                "communication_authorized",
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       8. WRONG LINK ID DENIAL
       ===================================================== */

    function testWrongLinkId() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_wrong_link_id",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: "wrong-link-id",
                    requester: parent,
                    requiredPermission:
                        "communication"
                });
            }
        );
    }


    /* =====================================================
       9. UNAUTHORIZED PARTICIPANT DENIAL
       ===================================================== */

    function testUnauthorizedParent() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_unauthorized_parent",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: unauthorizedParent,
                    requiredPermission:
                        "communication"
                });
            }
        );
    }


    /* =====================================================
       10. NON-PARTICIPANT DENIAL
       ===================================================== */

    function testNonParticipant() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_non_participant",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: nonParticipant,
                    requiredPermission:
                        "communication"
                });
            }
        );
    }


    /* =====================================================
       11. WRONG PERMISSION DENIAL
       ===================================================== */

    function testWrongPermission() {
        const modules = getModules();

        return expectDeniedResult(
            "hardening_wrong_permission",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: linkId,
                    requester: parent,
                    requiredPermission:
                        "unauthorized_test_permission"
                });
            }
        );
    }


    /* =====================================================
       12. CONVERSATION CREATION
       ===================================================== */

    function createSecureConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication.createConversation(
                    parent,
                    teacher,
                    {
                        linkId: linkId
                    }
                );

            conversationId =
                result && result.conversationId
                    ? result.conversationId
                    : null;

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
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       13. AUTHORIZED MESSAGE
       ===================================================== */

    function sendAuthorizedMessage() {
        const modules = getModules();

        try {
            const result =
                modules.communication.sendMessage({
                    conversationId:
                        conversationId,

                    sender:
                        parent,

                    recipient:
                        teacher,

                    text:
                        "Secure communication test message.",

                    linkId:
                        linkId
                });

            return record(
                "authorized_message_sent",
                Boolean(result),
                "Authorized message operation succeeded."
            );

        } catch (error) {
            return record(
                "authorized_message_sent",
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       14. AUTHORIZED CONVERSATION READ
       ===================================================== */

    function readAuthorizedConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication.getConversation(
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
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       15. UNAUTHORIZED CONVERSATION READ
       ===================================================== */

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


    /* =====================================================
       16. RELATIONSHIP REVOCATION
       ===================================================== */

    function revokeVerifiedRelationship() {
        const modules = getModules();

        try {
            const result =
                modules.relationship.revokeRelationship({
                    relationshipId:
                        relationshipId,

                    revoker:
                        parent,

                    reason:
                        "Security test relationship revocation."
                });

            return record(
                "relationship_revoked",
                Boolean(result),
                "Verified relationship revocation completed."
            );

        } catch (error) {
            return record(
                "relationship_revoked",
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       17. DIRECT RELATIONSHIP REVOCATION CHECK
       ===================================================== */

    function testRelationshipRevoked() {
        const modules = getModules();

        try {
            const result =
                modules.relationship.checkRelationship({
                    relationshipId:
                        relationshipId,

                    requester:
                        parent,

                    target:
                        teacher,

                    relationshipType:
                        "parent_teacher"
                });

            const denied =
                Boolean(
                    result &&
                    result.allowed === false
                );

            return record(
                "relationship_revocation_verified",
                denied,
                denied
                    ? "Relationship is no longer authorized."
                    : "Relationship still appears authorized."
            );

        } catch (error) {
            return record(
                "relationship_revocation_verified",
                false,
                error && error.message
                    ? error.message
                    : String(error)
            );
        }
    }


    /* =====================================================
       18. AUTHORIZATION AFTER RELATIONSHIP REVOCATION
       ===================================================== */

    function testAuthorizationAfterRevocation() {
        const modules = getModules();

        return expectDeniedResult(
            "authorization_denied_after_revocation",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId:
                        linkId,

                    requester:
                        parent,

                    requiredPermission:
                        "communication"
                });
            }
        );
    }


    /* =====================================================
       19. OLD LINK CANNOT RESTORE ACCESS
       ===================================================== */

    function testOldLinkCannotRestoreAccess() {
        const modules = getModules();

        return expectDeniedResult(
            "old_link_cannot_restore_access",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId:
                        linkId,

                    requester:
                        parent,

                    requiredPermission:
                        "communication"
                });
            }
        );
    }


    /* =====================================================
       20. LINK REVOCATION
       ===================================================== */

    function revokeSecureLink() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.revokeLink({
