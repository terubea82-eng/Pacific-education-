/*
============================================================
PACIFIC EDUCATION
SECURE COMMUNICATION SECURITY TEST
VERSION 1.6.0

OWNER / DEVELOPER TEST HARNESS

Purpose:
Verify the complete security chain:

Identity
→ Role
→ Verified Relationship
→ Approved Link
→ Permission
→ Conversation
→ Message
→ Conversation Read
→ Conversation Close
→ Link Revocation
→ Relationship Revocation
→ Access Denied

IMPORTANT:
This is a TEST HARNESS only.

Do NOT add this file to normal production startup.

Production security MUST be enforced server-side.

Prototype storage is NOT production-grade secure storage.

No credentials, passwords, API keys, authentication tokens,
or payment secrets are used.
============================================================
*/

(function () {
    "use strict";

    const VERSION = "1.6.0";

    const EXPECTED_COMMUNICATION_VERSION = "1.4.0";

    const TEST_GROUP = Object.freeze({
        name:
            "Pacific Education Secure Communication Test Group",
        jurisdiction: "Fiji"
    });

    /*
     * These are complete authorized user objects.
     * They are used only for owner/developer testing.
     */
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

    const unauthorizedUser = Object.freeze({
        id: "unauthorized-001",
        role: "parent",
        authorized: false
    });

    let results = [];

    let relationshipId = null;

    let linkId = null;

    let conversationId = null;


    /* =====================================================
       MODULE ACCESS
       ===================================================== */

    function getModules() {
        return {
            relationship:
                window
                    .PacificEducationVerifiedEducationRelationship ||
                null,

            authorization:
                window
                    .PacificEducationSecureLinkAuthorization ||
                null,

            communication:
                window
                    .PacificEducationSecureCommunication ||
                null
        };
    }


    function assertFunction(
        module,
        name,
        moduleName
    ) {
        if (
            !module ||
            typeof module[name] !== "function"
        ) {
            throw new Error(
                moduleName +
                "." +
                name +
                " is unavailable."
            );
        }
    }


    function assertModules(modules) {
        assertFunction(
            modules.relationship,
            "verifyRelationship",
            "relationship"
        );

        assertFunction(
            modules.relationship,
            "checkRelationship",
            "relationship"
        );

        assertFunction(
            modules.relationship,
            "revokeRelationship",
            "relationship"
        );

        assertFunction(
            modules.relationship,
            "getUserRelationships",
            "relationship"
        );

        assertFunction(
            modules.authorization,
            "requestLink",
            "authorization"
        );

        assertFunction(
            modules.authorization,
            "approveLink",
            "authorization"
        );

        assertFunction(
            modules.authorization,
            "authorizeAccess",
            "authorization"
        );

        assertFunction(
            modules.authorization,
            "revokeLink",
            "authorization"
        );

        assertFunction(
            modules.authorization,
            "getUserLinks",
            "authorization"
        );

        assertFunction(
            modules.communication,
            "createConversation",
            "communication"
        );

        assertFunction(
            modules.communication,
            "sendMessage",
            "communication"
        );

        assertFunction(
            modules.communication,
            "getConversation",
            "communication"
        );

        assertFunction(
            modules.communication,
            "closeConversation",
            "communication"
        );

        assertFunction(
            modules.communication,
            "getStatus",
            "communication"
        );

        return true;
    }


    /* =====================================================
       RESULT HELPERS
       ===================================================== */

    function record(
        name,
        passed,
        details
    ) {
        const result = {
            name: name,

            passed:
                Boolean(passed),

            details:
                typeof details === "string"
                    ? details
                    : "",

            timestamp:
                new Date().toISOString()
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


    function errorMessage(error) {
        return (
            error &&
            typeof error.message === "string"
        )
            ? error.message
            : String(error);
    }


    function expectDenied(
        name,
        action
    ) {
        try {
            const value = action();

            if (
                value &&
                value.allowed === false
            ) {
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
                "Operation returned without a recognized denial."
            );

        } catch (error) {
            return record(
                name,
                true,
                "Operation correctly denied: " +
                errorMessage(error)
            );
        }
    }


    function expectSuccess(
        name,
        action
    ) {
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
                errorMessage(error)
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
                typeof
                    modules.relationship
                        .resetPrototypeState ===
                    "function"
            ) {
                modules.relationship
                    .resetPrototypeState();
            }
        } catch (error) {
            console.warn(
                "Relationship reset warning:",
                errorMessage(error)
            );
        }

        try {
            if (
                modules.authorization &&
                typeof
                    modules.authorization
                        .resetPrototypeState ===
                    "function"
            ) {
                modules.authorization
                    .resetPrototypeState();
            }
        } catch (error) {
            console.warn(
                "Authorization reset warning:",
                errorMessage(error)
            );
        }

        try {
            if (
                modules.communication &&
                typeof
                    modules.communication
                        .resetPrototypeState ===
                    "function"
            ) {
                modules.communication
                    .resetPrototypeState();
            }
        } catch (error) {
            console.warn(
                "Communication reset warning:",
                errorMessage(error)
            );
        }

        try {
            if (
                typeof localStorage !==
                "undefined"
            ) {
                localStorage.removeItem(
                    "pacificEducationSecureLinks"
                );

                localStorage.removeItem(
                    "pacificEducationSecureMessages"
                );

                localStorage.removeItem(
                    "pacificEducationVerifiedRelationships"
                );
            }
        } catch (error) {
            console.warn(
                "Storage reset warning:",
                errorMessage(error)
            );
        }

        results = [];

        relationshipId = null;

        linkId = null;

        conversationId = null;

        return true;
    }


    /* =====================================================
       TEST 1 — MODULE AVAILABILITY
       ===================================================== */

    function testModuleAvailability() {
        try {
            const modules = getModules();

            assertModules(modules);

            return record(
                "module_availability",
                true,
                "All required security APIs are available."
            );

        } catch (error) {
            return record(
                "module_availability",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 2 — CLEAN STATE
       ===================================================== */

    function testCleanState() {
        try {
            resetTestState();

            return record(
                "clean_test_state",
                relationshipId === null &&
                linkId === null &&
                conversationId === null,
                "Prototype test state reset successfully."
            );

        } catch (error) {
            return record(
                "clean_test_state",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 3 — IDENTITY VALIDATION
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

        const invalidUser =
            unauthorizedUser.authorized === false;

        return record(
            "identity_validation",
            Boolean(
                validParent &&
                validTeacher &&
                invalidUser
            ),
            validParent &&
            validTeacher &&
            invalidUser
                ? "Valid and invalid identity states behave as expected."
                : "Identity validation failed."
        );
    }


    /* =====================================================
       TEST 4 — VERIFIED RELATIONSHIP
       ===================================================== */

    function createVerifiedRelationship() {
        const modules = getModules();

        try {
            const result =
                modules.relationship
                    .verifyRelationship({
                        requester:
                            parent,

                        target:
                            teacher,

                        relationshipType:
                            "parent_teacher",

                        jurisdiction:
                            TEST_GROUP.jurisdiction,

                        evidence: {
                            type:
                                "linked_student_relationship",

                            verified:
                                true
                        },

                        authority: {
                            consent:
                                true
                        }
                    });

            relationshipId =
                result &&
                typeof result.id === "string"
                    ? result.id
                    : null;

            return record(
                "verified_relationship_created",
                Boolean(relationshipId),
                relationshipId
                    ? "Verified relationship created with result.id."
                    : "Verified relationship ID missing."
            );

        } catch (error) {
            return record(
                "verified_relationship_created",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 5 — RELATIONSHIP CHECK
       ===================================================== */

    function testRelationshipCheck() {
        const modules = getModules();

        try {
            if (!relationshipId) {
                throw new Error(
                    "Relationship ID is unavailable."
                );
            }

            const result =
                modules.relationship
                    .checkRelationship({
                        relationshipId:
                            relationshipId,

                        requester:
                            parent,

                        target:
                            teacher,

                        relationshipType:
                            "parent_teacher"
                    });

            return record(
                "verified_relationship_check",
                Boolean(
                    result &&
                    result.allowed === true &&
                    result.relationshipId ===
                        relationshipId
                ),
                result &&
                result.allowed === true
                    ? "Verified relationship confirmed."
                    : "Verified relationship was not confirmed."
            );

        } catch (error) {
            return record(
                "verified_relationship_check",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 6 — SECURE LINK REQUEST
       ===================================================== */

    function requestSecureLink() {
        const modules = getModules();

        try {
            if (!relationshipId) {
                throw new Error(
                    "Relationship must exist first."
                );
            }

            const result =
                modules.authorization
                    .requestLink({
                        requester:
                            parent,

                        target:
                            teacher,

                        linkType:
                            "parent_teacher",

                        relationship: {
                            id:
                                relationshipId,

                            type:
                                "parent_teacher"
                        },

                        relationshipId:
                            relationshipId,

                        jurisdiction:
                            TEST_GROUP.jurisdiction,

                        evidenceReference:
                            "test-verified-relationship"
                    });

            linkId =
                result &&
                typeof result.id === "string"
                    ? result.id
                    : null;

            return record(
                "secure_link_requested",
                Boolean(linkId),
                linkId
                    ? "Pending secure link created."
                    : "Secure link ID missing."
            );

        } catch (error) {
            return record(
                "secure_link_requested",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 7 — REQUESTER CANNOT APPROVE
       ===================================================== */

    function testRequesterCannotApprove() {
        const modules = getModules();

        return expectDenied(
            "requester_cannot_approve_own_link",
            function () {
                return modules.authorization
                    .approveLink({
                        linkId:
                            linkId,

                        approver:
                            parent,

                        permissions: [
                            "communication"
                        ]
                    });
            }
        );
    }


    /* =====================================================
       TEST 8 — TARGET APPROVAL
       ===================================================== */

    function approveSecureLink() {
        const modules = getModules();

        try {
            if (!linkId) {
                throw new Error(
                    "Link ID is unavailable."
                );
            }

            const result =
                modules.authorization
                    .approveLink({
                        linkId:
                            linkId,

                        approver:
                            teacher,

                        permissions: [
                            "communication"
                        ]
                    });

            const approved =
                Boolean(
                    result &&
                    result.status ===
                        "active" &&
                    Array.isArray(
                        result.permissions
                    ) &&
                    result.permissions.includes(
                        "communication"
                    )
                );

            return record(
                "secure_link_approved",
                approved,
                approved
                    ? "Link approved with communication permission."
                    : "Link was not activated correctly."
            );

        } catch (error) {
            return record(
                "secure_link_approved",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 9 — COMMUNICATION AUTHORIZATION
       ===================================================== */

    function authorizeCommunication() {
        const modules = getModules();

        try {
            const result =
                modules.authorization
                    .authorizeAccess({
                        linkId:
                            linkId,

                        requester:
                            parent,

                        requiredPermission:
                            "communication"
                    });

            return record(
                "communication_authorized",
                Boolean(
                    result &&
                    result.allowed === true
                ),
                result &&
                result.allowed === true
                    ? "Communication permission granted."
                    : "Communication permission was not granted."
            );

        } catch (error) {
            return record(
                "communication_authorized",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 10 — WRONG LINK DENIAL
       ===================================================== */

    function testWrongLinkId() {
        const modules = getModules();

        return expectDenied(
            "wrong_link_id_denied",
            function () {
                return modules.authorization
                    .authorizeAccess({
                        linkId:
                            "wrong-link-id",

                        requester:
                            parent,

                        requiredPermission:
                            "communication"
                    });
            }
        );
    }


    /* =====================================================
       TEST 11 — NON-PARTICIPANT DENIAL
       ===================================================== */

    function testNonParticipant() {
        const modules = getModules();

        return expectDenied(
            "non_participant_denied",
            function () {
                return modules.authorization
                    .authorizeAccess({
                        linkId:
                            linkId,

                        requester:
                            nonParticipant,

                        requiredPermission:
                            "communication"
                    });
            }
        );
    }


    /* =====================================================
       TEST 12 — UNAUTHORIZED IDENTITY DENIAL
       ===================================================== */

    function testInvalidIdentity() {
        const modules = getModules();

        return expectDenied(
            "invalid_identity_denied",
            function () {
                return modules.authorization
                    .authorizeAccess({
                        linkId:
                            linkId,

                        requester:
                            unauthorizedUser,

                        requiredPermission:
                            "communication"
                    });
            }
        );
    }


    /* =====================================================
       TEST 13 — WRONG PERMISSION DENIAL
       ===================================================== */

    function testWrongPermission() {
        const modules = getModules();

        return expectDenied(
            "wrong_permission_denied",
            function () {
                return modules.authorization
                    .authorizeAccess({
                        linkId:
                            linkId,

                        requester:
                            parent,

                        requiredPermission:
                            "private_information"
                    });
            }
        );
    }


    /* =====================================================
       TEST 14 — CREATE CONVERSATION
       ===================================================== */

    function createSecureConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication
                    .createConversation(
                        parent,
                        teacher,
                        {
                            linkId:
                                linkId
                        }
                    );

            conversationId =
                result &&
                typeof result.id === "string"
                    ? result.id
                    : null;

            const relationshipMatches =
                Boolean(
                    result &&
                    result.relationshipId ===
                        relationshipId
                );

            const participantsMatch =
                Boolean(
                    result &&
                    result.senderId ===
                        parent.id &&
                    result.recipientId ===
                        teacher.id
                );

            return record(
                "conversation_created",
                Boolean(
                    conversationId &&
                    relationshipMatches &&
                    participantsMatch
                ),
                conversationId &&
                relationshipMatches &&
                participantsMatch
                    ? "Authorized conversation created with correct participants and verified relationship."
                    : "Conversation security binding failed."
            );

        } catch (error) {
            return record(
                "conversation_created",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 15 — SEND MESSAGE
       ===================================================== */

    function sendSecureMessage() {
        const modules = getModules();

        try {
            const result =
                modules.communication
                    .sendMessage({
                        conversationId:
                            conversationId,

                        sender:
                            parent,

                        recipient:
                            teacher,

                        text:
                            "Pacific Education security test message.",

                        linkId:
                            linkId
                    });

            const valid =
                Boolean(
                    result &&
                    result.id &&
                    result.conversationId ===
                        conversationId &&
                    result.linkId ===
                        linkId &&
                    result.relationshipId ===
                        relationshipId &&
                    result.senderId ===
                        parent.id &&
                    result.recipientId ===
                        teacher.id
                );

            return record(
                "message_sent",
                valid,
                valid
                    ? "Authorized message created with security bindings."
                    : "Message security bindings failed."
            );

        } catch (error) {
            return record(
                "message_sent",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 16 — GET CONVERSATION
       ===================================================== */

    function getSecureConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication
                    .getConversation(
                        conversationId,
                        parent,
                        teacher
                    );

            const valid =
                Boolean(
                    result &&
                    result.conversation &&
                    result.conversation.id ===
                        conversationId &&
                    Array.isArray(
                        result.messages
                    )
                );

            return record(
                "conversation_read_authorized",
                valid,
                valid
                    ? "Authorized participant retrieved conversation using both real participant objects."
                    : "Conversation retrieval failed."
            );

        } catch (error) {
            return record(
                "conversation_read_authorized",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 17 — NON-PARTICIPANT CONVERSATION DENIAL
       ===================================================== */

    function testConversationNonParticipant() {
        const modules = getModules();

        return expectDenied(
            "conversation_non_participant_denied",
            function () {
                return modules.communication
                    .getConversation(
                        conversationId,
                        nonParticipant,
                        teacher
                    );
            }
        );
    }


    /* =====================================================
       TEST 18 — UNAUTHORIZED CONVERSATION DENIAL
       ===================================================== */

    function testUnauthorizedConversation() {
        const modules = getModules();

        return expectDenied(
            "conversation_unauthorized_identity_denied",
            function () {
                return modules.communication
                    .getConversation(
                        conversationId,
                        unauthorizedUser,
                        teacher
                    );
            }
        );
    }


    /* =====================================================
       TEST 19 — CLOSE CONVERSATION
       ===================================================== */

    function closeSecureConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication
                    .closeConversation(
                        conversationId,
                        parent,
                        teacher
                    );

            return record(
                "conversation_closed",
                Boolean(
                    result &&
                    result.status ===
                        "closed" &&
                    result.closedAt
                ),
                result &&
                result.status === "closed"
                    ? "Conversation closed after authorization and relationship recheck."
                    : "Conversation was not closed correctly."
            );

        } catch (error) {
            return record(
                "conversation_closed",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 20 — CLOSED CONVERSATION DENIAL
       ===================================================== */

    function testClosedConversationDenied() {
        const modules = getModules();

        return expectDenied(
            "closed_conversation_denied",
            function () {
                return modules.communication
                    .getConversation(
                        conversationId,
                        parent,
                        teacher
                    );
            }
        );
    }


    /* =====================================================
       TEST 21 — LINK REVOCATION
       ===================================================== */

    function revokeSecureLink() {
        const modules = getModules();

        try {
            const result =
                modules.authorization
                    .revokeLink({
                        linkId:
                            linkId,

                        revoker:
                            parent,

                        reason:
                            "Security test revocation."
                    });

            return record(
                "secure_link_revoked",
                Boolean(
                    result &&
                    result.status ===
                        "revoked" &&
                    Array.isArray(
                        result.permissions
                    ) &&
                    result.permissions.length ===
                        0
                ),
                result &&
                result.status === "revoked"
                    ? "Link revoked and permissions cleared."
                    : "Link revocation did not produce the expected state."
            );

        } catch (error) {
            return record(
                "secure_link_revoked",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 22 — ACCESS AFTER LINK REVOCATION
       ===================================================== */

    function testAccessAfterLinkRevocation() {
        const modules = getModules();

        return expectDenied(
            "access_after_link_revocation_denied",
            function () {
                return modules.authorization
                    .authorizeAccess({
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
       TEST 23 — MESSAGE AFTER LINK REVOCATION
       ===================================================== */

    function testMessageAfterRevocationDenied() {
        const modules = getModules();

        return expectDenied(
            "message_after_link_revocation_denied",
            function () {
                return modules.communication
                    .sendMessage({
                        conversationId:
                            conversationId,

                        sender:
                            parent,

                        recipient:
                            teacher,

                        text:
                            "This message must be denied.",

                        linkId:
                            linkId
                    });
            }
        );
    }


    /* =====================================================
       TEST 24 — RELATIONSHIP REVOCATION
       ===================================================== */

    function revokeVerifiedRelationship() {
        const modules = getModules();

        try {
            if (!relationshipId) {
                throw new Error(
                    "Relationship ID is unavailable."
                );
            }

            const result =
                modules.relationship
                    .revokeRelationship({
                        relationshipId:
                            relationshipId,

                        revoker:
                            parent,

                        reason:
                            "Security test relationship revocation."
                    });

            return record(
                "verified_relationship_revoked",
                Boolean(
                    result &&
                    result.status ===
                        "revoked"
                ),
                result &&
                result.status === "revoked"
                    ? "Verified relationship revoked by participant."
                    : "Relationship was not revoked correctly."
            );

        } catch (error) {
            return record(
                "verified_relationship_revoked",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 25 — STATUS SECURITY CONTRACT
       ===================================================== */

    function testCommunicationStatus() {
        const modules = getModules();

        try {
            const status =
                modules.communication
                    .getStatus();

            const valid =
                Boolean(
                    status &&

                    status.version ===
                        EXPECTED_COMMUNICATION_VERSION &&

                    status.verifiedRelationshipRequired ===
                        true &&

                    status.approvedLinkRequired ===
                        true &&

                    status.communicationPermissionRequired ===
                        true &&

                    status.rawIdRelationshipLookup ===
                        false &&

                    status.syntheticAuthorizedUsers ===
                        false &&

                    status.completeAuthorizedUserRequired ===
                        true &&

                    status.automaticInformationAccess ===
                        false &&

                    status.prototypeOnly ===
                        true &&

                    status.backendRequiredForProduction ===
                        true
                );

            return record(
                "communication_security_status",
                valid,
                valid
                    ? "Communication v1.4.0 security contract matches the repaired architecture."
                    : "Communication security contract mismatch."
            );

        } catch (error) {
            return record(
                "communication_security_status",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 26 — NO SYNTHETIC AUTHORIZED USER FLAG
       ===================================================== */

    function testNoSyntheticAuthorizedUsers() {
        const modules = getModules();

        try {
            const status =
                modules.communication
                    .getStatus();

            return record(
                "synthetic_authorized_users_disabled",
                Boolean(
                    status &&
                    status.syntheticAuthorizedUsers ===
                        false
                ),
                status &&
                status.syntheticAuthorizedUsers ===
                    false
                    ? "Communication module does not manufacture authorized users."
                    : "Synthetic authorized-user protection is missing."
            );

        } catch (error) {
            return record(
                "synthetic_authorized_users_disabled",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 27 — RAW ID RELATIONSHIP LOOKUP DISABLED
       ===================================================== */

    function testRawIdRelationshipLookupDisabled() {
        const modules = getModules();

        try {
            const status =
                modules.communication
                    .getStatus();

            return record(
                "raw_id_relationship_lookup_disabled",
                Boolean(
                    status &&
                    status.rawIdRelationshipLookup ===
                        false
                ),
                status &&
                status.rawIdRelationshipLookup ===
                    false
                    ? "Relationship lookup requires complete authorized user objects."
                    : "Raw-ID relationship lookup protection is missing."
            );

        } catch (error) {
            return record(
                "raw_id_relationship_lookup_disabled",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST 28 — COMPLETE AUTHORIZED USER REQUIREMENT
       ===================================================== */

    function testCompleteAuthorizedUserRequirement() {
        const modules = getModules();

        try {
            const status =
                modules.communication
                    .getStatus();

            return record(
                "complete_authorized_user_required",
                Boolean(
                    status &&
                    status.completeAuthorizedUserRequired ===
                        true
                ),
                status &&
                status.completeAuthorizedUserRequired ===
                    true
                    ? "Complete authorized user objects are required."
                    : "Complete authorized user requirement is missing."
            );

        } catch (error) {
            return record(
                "complete_authorized_user_required",
                false,
                errorMessage(error)
            );
        }
    }


    /* =====================================================
       TEST SUITE
       ===================================================== */

    function runAllTests() {
        results = [];

        relationshipId = null;

        linkId = null;

        conversationId = null;

        testModuleAvailability();

        if (
            !results.length ||
            results[0].passed !== true
        ) {
            return getSummary();
        }

        testCleanState();

        testIdentityValidation();

        createVerifiedRelationship();

        if (!relationshipId) {
            return getSummary();
        }

        testRelationshipCheck();

        requestSecureLink();

        if (!linkId) {
            return getSummary();
        }

        testRequesterCannotApprove();

        approveSecureLink();

        authorizeCommunication();

        testWrongLinkId();

        testNonParticipant();

        testInvalidIdentity();

        testWrongPermission();

        createSecureConversation();

        if (!conversationId) {
            return getSummary();
        }

        sendSecureMessage();

        getSecureConversation();

        testConversationNonParticipant();

        testUnauthorizedConversation();

        closeSecureConversation();

        testClosedConversationDenied();

        revokeSecureLink();

        testAccessAfterLinkRevocation();

        testMessageAfterRevocationDenied();

        revokeVerifiedRelationship();

        testCommunicationStatus();

        testNoSyntheticAuthorizedUsers();

        testRawIdRelationshipLookupDisabled();

        testCompleteAuthorizedUserRequirement();

        return getSummary();
    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function getSummary() {
        const total =
            results.length;

        const passed =
            results.filter(
                result =>
                    result.passed === true
            ).length;

        const failed =
            total - passed;

        return {
            version:
                VERSION,

            total:
                total,

            passed:
                passed,

            failed:
                failed,

            success:
                total > 0 &&
                failed === 0,

            results:
                results.slice()
        };
    }


    /* =====================================================
       PUBLIC TEST API
       ===================================================== */

    window.PacificEducationSecureCommunicationTest =
        Object.freeze({
            version:
                VERSION,

            runAllTests:
                runAllTests,

            getSummary:
                getSummary,

            resetTestState:
                resetTestState
        });

})();
