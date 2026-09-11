/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE COMMUNICATION SECURITY TEST
 * =========================================================
 * Version 1.7.0
 *
 * OWNER / DEVELOPER TEST HARNESS
 *
 * Purpose:
 * Verify:
 * Authorized User
 * → Verified Relationship
 * → Pending Link
 * → Target Approval
 * → Authorized Link
 * → Communication Permission
 * → Conversation
 * → Message
 * → Authorized Read
 * → Link Revocation
 * → Access Denied
 * → Relationship Revocation
 *
 * TEST HARNESS ONLY.
 * Production authorization MUST remain server-side.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.7.0";
    const EXPECTED_COMMUNICATION_VERSION = "1.4.1";
    const EXPECTED_AUTHORIZATION_VERSION = "1.6.0";

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

    function assertFunction(module, name, moduleName) {
        if (!module || typeof module[name] !== "function") {
            throw new Error(
                moduleName + "." + name + " is unavailable."
            );
        }
    }

    function assertModules(modules) {
        [
            "verifyRelationship",
            "checkRelationship",
            "revokeRelationship",
            "getUserRelationships"
        ].forEach(name =>
            assertFunction(
                modules.relationship,
                name,
                "relationship"
            )
        );

        [
            "requestLink",
            "approveLink",
            "authorizeAccess",
            "revokeLink",
            "getUserLinks"
        ].forEach(name =>
            assertFunction(
                modules.authorization,
                name,
                "authorization"
            )
        );

        [
            "createConversation",
            "sendMessage",
            "getConversation",
            "closeConversation",
            "getStatus"
        ].forEach(name =>
            assertFunction(
                modules.communication,
                name,
                "communication"
            )
        );
    }

    function record(name, passed, details) {
        const result = {
            name,
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

    function errorMessage(error) {
        return error && typeof error.message === "string"
            ? error.message
            : String(error);
    }

    function expectDenied(name, action) {
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
                "Operation was not denied."
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
                errorMessage(error)
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
                errorMessage(error)
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
                errorMessage(error)
            );
        }

        results = [];
        relationshipId = null;
        linkId = null;
        conversationId = null;

        return true;
    }

    function testModuleAvailability() {
        try {
            const modules = getModules();

            assertModules(modules);

            const communicationStatus =
                modules.communication.getStatus();

            const authorizationStatus =
                typeof modules.authorization.getStatus ===
                "function"
                    ? modules.authorization.getStatus()
                    : null;

            const communicationVersionOk =
                Boolean(
                    communicationStatus &&
                    communicationStatus.version ===
                        EXPECTED_COMMUNICATION_VERSION
                );

            const authorizationVersionOk =
                Boolean(
                    !authorizationStatus ||
                    authorizationStatus.version ===
                        EXPECTED_AUTHORIZATION_VERSION
                );

            return record(
                "module_availability",
                communicationVersionOk &&
                    authorizationVersionOk,
                communicationVersionOk &&
                authorizationVersionOk
                    ? "Required security APIs are available."
                    : "Security module version mismatch."
            );
        } catch (error) {
            return record(
                "module_availability",
                false,
                errorMessage(error)
            );
        }
    }

    function testCleanState() {
        resetTestState();

        return record(
            "clean_test_state",
            relationshipId === null &&
                linkId === null &&
                conversationId === null,
            "Prototype test state reset."
        );
    }

    function testIdentityValidation() {
        const validParent =
            parent.id &&
            parent.role === "parent" &&
            parent.authorized === true;

        const validTeacher =
            teacher.id &&
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
            "Identity states checked."
        );
    }

    function createVerifiedRelationship() {
        const modules = getModules();

        try {
            const result =
                modules.relationship.verifyRelationship({
                    requester: parent,
                    target: teacher,
                    relationshipType: "parent_teacher",
                    jurisdiction: "Fiji",
                    evidence: {
                        type: "linked_student_relationship",
                        verified: true
                    },
                    authority: {
                        consent: true
                    }
                });

            relationshipId =
                result &&
                typeof result.id === "string"
                    ? result.id
                    : result &&
                      typeof result.relationshipId === "string"
                        ? result.relationshipId
                        : null;

            return record(
                "verified_relationship_created",
                Boolean(relationshipId),
                relationshipId
                    ? "Verified relationship created."
                    : "Relationship ID missing."
            );
        } catch (error) {
            return record(
                "verified_relationship_created",
                false,
                errorMessage(error)
            );
        }
    }

    function testRelationshipCheck() {
        const modules = getModules();

        try {
            const result =
                modules.relationship.checkRelationship({
                    relationshipId,
                    requester: parent,
                    target: teacher,
                    relationshipType: "parent_teacher"
                });

            return record(
                "verified_relationship_check",
                Boolean(
                    result &&
                    result.allowed === true &&
                    result.relationshipId === relationshipId
                ),
                "Verified relationship checked."
            );
        } catch (error) {
            return record(
                "verified_relationship_check",
                false,
                errorMessage(error)
            );
        }
    }

    function requestSecureLink() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.requestLink({
                    requester: parent,
                    target: teacher,
                    linkType: "parent_teacher",
                    relationshipId,
                    jurisdiction: "Fiji",
                    evidenceReference:
                        "test-verified-relationship"
                });

            linkId =
                result &&
                typeof result.linkId === "string"
                    ? result.linkId
                    : null;

            return record(
                "secure_link_requested",
                Boolean(
                    linkId &&
                    result.status === "pending"
                ),
                "Pending secure link requested."
            );
        } catch (error) {
            return record(
                "secure_link_requested",
                false,
                errorMessage(error)
            );
        }
    }

    function testRequesterCannotApprove() {
        const modules = getModules();

        return expectDenied(
            "requester_cannot_approve_own_link",
            function () {
                return modules.authorization.approveLink({
                    linkId,
                    approver: parent
                });
            }
        );
    }

    function approveSecureLink() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.approveLink({
                    linkId,
                    approver: teacher
                });

            return record(
                "secure_link_approved",
                Boolean(
                    result &&
                    result.status === "authorized" &&
                    Array.isArray(result.permissions) &&
                    result.permissions.includes(
                        "communication"
                    )
                ),
                "Target approval checked."
            );
        } catch (error) {
            return record(
                "secure_link_approved",
                false,
                errorMessage(error)
            );
        }
    }

    function authorizeCommunication() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.authorizeAccess({
                    linkId,
                    user: parent,
                    permission: "communication"
                });

            return record(
                "communication_authorized",
                Boolean(
                    result &&
                    result.allowed === true &&
                    result.linkId === linkId &&
                    result.permission === "communication"
                ),
                "Communication authorization checked."
            );
        } catch (error) {
            return record(
                "communication_authorized",
                false,
                errorMessage(error)
            );
        }
    }

    function testWrongLinkId() {
        const modules = getModules();

        return expectDenied(
            "wrong_link_id_denied",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId: "wrong-link-id",
                    user: parent,
                    permission: "communication"
                });
            }
        );
    }

    function testNonParticipant() {
        const modules = getModules();

        return expectDenied(
            "non_participant_denied",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId,
                    user: nonParticipant,
                    permission: "communication"
                });
            }
        );
    }

    function testInvalidIdentity() {
        const modules = getModules();

        return expectDenied(
            "invalid_identity_denied",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId,
                    user: unauthorizedUser,
                    permission: "communication"
                });
            }
        );
    }

    function testWrongPermission() {
        const modules = getModules();

        return expectDenied(
            "wrong_permission_denied",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId,
                    user: parent,
                    permission: "private_information"
                });
            }
        );
    }

    function createSecureConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication.createConversation(
                    parent,
                    teacher,
                    { linkId }
                );

            conversationId =
                result &&
                typeof result.id === "string"
                    ? result.id
                    : null;

            const valid = Boolean(
                conversationId &&
                result.relationshipId === relationshipId &&
                result.linkId === linkId &&
                result.linkType === "parent_teacher" &&
                result.senderId === parent.id &&
                result.recipientId === teacher.id &&
                result.status === "active"
            );

            return record(
                "conversation_created",
                valid,
                "Conversation security bindings checked."
            );
        } catch (error) {
            return record(
                "conversation_created",
                false,
                errorMessage(error)
            );
        }
    }

    function sendSecureMessage() {
        const modules = getModules();

        try {
            const result =
                modules.communication.sendMessage({
                    conversationId,
                    sender: parent,
                    recipient: teacher,
                    text:
                        "Pacific Education security test message.",
                    linkId
                });

            const valid = Boolean(
                result &&
                result.id &&
                result.conversationId ===
                    conversationId &&
                result.senderId === parent.id &&
                result.recipientId === teacher.id &&
                result.senderRole === "parent" &&
                result.recipientRole === "teacher"
            );

            return record(
                "message_sent",
                valid,
                "Message security fields checked."
            );
        } catch (error) {
            return record(
                "message_sent",
                false,
                errorMessage(error)
            );
        }
    }

    function getSecureConversation() {
        const modules = getModules();

        try {
            const result =
                modules.communication.getConversation(
                    conversationId,
                    parent,
                    teacher
                );

            const valid = Boolean(
                result &&
                result.id === conversationId &&
                result.linkId === linkId &&
                result.relationshipId ===
                    relationshipId &&
                Array.isArray(result.messages) &&
                result.messages.length >= 1
            );

            return record(
                "conversation_read_authorized",
                valid,
                "Authorized conversation read checked."
            );
        } catch (error) {
            return record(
                "conversation_read_authorized",
                false,
                errorMessage(error)
            );
        }
    }

    function testConversationNonParticipant() {
        const modules = getModules();

        return expectDenied(
            "conversation_non_participant_denied",
            function () {
                return modules.communication.getConversation(
                    conversationId,
                    nonParticipant,
                    teacher
                );
            }
        );
    }

    function testUnauthorizedConversation() {
        const modules = getModules();

        return expectDenied(
            "conversation_unauthorized_identity_denied",
            function () {
                return modules.communication.getConversation(
                    conversationId,
                    unauthorizedUser,
                    teacher
                );
            }
        );
    }

    function testStatusContract() {
        const modules = getModules();

        try {
            const status =
                modules.communication.getStatus();

            const valid = Boolean(
                status &&
                status.version ===
                    EXPECTED_COMMUNICATION_VERSION &&
                status.available === true &&
                status.prototypeOnly === true &&
                status.productionServerAuthorizationRequired ===
                    true &&
                status.automaticInformationAccess === false &&
                status.secretsStored === false &&
                status.passwordsStored === false &&
                status.accessTokensStored === false &&
                status.paymentSecretsStored === false &&
                status.customerFundsHeld === false &&
                status.localStoragePrototypeOnly === true &&
                status.requiredPermission ===
                    "communication" &&
                Array.isArray(
                    status.supportedRoles
                ) &&
                status.supportedRoles.includes(
                    "student"
                ) &&
                status.supportedRoles.includes(
                    "teacher"
                ) &&
                status.supportedRoles.includes(
                    "parent"
                ) &&
                status.supportedRoles.includes(
                    "ministry"
                ) &&
                Array.isArray(
                    status.supportedLinkTypes
                ) &&
                status.supportedLinkTypes.includes(
                    "parent_teacher"
                )
            );

            return record(
                "communication_security_status",
                valid,
                "Communication status contract checked."
            );
        } catch (error) {
            return record(
                "communication_security_status",
                false,
                errorMessage(error)
            );
        }
    }

    function revokeSecureLink() {
        const modules = getModules();

        try {
            const result =
                modules.authorization.revokeLink({
                    linkId,
                    revoker: parent,
                    reason:
                        "Security test revocation."
                });

            return record(
                "secure_link_revoked",
                Boolean(
                    result &&
                    result.status === "revoked"
                ),
                "Link revocation checked."
            );
        } catch (error) {
            return record(
                "secure_link_revoked",
                false,
                errorMessage(error)
            );
        }
    }

    function testAccessAfterLinkRevocation() {
        const modules = getModules();

        return expectDenied(
            "access_after_link_revocation_denied",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId,
                    user: parent,
                    permission: "communication"
                });
            }
        );
    }

    function testMessageAfterLinkRevocationDenied() {
        const modules = getModules();

        return expectDenied(
            "message_after_link_revocation_denied",
            function () {
                return modules.communication.sendMessage({
                    conversationId,
                    sender: parent,
                    recipient: teacher,
                    text:
                        "This message must be denied.",
                    linkId
                });
            }
        );
    }

    function revokeVerifiedRelationship() {
        const modules = getModules();

        try {
            const result =
                modules.relationship.revokeRelationship({
                    relationshipId,
                    revoker: parent,
                    reason:
                        "Security test relationship revocation."
                });

            return record(
                "verified_relationship_revoked",
                Boolean(
                    result &&
                    result.status === "revoked"
                ),
                "Relationship revocation checked."
            );
        } catch (error) {
            return record(
                "verified_relationship_revoked",
                false,
                errorMessage(error)
            );
        }
    }

    function testAccessAfterRelationshipRevocation() {
        const modules = getModules();

        return expectDenied(
            "access_after_relationship_revocation_denied",
            function () {
                return modules.communication.getConversation(
                    conversationId,
                    parent,
                    teacher
                );
            }
        );
    }

    function testRawIdAuthorizationDenied() {
        const modules = getModules();

        return expectDenied(
            "raw_id_authorization_denied",
            function () {
                return modules.authorization.authorizeAccess({
                    linkId,
                    user: parent.id,
                    permission: "communication"
                });
            }
        );
    }

    function testNoSyntheticCredentialStorage() {
        const modules = getModules();

        try {
            const status =
                modules.communication.getStatus();

            const valid = Boolean(
                status &&
                status.prototypeOnly === true &&
                status.localStoragePrototypeOnly === true &&
                status.secretsStored === false &&
                status.passwordsStored === false &&
                status.accessTokensStored === false &&
                status.paymentSecretsStored === false &&
                status.customerFundsHeld === false
            );

            return record(
                "prototype_storage_safety",
                valid,
                "No credential or payment secret storage is reported."
            );
        } catch (error) {
            return record(
                "prototype_storage_safety",
                false,
                errorMessage(error)
            );
        }
    }

    function getSummary() {
        const total = results.length;
        const passed = results.filter(
            item => item.passed
        ).length;

        const failed = total - passed;

        return {
            version: VERSION,
            total,
            passed,
            failed,
            success:
                total > 0 &&
                failed === 0,
            results: results.slice()
        };
    }

    function runAllTests() {
        results = [];
        relationshipId = null;
        linkId = null;
        conversationId = null;

        testModuleAvailability();

        if (
            !results[0] ||
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
        testStatusContract();

        revokeSecureLink();

        testAccessAfterLinkRevocation();
        testMessageAfterLinkRevocationDenied();

        testRawIdAuthorizationDenied();

        revokeVerifiedRelationship();

        testAccessAfterRelationshipRevocation();
        testNoSyntheticCredentialStorage();

        return getSummary();
    }

    window.PacificEducationSecureCommunicationTest =
        Object.freeze({
            version: VERSION,
            runAllTests,
            getSummary,
            resetTestState
        });

})();
