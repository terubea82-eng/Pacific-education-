/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE EDUCATION COMMUNICATION LAYER
 * =========================================================
 * Version 1.2.0
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
 * IMPORTANT:
 * - localStorage is prototype storage only.
 * - Client-side state MUST NOT be trusted in production.
 * - No automatic information access.
 * - No passwords, API keys, access tokens or payment secrets.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.2.0";

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
    senderRole,
    recipientRole
  ) {
    return (
      Object.entries(
        LINK_TYPES
      ).find(
        ([, roles]) =>
          roles.includes(senderRole) &&
          roles.includes(recipientRole) &&
          senderRole !== recipientRole
      )?.[0] || null
    );
  }

  /*
   * =======================================================
   * VERIFIED RELATIONSHIP CHECK
   * =======================================================
   */

  function findVerifiedRelationship(
    requester,
    recipient,
    linkType
  ) {
    const {
      relationship
    } = requireSecurityModules();

    const requesterRelationships =
      relationship.getUserRelationships(
        requester.id
      );

    if (
      !Array.isArray(
        requesterRelationships
      )
    ) {
      return null;
    }

    return (
      requesterRelationships.find(
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

    if (
      !validParticipant(requester) ||
      !validParticipant(recipient)
    ) {
      throw new Error(
        "Communication participants are not authorized."
      );
    }

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
          "communication"
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
      id: createId(
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

      status: "active",

      createdAt:
        new Date().toISOString(),

      closedAt: null
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

    if (
      !validParticipant(sender) ||
      !validParticipant(recipient)
    ) {
      throw new Error(
        "Communication participants are not authorized."
      );
    }

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
      id: createId("message"),

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

    return message;
  }

  /*
   * =======================================================
   * GET CONVERSATION
   * =======================================================
   */

  function getConversation(
    conversationId,
    requester
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

    if (
      !validParticipant(requester)
    ) {
      throw new Error(
        "Requester is not authorized."
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
          item.participants.includes(
            requester.id
          )
      );

    if (!conversation) {
      throw new Error(
        "Conversation access denied."
      );
    }

    const recipientId =
      conversation.participants.find(
        id =>
          id !== requester.id
      );

    if (
      typeof recipientId !==
      "string"
    ) {
      throw new Error(
        "Conversation recipient could not be verified."
      );
    }

    const recipientRoleIndex =
      conversation.participants.indexOf(
        recipientId
      );

    const requesterRoleIndex =
      conversation.participants.indexOf(
        requester.id
      );

    const recipientRole =
      conversation.participantRoles[
        recipientRoleIndex
      ];

    if (
      typeof recipientRole !==
      "string"
    ) {
      throw new Error(
        "Conversation participant role could not be verified."
      );
    }

    const recipient = {
      id: recipientId,
      role: recipientRole,
      authorized: true
    };

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
              conversationId
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
    requester
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

    if (
      !validParticipant(requester)
    ) {
      throw new Error(
        "Requester is not authorized."
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
          item.participants.includes(
            requester.id
          )
      );

    if (!conversation) {
      throw new Error(
        "Active conversation not found."
      );
    }

    const recipientId =
      conversation.participants.find(
        id =>
          id !== requester.id
      );

    if (
      typeof recipientId !==
      "string"
    ) {
      throw new Error(
        "Conversation recipient could not be verified."
      );
    }

    const recipientRoleIndex =
      conversation.participants.indexOf(
        recipientId
      );

    const recipientRole =
      conversation.participantRoles[
        recipientRoleIndex
      ];

    if (
      typeof recipientRole !==
      "string"
    ) {
      throw new Error(
        "Conversation participant role could not be verified."
      );
    }

    const recipient = {
      id: recipientId,
      role: recipientRole,
      authorized: true
    };

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
          conversation.relationshipId,

        linkType:
          conversation.linkType
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
    const state =
      load();

    const authorization =
      getAuthorization();

    const relationship =
      getRelationshipLayer();

    const authorizationReady =
      Boolean(
        authorization &&
        typeof authorization.authorizeAccess ===
          "function"
      );

    const relationshipReady =
      Boolean(
        relationship &&
        typeof relationship.getUserRelationships ===
          "function"
      );

    return Object.freeze({
      version: VERSION,

      conversations:
        state.conversations.length,

      messages:
        state.messages.length,

      authorizationLoaded:
        Boolean(
          authorization
        ),

      authorizationReady,

      relationshipLoaded:
        Boolean(
          relationship
        ),

      relationshipReady,

      verifiedRelationshipRequired:
        true,

      activeApprovedLinkRequired:
        true,

      communicationPermissionRequired:
        true,

      automaticInformationAccess:
        false,

      prototypeOnly:
        true,

      backendRequiredForProduction:
        true
    });
  }

  /*
   * =======================================================
   * PROTOTYPE RESET
   * =======================================================
   */

  function resetPrototypeState() {
    localStorage.removeItem(
      STORAGE_KEY
    );
  }

  /*
   * =======================================================
   * PUBLIC API
   * =======================================================
   */

  window.PacificEducationSecureCommunication =
    Object.freeze({
      version: VERSION,

      createConversation,

      sendMessage,

      getConversation,

      closeConversation,

      getStatus,

      resetPrototypeState
    });

})();
