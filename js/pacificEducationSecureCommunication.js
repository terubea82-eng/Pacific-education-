/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE EDUCATION COMMUNICATION LAYER
 * =========================================================
 * Version 1.5.0
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Security flow:
 *
 * Verified Education Relationship
 *          ↓
 * Active Approved Link
 *          ↓
 * Communication Permission
 *          ↓
 * Authorized Conversation
 *          ↓
 * Authorized Message
 *
 * PROTOTYPE ONLY
 *
 * Production authorization MUST be enforced server-side.
 *
 * SECURITY RULES:
 * - Complete authorized user objects are required.
 * - Raw user IDs must not be used as authorization objects.
 * - Synthetic authorized users must not be created.
 * - No automatic information access.
 * - No passwords are stored.
 * - No API keys are stored.
 * - No access tokens are stored.
 * - No payment secrets are stored.
 * - Pacific Education does not hold customer funds.
 * - localStorage is prototype storage only.
 *
 * CONNECTION FIX:
 * - SecureLinkAuthorization.authorizeAccess()
 *   requires { user, linkId, permission }.
 * - This module now uses that exact API.
 * - Authorized links use status "authorized".
 * - Verified relationships are checked through the
 *   actual relationship-layer API.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.4.1";

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

    const REQUIRED_PERMISSION =
        "communication";


    /*
     * =====================================================
     * SECURITY MODULE ACCESS
     * =====================================================
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

        const relationshipLayer =
            getRelationshipLayer();

        if (
            !authorization ||
            typeof authorization.authorizeAccess !==
                "function"
        ) {
            throw new Error(
                "Pacific Education secure link authorization module is unavailable."
            );
        }

        if (
            !relationshipLayer ||
            typeof relationshipLayer.getUserRelationships !==
                "function" ||
            typeof relationshipLayer.checkRelationship !==
                "function"
        ) {
            throw new Error(
                "Pacific Education verified education relationship module is unavailable."
            );
        }

        return {
            authorization,
            relationshipLayer
        };
    }


    /*
     * =====================================================
     * PROTOTYPE STORAGE
     * =====================================================
     */

    function emptyState() {
        return {
            version: VERSION,
            conversations: [],
            auditLog: []
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
                typeof parsed !== "object"
            ) {
                return emptyState();
            }

            return {
                version: VERSION,

                conversations:
                    Array.isArray(
                        parsed.conversations
                    )
                        ? parsed.conversations
                        : [],

                auditLog:
                    Array.isArray(
                        parsed.auditLog
                    )
                        ? parsed.auditLog
                        : []
            };
        } catch (error) {
            return emptyState();
        }
    }

    function save(state) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

            return true;
        } catch (error) {
            throw new Error(
                "Secure communication prototype storage is unavailable."
            );
        }
    }


    /*
     * =====================================================
     * IDENTIFIERS AND AUDIT
     * =====================================================
     */

    function createId(prefix) {
        const safePrefix =
            String(prefix || "id");

        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID ===
                "function"
        ) {
            return (
                safePrefix +
                "_" +
                crypto.randomUUID()
            );
        }

        return (
            safePrefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 12)
        );
    }

    function audit(action, details) {
        const state = load();

        state.auditLog.push({
            id: createId("audit"),
            action,
            details: details || {},
            createdAt:
                new Date().toISOString()
        });

        if (state.auditLog.length > 500) {
            state.auditLog =
                state.auditLog.slice(-500);
        }

        save(state);
    }


    /*
     * =====================================================
     * PARTICIPANT VALIDATION
     * =====================================================
     */

    function validRole(role) {
        return ROLES.includes(role);
    }

    function validParticipant(user) {
        return Boolean(
            user &&
                typeof user === "object" &&
                typeof user.id === "string" &&
                user.id.trim() !== "" &&
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
                (label || "Participant") +
                    " must be a complete authorized user object with a valid id, role, and authorized status."
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
                first.id === second.id
        );
    }


    /*
     * =====================================================
     * LINK TYPE
     * =====================================================
     */

    function getLinkType(
        firstRole,
        secondRole
    ) {
        const roles = [
            firstRole,
            secondRole
        ];

        for (
            const [
                linkType,
                supportedRoles
            ] of Object.entries(
                LINK_TYPES
            )
        ) {
            if (
                supportedRoles.includes(
                    roles[0]
                ) &&
                supportedRoles.includes(
                    roles[1]
                )
            ) {
                return linkType;
            }
        }

        return null;
    }


    /*
     * =====================================================
     * RELATIONSHIP HELPERS
     * =====================================================
     */

    function getRelationshipId(
        relationship
    ) {
        if (
            !relationship ||
            typeof relationship !==
                "object"
        ) {
            return null;
        }

        return (
            relationship.relationshipId ||
            relationship.id ||
            null
        );
    }

    function getRelationshipsForUser(
        relationshipLayer,
        user
    ) {
        const result =
            relationshipLayer.getUserRelationships(
                user
            );

        return Array.isArray(result)
            ? result
            : [];
    }

    function findVerifiedRelationship(
        relationshipLayer,
        requester,
        recipient,
        linkId
    ) {
        const relationships =
            getRelationshipsForUser(
                relationshipLayer,
                requester
            );

        const relationship =
            relationships.find(
                item => {
                    if (
                        !item ||
                        typeof item !==
                            "object"
                    ) {
                        return false;
                    }

                    if (
                        item.status !==
                        "verified"
                    ) {
                        return false;
                    }

                    const relationshipId =
                        getRelationshipId(
                            item
                        );

                    if (!relationshipId) {
                        return false;
                    }

                    if (
                        linkId &&
                        item.linkId &&
                        item.linkId !==
                            linkId
                    ) {
                        return false;
                    }

                    if (
                        item.relationshipType !==
                        getLinkType(
                            requester.role,
                            recipient.role
                        )
                    ) {
                        return false;
                    }

                    const directMatch =
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
                        );

                    return directMatch;
                }
            );

        return relationship || null;
    }


    /*
     * =====================================================
     * CENTRAL COMMUNICATION SECURITY GATE
     * =====================================================
     *
     * IMPORTANT:
     * The connected authorization module expects:
     *
     * authorizeAccess({
     *     linkId,
     *     user,
     *     permission
     * })
     *
     * This module uses that exact contract.
     * =====================================================
     */

    function requireAuthorizedCommunication(
        {
            linkId,
            requester,
            recipient
        }
    ) {
        const {
            authorization,
            relationshipLayer
        } = requireSecurityModules();

        requireParticipant(
            requester,
            "Requester"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            !linkId ||
            typeof linkId !== "string"
        ) {
            throw new Error(
                "An approved education linkId is required."
            );
        }

        if (
            sameParticipant(
                requester,
                recipient
            )
        ) {
            throw new Error(
                "A user cannot create an authorized conversation with the same user."
            );
        }

        const linkType =
            getLinkType(
                requester.role,
                recipient.role
            );

        if (!linkType) {
            throw new Error(
                "The requested education communication role pair is not supported."
            );
        }

        /*
         * FIXED CONNECTION:
         * SecureLinkAuthorization v1.6.0
         * expects user + permission.
         */
        const access =
            authorization.authorizeAccess({
                linkId,
                user: requester,
                permission:
                    REQUIRED_PERMISSION
            });

        if (
            !access ||
            access.allowed !== true
        ) {
            throw new Error(
                "Communication authorization was not granted."
            );
        }

        const relationship =
            findVerifiedRelationship(
                relationshipLayer,
                requester,
                recipient,
                linkId
            );

        if (!relationship) {
            throw new Error(
                "A verified education relationship is required before communication."
            );
        }

        const relationshipId =
            getRelationshipId(
                relationship
            );

        if (!relationshipId) {
            throw new Error(
                "The verified education relationship has no valid relationship ID."
            );
        }

        return {
            linkType,
            relationshipId,
            access
        };
    }


    /*
     * =====================================================
     * CREATE CONVERSATION
     * =====================================================
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

        const state = load();

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

            senderId:
                sender.id,

            recipientId:
                recipient.id,

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
                null,

            messages: []
        };

        state.conversations.push(
            conversation
        );

        save(state);

        audit(
            "conversation_created",
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

        return conversation;
    }


    /*
     * =====================================================
     * SEND MESSAGE
     * =====================================================
     */

    function sendMessage({
        conversationId,
        sender,
        recipient,
        text,
        linkId
    }) {
        requireParticipant(
            sender,
            "Sender"
        );

        requireParticipant(
            recipient,
            "Recipient"
        );

        if (
            typeof conversationId !==
                "string" ||
            !conversationId
        ) {
            throw new Error(
                "conversationId is required."
            );
        }

        if (
            typeof text !== "string" ||
            text.trim() === ""
        ) {
            throw new Error(
                "Message text is required."
            );
        }

        const state = load();

        const conversation =
            state.conversations.find(
                item =>
                    item.id ===
                    conversationId
            );

        if (!conversation) {
            throw new Error(
                "Authorized conversation was not found."
            );
        }

        if (
            conversation.status !==
            "active"
        ) {
            throw new Error(
                "The conversation is not active."
            );
        }

        if (
            conversation.linkId !==
            linkId
        ) {
            throw new Error(
                "The supplied education link does not match the conversation."
            );
        }

        const security =
            requireAuthorizedCommunication({
                linkId,
                requester: sender,
                recipient
            });

        if (
            conversation.relationshipId !==
            security.relationshipId
        ) {
            throw new Error(
                "The verified education relationship does not match the conversation."
            );
        }

        if (
            !conversation.participants.includes(
                sender.id
            ) ||
            !conversation.participants.includes(
                recipient.id
            )
        ) {
            throw new Error(
                "The sender and recipient are not both authorized participants in this conversation."
            );
        }

        const message = {
            id:
                createId(
                    "message"
                ),

            conversationId,

            senderId:
                sender.id,

            senderRole:
                sender.role,

            recipientId:
                recipient.id,

            recipientRole:
                recipient.role,

            text:
                text.trim(),

            createdAt:
                new Date().toISOString()
        };

        conversation.messages.push(
            message
        );

        save(state);

        audit(
            "message_sent",
            {
                conversationId,

                messageId:
                    message.id,

                senderId:
                    sender.id,

                recipientId:
                    recipient.id
            }
        );

        return message;
    }


    /*
     * =====================================================
     * GET CONVERSATION
     * =====================================================
     */

    function getConversation(
        conversationId,
        requester,
        recipient
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
            typeof conversationId !==
                "string" ||
            !conversationId
        ) {
            throw new Error(
                "conversationId is required."
            );
        }

        const state = load();

        const conversation =
            state.conversations.find(
                item =>
                    item.id ===
                    conversationId
            );

        if (!conversation) {
            throw new Error(
                "Authorized conversation was not found."
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
                "The verified education relationship does not match the conversation."
            );
        }

        if (
            !conversation.participants.includes(
                requester.id
            ) ||
            !conversation.participants.includes(
                recipient.id
            )
        ) {
            throw new Error(
                "The requester and recipient are not authorized participants in this conversation."
            );
        }

        return conversation;
    }


    /*
     * =====================================================
     * CLOSE CONVERSATION
     * =====================================================
     */

    function closeConversation(
        conversationId,
        requester,
        recipient
    ) {
        getConversation(
            conversationId,
            requester,
            recipient
        );

        const state = load();

        const conversation =
            state.conversations.find(
                item =>
                    item.id ===
                    conversationId
            );

        if (!conversation) {
            throw new Error(
                "Authorized conversation was not found."
            );
        }

        if (
            conversation.status ===
            "closed"
        ) {
            return conversation;
        }

        conversation.status =
            "closed";

        conversation.closedAt =
            new Date().toISOString();

        save(state);

        audit(
            "conversation_closed",
            {
                conversationId,

                requesterId:
                    requester.id,

                recipientId:
                    recipient.id
            }
        );

        return conversation;
    }


    /*
     * =====================================================
     * SAFE STATUS
     * =====================================================
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

            paymentSecretsStored:
                false,

            customerFundsHeld:
                false,

            localStoragePrototypeOnly:
                true,

            requiredPermission:
                REQUIRED_PERMISSION,

            supportedRoles:
                ROLES.slice(),

            supportedLinkTypes:
                Object.keys(
                    LINK_TYPES
                )
        };
    }


    /*
     * =====================================================
     * PROTOTYPE RESET
     * =====================================================
     */

    function resetPrototypeState() {
        try {
            localStorage.removeItem(
                STORAGE_KEY
            );
        } catch (error) {
            throw new Error(
                "Unable to reset secure communication prototype storage."
            );
        }

        return getStatus();
    }


    /*
     * =====================================================
     * PUBLIC API
     * =====================================================
     */

    window.PacificEducationSecureCommunication =
        Object.freeze({
            version:
                VERSION,

            createConversation,

            sendMessage,

            getConversation,

            closeConversation,

            getStatus,

            resetPrototypeState
        });


    /*
     * =====================================================
     * OPTIONAL READINESS EVENT
     * =====================================================
     */

    try {
        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationSecureCommunicationReady",
                {
                    detail: {
                        version:
                            VERSION
                    }
                }
            )
        );
    } catch (error) {
        /*
         * Readiness notification is optional.
         * It must never break the module.
         */
    }

})();
