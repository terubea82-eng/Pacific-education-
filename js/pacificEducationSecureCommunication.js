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
 * Exact Approved Link
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
 * - The exact approved link must belong to the exact
 *   requester and recipient pair.
 * - The link relationship ID must match the verified
 *   relationship ID.
 * - The verified relationship is revalidated through
 *   checkRelationship().
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
 * - SecureLinkAuthorization.getLinksForUser()
 *   is used to verify exact link ownership.
 * - Verified relationship checkRelationship() is used
 *   for defense-in-depth revalidation.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.5.0";

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
            typeof authorization.getLinksForUser !==
                "function" &&
            typeof authorization.getUserLinks !==
                "function"
        ) {
            throw new Error(
                "Pacific Education secure link list API is unavailable."
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
                    firstRole
                ) &&
                supportedRoles.includes(
                    secondRole
                )
            ) {
                return linkType;
            }
        }

        return null;
    }


    /*
     * =====================================================
     * AUTHORIZATION LINK HELPERS
     * =====================================================
     */

    function getLinksForUser(
        authorization,
        user
    ) {
        let result;

        if (
            typeof authorization.getLinksForUser ===
            "function"
        ) {
            result =
                authorization.getLinksForUser(
                    user
                );
        } else {
            result =
                authorization.getUserLinks(
                    user
                );
        }

        return Array.isArray(result)
            ? result
            : [];
    }

    function sameLinkParticipant(
        link,
        user,
        idField,
        roleField
    ) {
        return Boolean(
            link &&
                link[idField] === user.id &&
                link[roleField] === user.role
        );
    }

    function exactLinkMatchesParticipants(
        link,
        requester,
        recipient,
        linkType
    ) {
        if (
            !link ||
            typeof link !== "object"
        ) {
            return false;
        }

        if (
            link.status !== "authorized"
        ) {
            return false;
        }

        if (
            link.linkType !== linkType
        ) {
            return false;
        }

        const direct =
            sameLinkParticipant(
                link,
                requester,
                "requesterId",
                "requesterRole"
            ) &&
            sameLinkParticipant(
                link,
                recipient,
                "targetId",
                "targetRole"
            );

        const reverse =
            sameLinkParticipant(
                link,
                recipient,
                "requesterId",
                "requesterRole"
            ) &&
            sameLinkParticipant(
                link,
                requester,
                "targetId",
                "targetRole"
            );

        return direct || reverse;
    }

    function findExactAuthorizedLink(
        authorization,
        requester,
        recipient,
        linkId,
        linkType
    ) {
        const links =
            getLinksForUser(
                authorization,
                requester
            );

        const link =
            links.find(item =>
                item &&
                item.id === linkId &&
                exactLinkMatchesParticipants(
                    item,
                    requester,
                    recipient,
                    linkType
                )
            );

        return link || null;
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
        const expectedType =
            getLinkType(
                requester.role,
                recipient.role
            );

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

                    if (
                        item.relationshipType !==
                        expectedType
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
                        item.linkId &&
                        item.linkId !==
                            linkId
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
     */

    function requireAuthorizedCommunication({
        linkId,
        requester,
        recipient
    }) {
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
            typeof linkId !== "string" ||
            !linkId.trim()
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
                "A user cannot communicate with the same user."
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
         * =================================================
         * STEP 1
         * EXACT AUTHORIZED LINK
         * =================================================
         */

        const approvedLink =
            findExactAuthorizedLink(
                authorization,
                requester,
                recipient,
                linkId,
                linkType
            );

        if (!approvedLink) {
            throw new Error(
                "The approved education link does not belong to the exact requester and recipient pair."
            );
        }


        /*
         * =================================================
         * STEP 2
         * LINK RELATIONSHIP ID
         * =================================================
         */

        const approvedRelationshipId =
            approvedLink.relationshipId;

        if (
            typeof approvedRelationshipId !==
                "string" ||
            !approvedRelationshipId.trim()
        ) {
            throw new Error(
                "The approved education link has no valid relationship ID."
            );
        }


        /*
         * =================================================
         * STEP 3
         * AUTHORIZATION PERMISSION
         * =================================================
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


        /*
         * =================================================
         * STEP 4
         * VERIFIED RELATIONSHIP
         * =================================================
         */

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

        if (
            relationshipId !==
            approvedRelationshipId
        ) {
            throw new Error(
                "The approved link and verified education relationship do not match."
            );
        }


        /*
         * =================================================
         * STEP 5
         * DEFENSE-IN-DEPTH REVALIDATION
         * =================================================
         */

        const relationshipCheck =
            relationshipLayer.checkRelationship({
                relationshipId,

                requester: {
                    id:
                        requester.id,
                    role:
                        requester.role,
                    authorized:
                        true
                },

                target: {
                    id:
                        recipient.id,
                    role:
                        recipient.role,
                    authorized:
                        true
                },

                relationshipType:
                    linkType
            });

        if (
            !relationshipCheck ||
            relationshipCheck.allowed !== true
        ) {
            throw new Error(
                "Verified education relationship revalidation failed."
            );
        }

        if (
            relationshipCheck.relationshipId !==
            relationshipId
        ) {
            throw new Error(
                "Relationship revalidation returned a different relationship ID."
            );
        }

        return {
            linkType,
            linkId,
            relationshipId,
            approvedLink,
            access,
            relationshipCheck
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
                requester:
                    sender,
                recipient
            });

        const state = load();

        const conversation = {
            id:
                createId(
                    "conversation"
                ),

            linkId:
                security.linkId,

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

                linkId:
                    security.linkId,

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

        if (
            typeof linkId !== "string" ||
            !linkId
        ) {
            throw new Error(
                "linkId is required."
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
                requester:
                    sender,
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
            conversation.linkType !==
            security.linkType
        ) {
            throw new Error(
                "The communication link type does not match the conversation."
            );
        }

        if (
            !conversation.participants
