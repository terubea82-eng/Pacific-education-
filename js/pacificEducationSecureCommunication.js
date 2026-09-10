/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE EDUCATION COMMUNICATION LAYER
 * =========================================================
 * Version 1.4.0
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Security flow:
 * Verified Education Relationship
 *        ↓
 * Active Approved Link
 *        ↓
 * Communication Permission
 *        ↓
 * Authorized Conversation
 *        ↓
 * Authorized Message
 *
 * Prototype only.
 * Production authorization MUST be enforced server-side.
 *
 * SECURITY RULES:
 * - Complete authorized user objects are required.
 * - Raw user IDs MUST NOT be used for relationship authorization.
 * - Synthetic authorized users MUST NOT be created.
 * - No automatic information access.
 * - No passwords, API keys, access tokens or payment secrets.
 * - localStorage is prototype storage only.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.4.0";

    const STORAGE_KEY =
        "pacificEducationSecureMessages";

    const ROLES = Object.freeze([
        "student",
        "teacher",
        "parent",
        "ministry"
    ]);

    const LINK_TYPES = Object.freeze({
        student_teacher: ["student", "teacher"],
        parent_student: ["parent", "student"],
        parent_teacher: ["parent", "teacher"],
        teacher_ministry: ["teacher", "ministry"],
        parent_ministry: ["parent", "ministry"],
        student_ministry: ["student", "ministry"]
    });

    const REQUIRED_PERMISSION = "communication";

    /*
     * =======================================================
     * SECURITY MODULE ACCESS
     * =======================================================
     */

    function getAuthorization() {
        return (
            window.PacificEducationSecureLinkAuthorization ||
            null
        );
    }

    function getRelationshipLayer() {
        return (
            window.PacificEducationVerifiedEducationRelationship ||
            null
        );
    }

    function requireSecurityModules() {
        const authorization =
            getAuthorization();

        const relationship =
            getRelationshipLayer();

        if (!authorization) {
            throw new Error(
                "Secure Link Authorization module is not loaded."
            );
        }

        if (
            typeof authorization.authorizeAccess !==
            "function"
        ) {
            throw new Error(
                "Secure Link Authorization API is missing: authorizeAccess."
            );
        }

        if (!relationship) {
            throw new Error(
                "Verified Education Relationship module is not loaded."
            );
        }

        if (
            typeof relationship.getUserRelationships !==
            "function"
        ) {
            throw new Error(
                "Verified Education Relationship API is missing: getUserRelationships."
            );
        }

        return {
            authorization,
            relationship
        };
    }

    /*
     * =======================================================
     * STATE
     * =======================================================
     */

    function emptyState() {
        return {
            conversations: [],
            messages: [],
            audit: []
        };
    }

    function load() {
        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return emptyState();
            }

            const parsed =
                JSON.parse(raw);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                !Array.isArray(
                    parsed.conversations
                ) ||
                !Array.isArray(
                    parsed.messages
                ) ||
                !Array.isArray(
                    parsed.audit
                )
            ) {
                return emptyState();
            }

            return {
                conversations:
                    parsed.conversations,

                messages:
                    parsed.messages,

                audit:
                    parsed.audit
            };
        } catch (_) {
            return emptyState();
        }
    }

    function save(state) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );
    }

    function createId(prefix) {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID ===
                "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            `${prefix}-${Date.now()}-` +
            `${Math.random()
                .toString(36)
                .slice(2, 12)}`
        );
    }

    function audit(
        state,
        action,
        details = {}
    ) {
        state.audit.push({
            id: createId("audit"),
            action,
            timestamp:
                new Date().toISOString(),
            details
        });
    }

    /*
     * =======================================================
     * PARTICIPANT VALIDATION
     * =======================================================
     */

    function validRole(role) {
        return ROLES.includes(role);
    }

    /*
     * IMPORTANT:
     * Authorization requires the COMPLETE authorized
     * user object. An ID alone is never sufficient.
     */

    function validParticipant(user) {
        return Boolean(
            user &&
            typeof user === "object" &&
            typeof user.id === "string" &&
            user.id.trim() &&
            validRole(user.role) &&
            user.authorized === true
        );
    }

    function requireParticipant(
        user,
        label
    ) {
        if (!validParticipant(user)) {
            throw new Error(
                `${label} must be a complete authorized user object.`
            );
        }

        return user;
    }

    function sameParticipant(
        first,
        second
    ) {
        return Boolean(
            first &&
            second &&
            first.id === second.id &&
            first.role === second.role
        );
    }

    function getLinkType(
        firstRole,
        secondRole
    ) {
        return (
            Object.entries(
                LINK_TYPES
            ).find(
                ([, roles]) =>
                    roles.includes(firstRole) &&
                    roles.includes(secondRole) &&
                    firstRole !== secondRole
            )?.[0] || null
        );
    }

    /*
     * =======================================================
     * RELATIONSHIP HELPERS
     * =======================================================
     */

    function getRelationshipId(
        relationship
    ) {
        if (
            !relationship ||
            typeof relationship !== "object"
        ) {
            return null;
        }

        if (
            typeof relationship.id ===
                "string" &&
            relationship.id.trim()
        ) {
            return relationship.id;
        }

        if (
            typeof relationship.relationshipId ===
                "string" &&
            relationship.relationshipId.trim()
        ) {
            return relationship.relationshipId;
        }

        return null;
    }

    /*
     * COMPLETE AUTHORIZED USER OBJECT ONLY.
     *
     * Never call:
     * getUserRelationships(user.id)
     *
     * Always call:
     * getUserRelationships(user)
     */

    function getRelationshipsForUser(user) {
        requireParticipant(
            user,
            "Relationship requester"
        );

        const {
            relationship
        } = requireSecurityModules();

        const relationships =
            relationship.getUserRelationships(
                user
            );

        if (
            !Array.isArray(
                relationships
            )
        ) {
            return [];
        }

        return relationships;
    }

    function findVerifiedRelationship(
        requester,
        recipient,
        linkType
    ) {
        requireParticipant(
            requester,
            "Requester"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            !linkType ||
            typeof linkType !== "string"
        ) {
            return null;
        }

        const relationships =
            getRelationshipsForUser(
                requester
            );

        return (
            relationships.find(
                item =>
                    item &&
                    item.status ===
                        "verified" &&
                    item.relationshipType ===
                        linkType &&
                    (
                        (
                            item.requesterId ===
                                requester.id &&
                            item.targetId ===
                                recipient.id
                        ) ||
                        (
                            item.requesterId ===
                                recipient.id &&
                            item.targetId ===
                                requester.id
                        )
                    )
            ) || null
        );
    }

    /*
     * =======================================================
     * AUTHORIZED COMMUNICATION GATE
     * =======================================================
     */

    function requireAuthorizedCommunication({
        linkId,
        requester,
        recipient
    }) {
        if (
            typeof linkId !== "string" ||
            !linkId.trim()
        ) {
            throw new Error(
                "Active approved education link is required."
            );
        }

        requireParticipant(
            requester,
            "Requester"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            sameParticipant(
                requester,
                recipient
            )
        ) {
            throw new Error(
                "Communication requires two different participants."
            );
        }

        const linkType =
            getLinkType(
                requester.role,
                recipient.role
            );

        if (!linkType) {
            throw new Error(
                "This education relationship does not permit communication."
            );
        }

        const {
            authorization
        } = requireSecurityModules();

        const access =
            authorization.authorizeAccess({
                linkId,
                requester,
                requiredPermission:
                    REQUIRED_PERMISSION
            });

        if (
            !access ||
            access.allowed !== true
        ) {
            throw new Error(
                "Communication authorization denied."
            );
        }

        const verifiedRelationship =
            findVerifiedRelationship(
                requester,
                recipient,
                linkType
            );

        if (!verifiedRelationship) {
            throw new Error(
                "Verified education relationship is required."
            );
        }

        const relationshipId =
            getRelationshipId(
                verifiedRelationship
            );

        if (!relationshipId) {
            throw new Error(
                "Verified relationship ID is missing."
            );
        }

        return {
            access,
            linkType,
            relationshipId
        };
    }

    /*
     * =======================================================
     * CREATE CONVERSATION
     * =======================================================
     */

    function createConversation(
        sender,
        recipient,
        options = {}
    ) {
        requireParticipant(
            sender,
            "Sender"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        const linkId =
            options.linkId;

        const security =
            requireAuthorizedCommunication({
                linkId,
                requester: sender,
                recipient
            });

        const state =
            load();

        const conversation = {
            id:
                createId(
                    "conversation"
                ),

            linkId,

            relationshipId:
                security.relationshipId,

            linkType:
                security.linkType,

            participants: [
                sender.id,
                recipient.id
            ],

            participantRoles: [
                sender.role,
                recipient.role
            ],

            status:
                "active",

            createdAt:
                new Date().toISOString(),

            closedAt:
                null
        };

        state.conversations.push(
            conversation
        );

        audit(
            state,
            "CONVERSATION_CREATED",
            {
                conversationId:
                    conversation.id,

                linkId,

                relationshipId:
                    security.relationshipId,

                linkType:
                    security.linkType
            }
        );

        save(state);

        return conversation;
    }

    /*
     * =======================================================
     * SEND MESSAGE
     * =======================================================
     */

    function sendMessage({
        conversationId,
        sender,
        recipient,
        text,
        linkId
    }) {
        if (
            typeof conversationId !==
                "string" ||
            !conversationId.trim()
        ) {
            throw new Error(
                "Valid conversation ID required."
            );
        }

        requireParticipant(
            sender,
            "Sender"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            throw new Error(
                "Message cannot be empty."
            );
        }

        const security =
            requireAuthorizedCommunication({
                linkId,
                requester: sender,
                recipient
            });

        const state =
            load();

        const conversation =
            state.conversations.find(
                item =>
                    item &&
                    item.id ===
                        conversationId &&
                    item.status ===
                        "active" &&
                    item.linkId ===
                        linkId &&
                    item.relationshipId ===
                        security.relationshipId &&
                    Array.isArray(
                        item.participants
                    ) &&
                    item.participants.length ===
                        2 &&
                    item.participants.includes(
                        sender.id
                    ) &&
                    item.participants.includes(
                        recipient.id
                    )
            );

        if (!conversation) {
            throw new Error(
                "Active authorized conversation not found."
            );
        }

        const message = {
            id:
                createId("message"),

            conversationId,

            linkId,

            relationshipId:
                security.relationshipId,

            senderId:
                sender.id,

            recipientId:
                recipient.id,

            senderRole:
                sender.role,

            recipientRole:
                recipient.role,

            text:
                text.trim(),

            createdAt:
                new Date().toISOString()
        };

        state.messages.push(
            message
        );

        audit(
            state,
            "MESSAGE_SENT",
            {
                conversationId,

                messageId:
                    message.id,

                linkId,

                relationshipId:
                    security.relationshipId
            }
        );

        save(state);

        if (
            typeof window.CustomEvent ===
            "function"
        ) {
            window.dispatchEvent(
                new CustomEvent(
                    "pacificEducationMessageSent",
                    {
                        detail: {
                            conversationId,
                            messageId:
                                message.id
                        }
                    }
                )
            );
        }

        return message;
    }

    /*
     * =======================================================
     * GET CONVERSATION
     * =======================================================
     *
     * SECURITY:
     * The actual requester AND actual recipient must be
     * supplied by the caller.
     *
     * This function NEVER manufactures:
     *
     * {
     *     authorized: true
     * }
     *
     * for another user.
     */

    function getConversation(
        conversationId,
        requester,
        recipient
    ) {
        if (
            typeof conversationId !==
                "string" ||
            !conversationId.trim()
        ) {
            throw new Error(
                "Valid conversation ID required."
            );
        }

        requireParticipant(
            requester,
            "Requester"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            sameParticipant(
                requester,
                recipient
            )
        ) {
            throw new Error(
                "Conversation requires two different participants."
            );
        }

        const state =
            load();

        const conversation =
            state.conversations.find(
                item =>
                    item &&
                    item.id ===
                        conversationId &&
                    item.status ===
                        "active" &&
                    Array.isArray(
                        item.participants
                    ) &&
                    item.participants.length ===
                        2 &&
                    item.participants.includes(
                        requester.id
                    ) &&
                    item.participants.includes(
                        recipient.id
                    )
            );

        if (!conversation) {
            throw new Error(
                "Conversation access denied."
            );
        }

        const requesterIndex =
            conversation.participants.indexOf(
                requester.id
            );

        const recipientIndex =
            conversation.participants.indexOf(
                recipient.id
            );

        if (
            requesterIndex < 0 ||
            recipientIndex < 0 ||
            requesterIndex ===
                recipientIndex
        ) {
            throw new Error(
                "Conversation participant structure is invalid."
            );
        }

        if (
            !Array.isArray(
                conversation.participantRoles
            ) ||
            conversation.participantRoles.length !==
                2
        ) {
            throw new Error(
                "Conversation participant roles are invalid."
            );
        }

        if (
            conversation.participantRoles[
                requesterIndex
            ] !== requester.role
        ) {
            throw new Error(
                "Requester role does not match the conversation."
            );
        }

        if (
            conversation.participantRoles[
                recipientIndex
            ] !== recipient.role
        ) {
            throw new Error(
                "Recipient role does not match the conversation."
            );
        }

        const security =
            requireAuthorizedCommunication({
                linkId:
                    conversation.linkId,

                requester,

                recipient
            });

        if (
            security.relationshipId !==
            conversation.relationshipId
        ) {
            throw new Error(
                "Verified relationship does not match the conversation."
            );
        }

        return {
            conversation,

            messages:
                state.messages.filter(
                    message =>
                        message &&
                        message.conversationId ===
                            conversationId &&
                        message.linkId ===
                            conversation.linkId &&
                        message.relationshipId ===
                            conversation.relationshipId
                )
        };
    }

    /*
     * =======================================================
     * CLOSE CONVERSATION
     * =======================================================
     */

    function closeConversation(
        conversationId,
        requester,
        recipient
    ) {
        if (
            typeof conversationId !==
                "string" ||
            !conversationId.trim()
        ) {
            throw new Error(
                "Valid conversation ID required."
            );
        }

        requireParticipant(
            requester,
            "Requester"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            sameParticipant(
                requester,
                recipient
            )
        ) {
            throw new Error(
                "Conversation requires two different participants."
            );
        }

        const state =
            load();

        const conversation =
            state.conversations.find(
                item =>
                    item &&
                    item.id ===
                        conversationId &&
                    item.status ===
                        "active" &&
                    Array.isArray(
                        item.participants
                    ) &&
                    item.participants.length ===
                        2 &&
                    item.participants.includes(
                        requester.id
                    ) &&
                    item.participants.includes(
                        recipient.id
                    )
            );

        if (!conversation) {
            throw new Error(
                "Active conversation not found."
            );
        }

        const security =
            requireAuthorizedCommunication({
                linkId:
                    conversation.linkId,

                requester,

                recipient
            });

        if (
            security.relationshipId !==
            conversation.relationshipId
        ) {
            throw new Error(
                "Verified relationship does not match the conversation."
            );
        }

        conversation.status =
            "closed";

        conversation.closedAt =
            new Date().toISOString();

        audit(
            state,
            "CONVERSATION_CLOSED",
            {
                conversationId,

                linkId:
                    conversation.linkId,

                relationshipId:
                    conversation.relationshipId
            }
        );

        save(state);

        return conversation;
    }

    /*
     * =======================================================
     * STATUS
     * =======================================================
     */

    function getStatus() {
        return {
            version:
                VERSION,

            available:
                true,

            prototypeOnly:
                true,

            productionServerAuthorizationRequired:
                true,

            automaticInformationAccess:
                false,

            secretsStored:
                false,

            passwordsStored:
                false,

            accessTokensStored:
                false,

            payment
