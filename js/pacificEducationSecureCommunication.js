/*
 * PACIFIC EDUCATION
 * SECURE EDUCATION COMMUNICATION LAYER
 * VERSION 1.1.0
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Security flow:
 * Verified Relationship
 * → Active Approved Link
 * → Communication Permission
 * → Conversation
 * → Message
 *
 * Link availability NEVER means information access.
 *
 * Prototype only.
 * No passwords, API keys, access tokens or payment secrets.
 */

(() => {
  "use strict";

  const VERSION = "1.1.0";
  const STORAGE_KEY = "pacificEducationSecureMessages";

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
    return window.PacificEducationSecureLinkAuthorization;
  }

  function getRelationshipLayer() {
    return window.PacificEducationVerifiedEducationRelationship;
  }

  function requireSecurityModules() {
    const authorization = getAuthorization();
    const relationship = getRelationshipLayer();

    if (!authorization) {
      throw new Error(
        "Secure Link Authorization module is not loaded."
      );
    }

    if (!relationship) {
      throw new Error(
        "Verified Education Relationship module is not loaded."
      );
    }

    return {
      authorization,
      relationship
    };
  }

  function load() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || {
        conversations: [],
        messages: [],
        audit: []
      };
    } catch {
      return {
        conversations: [],
        messages: [],
        audit: []
      };
    }
  }

  function save(state) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  }

  function audit(state, action, details = {}) {
    state.audit.push({
      id: crypto.randomUUID(),
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
      typeof user.id === "string" &&
      user.id.trim() &&
      validRole(user.role) &&
      user.authorized === true
    );
  }

  function getLinkType(senderRole, recipientRole) {
    return Object.entries(LINK_TYPES).find(
      ([, roles]) =>
        roles.includes(senderRole) &&
        roles.includes(recipientRole)
    )?.[0] || null;
  }

  function requireAuthorizedCommunication({
    linkId,
    requester,
    recipient
  }) {
    if (!linkId) {
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
      authorization,
      relationship
    } = requireSecurityModules();

    const access =
      authorization.authorizeAccess({
        linkId,
        requester,
        requiredPermission: "communication"
      });

    if (!access || access.allowed !== true) {
      throw new Error(
        "Communication authorization denied."
      );
    }

    const relationships =
      relationship.getUserRelationships(
        requester.id
      ) || [];

    const verifiedRelationship =
      relationships.find(
        item =>
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
      );

    if (!verifiedRelationship) {
      throw new Error(
        "Verified education relationship is required."
      );
    }

    return {
      access,
      linkType,
      relationshipId:
        verifiedRelationship.relationshipId ||
        verifiedRelationship.id ||
        null
    };
  }

  function createConversation(
    sender,
    recipient,
    options = {}
  ) {
    const {
      linkId
    } = options;

    const security =
      requireAuthorizedCommunication({
        linkId,
        requester: sender,
        recipient
      });

    const state = load();

    const conversation = {
      id: crypto.randomUUID(),
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
        new Date().toISOString()
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

  function sendMessage({
    conversationId,
    sender,
    recipient,
    text,
    linkId
  }) {
    if (
      !conversationId ||
      !validParticipant(sender) ||
      !validParticipant(recipient)
    ) {
      throw new Error(
        "Invalid communication authorization."
      );
    }

    const security =
      requireAuthorizedCommunication({
        linkId,
        requester: sender,
        recipient
      });

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      throw new Error(
        "Message cannot be empty."
      );
    }

    const state = load();

    const conversation =
      state.conversations.find(
        item =>
          item.id === conversationId &&
          item.status === "active" &&
          item.linkId === linkId &&
          item.relationshipId ===
            security.relationshipId &&
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
      id: crypto.randomUUID(),
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

  function getConversation(
    conversationId,
    requester
  ) {
    if (
      !validParticipant(requester)
    ) {
      throw new Error(
        "Requester is not authorized."
      );
    }

    const state = load();

    const conversation =
      state.conversations.find(
        item =>
          item.id === conversationId &&
          item.status === "active" &&
          item.participants.includes(
            requester.id
          )
      );

    if (!conversation) {
      throw new Error(
        "Conversation access denied."
      );
    }

    /*
     * Re-check the approved link before
     * returning conversation content.
     */
    const {
      authorization
    } = requireSecurityModules();

    const access =
      authorization.authorizeAccess({
        linkId:
          conversation.linkId,
        requester,
        requiredPermission:
          "communication"
      });

    if (
      !access ||
      access.allowed !== true
    ) {
      throw new Error(
        "Conversation authorization has been revoked."
      );
    }

    return {
      conversation,
      messages:
        state.messages.filter(
          message =>
            message.conversationId ===
            conversationId
        )
    };
  }

  function closeConversation(
    conversationId,
    requester
  ) {
    if (
      !validParticipant(requester)
    ) {
      throw new Error(
        "Requester is not authorized."
      );
    }

    const state = load();

    const conversation =
      state.conversations.find(
        item =>
          item.id === conversationId &&
          item.status === "active" &&
          item.participants.includes(
            requester.id
          )
      );

    if (!conversation) {
      throw new Error(
        "Active conversation not found."
      );
    }

    /*
     * Re-check authorization and the verified
     * relationship before allowing closure.
     * A revoked relationship or permission must
     * prevent further conversation actions.
     */
    const {
      authorization,
      relationship
    } = requireSecurityModules();

    const access =
      authorization.authorizeAccess({
        linkId:
          conversation.linkId,
        requester,
        requiredPermission:
          "communication"
      });

    if (
      !access ||
      access.allowed !== true
    ) {
      throw new Error(
        "Conversation closure authorization denied."
      );
    }

    const relationships =
      relationship.getUserRelationships(
        requester.id
      ) || [];

    const verifiedRelationship =
      relationships.find(
        item =>
          item.status === "verified" &&
          item.relationshipType ===
            conversation.linkType &&
          item.relationshipId ===
            conversation.relationshipId &&
          (
            item.requesterId === requester.id ||
            item.targetId === requester.id
          )
      );

    if (!verifiedRelationship) {
      throw new Error(
        "Verified education relationship is required to close conversation."
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
        linkType:
          conversation.linkType
      }
    );

    save(state);

    return conversation;
  }

  function getStatus() {
    const state = load();

    return Object.freeze({
      version: VERSION,
      conversations:
        state.conversations.length,
      messages:
        state.messages.length,
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

  function resetPrototypeState() {
    localStorage.removeItem(
      STORAGE_KEY
    );
  }

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
