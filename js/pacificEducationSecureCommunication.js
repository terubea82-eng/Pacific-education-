/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE EDUCATION COMMUNICATION LAYER
 * =========================================================
 * Version 1.3.0
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
 * - No raw-ID relationship authorization.
 * - No synthetic authorized users.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.3.0";

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
    const authorization = getAuthorization();
    const relationship = getRelationshipLayer();

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
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return emptyState();
      }

      const parsed = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.conversations) ||
        !Array.isArray(parsed.messages) ||
        !Array.isArray(parsed.audit)
      ) {
        return emptyState();
      }

      return {
        conversations: parsed.conversations,
        messages: parsed.messages,
        audit: parsed.audit
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
      typeof crypto.randomUUID === "function"
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

  function audit(state, action, details = {}) {
    state.audit.push({
      id: createId("audit"),
      action,
      timestamp: new Date().toISOString(),
      details
    });
  }

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

  function sameParticipant(first, second) {
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
      Object.entries(LINK_TYPES).find(
        ([, roles]) =>
          roles.includes(senderRole) &&
          roles.includes(recipientRole) &&
          senderRole !== recipientRole
      )?.[0] || null
    );
  }

  function getRelationshipId(relationship) {
    if (
      !relationship ||
      typeof relationship !== "object"
    ) {
      return null;
    }

    if (
      typeof relationship.id === "string" &&
      relationship.id.trim()
    ) {
      return relationship.id;
    }

    if (
      typeof relationship.relationshipId === "string" &&
      relationship.relationshipId.trim()
    ) {
      return relationship.relationshipId;
    }

    return null;
  }

  /*
   * IMPORTANT:
   * The current relationship API requires the COMPLETE
   * authorized user object.
   *
   * Never pass requester.id by itself.
   */

  function getRelationshipsForUser(user) {
    if (!validParticipant(user)) {
      throw new Error(
        "Complete authorized user is required for relationship lookup."
      );
    }

    const {
      relationship
    } = requireSecurityModules();

    const relationships =
      relationship.getUserRelationships(user);

    if (!Array.isArray(relationships)) {
      return [];
    }

    return relationships;
  }

  function findVerifiedRelationship(
    requester,
    recipient,
    linkType
  ) {
    if (
      !validParticipant(requester) ||
      !validParticipant(recipient)
    ) {
      throw new Error(
        "Complete authorized participants are required."
      );
    }

    const relationships =
      getRelationshipsForUser(requester);

    return (
      relationships.find(
        item =>
          item &&
          item.status === "verified" &&
          item.relationshipType === linkType &&
          (
            (
              item.requesterId === requester.id &&
              item.targetId === recipient.id
            ) ||
            (
              item.requesterId === recipient.id &&
              item.targetId === requester.id
            )
          )
      ) || null
    );
  }

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
      sameParticipant(requester, recipient)
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
        requiredPermission: "communication"
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

  function createConversation(
    sender,
    recipient,
    options = {}
  ) {
    const security =
      requireAuthorizedCommunication({
        linkId: options.linkId,
        requester: sender,
        recipient
      });

    const state = load();

    const conversation = {
      id: createId("conversation"),

      linkId: options.linkId,

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

        linkId:
          options.linkId,

        relationshipId:
          security.relationshipId,

        linkType:
          security.linkType
      }
    );

    save(state);

    return conversation;
  }

  function sendMessage({
    conversationId,
    sender,
    recipient,
    text,
    linkId
  }) {
    if (
      typeof conversationId !== "string" ||
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

    const state = load();

    const conversation =
      state.conversations.find(
        item =>
          item &&
          item.id === conversationId &&
          item.status === "active" &&
          item.linkId === linkId &&
          item.relationshipId ===
            security.relationshipId &&
          Array.isArray(item.participants) &&
          item.participants.includes(sender.id) &&
          item.participants.includes(recipient.id)
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

    state.messages.push(message);

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
   * SECURITY RULE:
   * The caller must provide the actual authorized
   * participant object for the requester.
   *
   * This function NEVER manufactures an authorized
   * recipient object.
   */

  function getConversation(
    conversationId,
    requester,
    recipient
  ) {
    if (
      typeof conversationId !== "string" ||
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

    if (
      !validParticipant(recipient)
    ) {
      throw new Error(
        "Actual authorized recipient is required."
      );
    }

    if (
      sameParticipant(requester, recipient)
    ) {
      throw new Error(
        "Conversation requires two different participants."
      );
    }

    const state = load();

    const conversation =
      state.conversations.find(
        item =>
          item &&
          item.id === conversationId &&
          item.status === "active" &&
          Array.isArray(item.participants) &&
          item.participants.includes(requester.id) &&
          item.participants.includes(recipient.id)
      );

    if (!conversation) {
      throw new Error(
        "Conversation access denied."
      );
    }

    if (
      conversation.participants.length !== 2
    ) {
      throw new Error(
        "Conversation participant structure is invalid."
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
        "Conversation participant mismatch."
      );
    }

    if (
      !Array.isArray(
        conversation.participantRoles
      ) ||
      conversation.participantRoles.length !== 2
    ) {
      throw new Error(
        "Conversation participant roles are invalid."
      );
    }

    const requesterRoleIndex =
      conversation.participants.indexOf(
        requester.id
      );

    const recipientRoleIndex =
      conversation.participants.indexOf(
        recipient.id
      );

    if (
      requesterRoleIndex < 0 ||
      recipientRoleIndex < 0
    ) {
      throw new Error(
        "Conversation participant indexes are invalid."
      );
    }

    if (
      conversation.participantRoles[
        requesterRoleIndex
      ] !== requester.role
    ) {
      throw new Error(
        "Requester role does not match the conversation."
      );
    }

    if (
      conversation.participantRoles[
        recipientRoleIndex
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
              conversationId
        )
    };
  }

  function closeConversation(
    conversationId,
    requester,
    recipient
  ) {
    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      throw new Error(
        "Valid conversation ID required."
      );
    }

    if (
      !validParticipant(requester) ||
      !validParticipant(recipient)
    ) {
      throw new Error(
        "Complete authorized participants are required."
      );
    }

    const state = load();

    const conversation =
      state.conversations.find(
        item =>
          item &&
          item.id === conversationId &&
          item.status === "active"
      );

    if (!conversation) {
      throw new Error(
        "Active conversation not found."
      );
    }

    if (
      !Array.isArray(
        conversation.participants
      ) ||
      !conversation.participants.includes(
        requester.id
      ) ||
      !conversation.participants.includes(
        recipient.id
      )
    ) {
      throw new Error(
        "Conversation access denied."
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

    conversation.status = "closed";

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
        requesterId:
          requester.id
      }
    );

    save(state);

    return conversation;
  }

  function getStatus() {
    const authorization =
      getAuthorization();

    const relationship =
      getRelationshipLayer();

    return {
      module:
        "PacificEducationSecureCommunication",

      version: VERSION,

      prototypeOnly: true,

      productionServerAuthorizationRequired:
        true,

      automaticInformationAccess:
        false,

      secretsStored:
        false,

      localStorageTrusted:
        false,

      rawIdRelationshipLookup:
        false,

      syntheticAuthorizedUsers:
        false,

      completeAuthorizedUserRequired:
        true,

      authorizationLoaded:
        Boolean(authorization),

      authorizationApiReady:
        Boolean(
          authorization &&
          typeof authorization.authorizeAccess ===
            "function"
        ),

      relationshipLoaded:
        Boolean(relationship),

      relationshipApiReady:
        Boolean(
          relationship &&
          typeof relationship.getUserRelationships ===
            "function"
        ),

      publicApi: [
        "createConversation",
        "sendMessage",
        "getConversation",
        "closeConversation",
        "getStatus",
        "resetPrototypeState"
      ],

      storageKey:
        STORAGE_KEY,

      counts: (() => {
        const state = load();

        return {
          conversations:
            state.conversations.length,

          messages:
            state.messages.length,

          auditEntries:
            state.audit.length
        };
      })()
    };
  }

  function resetPrototypeState() {
    localStorage.removeItem(
      STORAGE_KEY
    );

    return getStatus();
  }

  window.PacificEducationSecureCommunication = {
    createConversation,
    sendMessage,
    getConversation,
    closeConversation,
    getStatus,
    resetPrototypeState
  };
})();
