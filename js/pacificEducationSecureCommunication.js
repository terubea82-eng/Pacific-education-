/*
 * PACIFIC EDUCATION
 * SECURE EDUCATION COMMUNICATION LAYER
 * Student • Teacher • Parent • Ministry of Education
 *
 * Prototype only.
 * No passwords, API keys, access tokens or payment secrets.
 */

(() => {
  "use strict";

  const VERSION = "1.0.0";
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

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  function canCommunicate(sender, recipient) {
    if (!validParticipant(sender) || !validParticipant(recipient)) {
      return false;
    }

    return Object.values(LINK_TYPES).some(
      roles =>
        roles.includes(sender.role) &&
        roles.includes(recipient.role)
    );
  }

  function createConversation(sender, recipient) {
    if (!canCommunicate(sender, recipient)) {
      throw new Error("Communication not authorized.");
    }

    const state = load();

    const conversation = {
      id: crypto.randomUUID(),
      participants: [sender.id, recipient.id],
      participantRoles: [sender.role, recipient.role],
      status: "active",
      createdAt: new Date().toISOString()
    };

    state.conversations.push(conversation);

    audit(state, "CONVERSATION_CREATED", {
      conversationId: conversation.id
    });

    save(state);

    return conversation;
  }

  function sendMessage({
    conversationId,
    sender,
    recipient,
    text
  }) {
    if (!conversationId || !validParticipant(sender) ||
        !validParticipant(recipient)) {
      throw new Error("Invalid communication authorization.");
    }

    if (!canCommunicate(sender, recipient)) {
      throw new Error("Communication not authorized.");
    }

    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Message cannot be empty.");
    }

    const state = load();

    const conversation = state.conversations.find(
      item =>
        item.id === conversationId &&
        item.status === "active" &&
        item.participants.includes(sender.id) &&
        item.participants.includes(recipient.id)
    );

    if (!conversation) {
      throw new Error("Active authorized conversation not found.");
    }

    const message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: sender.id,
      recipientId: recipient.id,
      senderRole: sender.role,
      recipientRole: recipient.role,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    state.messages.push(message);

    audit(state, "MESSAGE_SENT", {
      conversationId,
      messageId: message.id
    });

    save(state);

    window.dispatchEvent(
      new CustomEvent("pacificEducationMessageSent", {
        detail: {
          conversationId,
          messageId: message.id
        }
      })
    );

    return message;
  }

  function getConversation(conversationId, requester) {
    if (!validParticipant(requester)) {
      throw new Error("Requester is not authorized.");
    }

    const state = load();

    const conversation = state.conversations.find(
      item =>
        item.id === conversationId &&
        item.status === "active" &&
        item.participants.includes(requester.id)
    );

    if (!conversation) {
      throw new Error("Conversation access denied.");
    }

    return {
      conversation,
      messages: state.messages.filter(
        message => message.conversationId === conversationId
      )
    };
  }

  function closeConversation(conversationId, requester) {
    if (!validParticipant(requester)) {
      throw new Error("Requester is not authorized.");
    }

    const state = load();

    const conversation = state.conversations.find(
      item =>
        item.id === conversationId &&
        item.participants.includes(requester.id)
    );

    if (!conversation) {
      throw new Error("Conversation not found.");
    }

    conversation.status = "closed";
    conversation.closedAt = new Date().toISOString();

    audit(state, "CONVERSATION_CLOSED", {
      conversationId
    });

    save(state);

    return conversation;
  }

  function getStatus() {
    const state = load();

    return Object.freeze({
      version: VERSION,
      conversations: state.conversations.length,
      messages: state.messages.length,
      prototypeOnly: true,
      backendRequiredForProduction: true
    });
  }

  function resetPrototypeState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.PacificEducationSecureCommunication = Object.freeze({
    version: VERSION,
    createConversation,
    sendMessage,
    getConversation,
    closeConversation,
    getStatus,
    resetPrototypeState
  });

})();
