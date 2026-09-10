/*
 * PACIFIC EDUCATION
 * EDUCATION LINK BRIDGE
 * VERSION 1.3.0
 *
 * Secure connection bridge for:
 * Student ↔ Teacher
 * Parent ↔ Student
 * Parent ↔ Teacher
 * Teacher/School ↔ Ministry
 * Parent ↔ Ministry
 * Student ↔ Ministry
 *
 * Security flow:
 * Identity → Role → Verified Relationship
 * → Authorization → Permission → Communication
 *
 * Link availability NEVER means information access.
 *
 * Prototype only.
 *
 * No passwords, API keys, access tokens,
 * payment secrets, or private credentials.
 */

(() => {
  "use strict";

  const VERSION = "1.3.0";

  function getAuthorization() {
    return (
      window.PacificEducationSecureLinkAuthorization ||
      null
    );
  }

  function getCommunication() {
    return (
      window.PacificEducationSecureCommunication ||
      null
    );
  }

  function getRelationshipLayer() {
    return (
      window.PacificEducationVerifiedEducationRelationship ||
      null
    );
  }

  function validUser(user) {
    return Boolean(
      user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      user.id.trim() &&
      typeof user.role === "string" &&
      user.role.trim() &&
      user.authorized === true
    );
  }

  function requireModules() {
    const authorization = getAuthorization();
    const communication = getCommunication();
    const relationship = getRelationshipLayer();

    if (
      !authorization ||
      typeof authorization.requestLink !== "function" ||
      typeof authorization.approveLink !== "function" ||
      typeof authorization.authorizeAccess !== "function" ||
      typeof authorization.revokeLink !== "function" ||
      typeof authorization.getUserLinks !== "function"
    ) {
      throw new Error(
        "Secure Link Authorization module is unavailable or incomplete."
      );
    }

    if (
      !communication ||
      typeof communication.createConversation !== "function" ||
      typeof communication.sendMessage !== "function"
    ) {
      throw new Error(
        "Secure Communication module is unavailable or incomplete."
      );
    }

    if (
      !relationship ||
      typeof relationship.getUserRelationships !== "function"
    ) {
      throw new Error(
        "Verified Education Relationship module is unavailable or incomplete."
      );
    }

    return {
      authorization,
      communication,
      relationship
    };
  }

  function requestConnection(request) {
    const { authorization } = requireModules();

    if (
      !request ||
      typeof request !== "object"
    ) {
      throw new Error(
        "Valid connection request is required."
      );
    }

    return authorization.requestLink(request);
  }

  function approveConnection(request) {
    const { authorization } = requireModules();

    if (
      !request ||
      typeof request !== "object"
    ) {
      throw new Error(
        "Valid connection approval request is required."
      );
    }

    return authorization.approveLink(request);
  }

  function checkAccess(request) {
    const { authorization } = requireModules();

    if (
      !request ||
      typeof request !== "object"
    ) {
      return {
        allowed: false,
        reason:
          "Valid access request is required."
      };
    }

    return authorization.authorizeAccess(
      request
    );
  }

  function revokeConnection(request) {
    const { authorization } = requireModules();

    if (
      !request ||
      typeof request !== "object"
    ) {
      throw new Error(
        "Valid connection revocation request is required."
      );
    }

    return authorization.revokeLink(request);
  }

  function openConversation({
    linkId,
    requester,
    requiredPermission = "communication",
    recipient
  }) {
    const {
      authorization,
      communication
    } = requireModules();

    if (!validUser(requester)) {
      throw new Error(
        "Authorized requester is required."
      );
    }

    if (!validUser(recipient)) {
      throw new Error(
        "Authorized recipient is required."
      );
    }

    if (
      typeof linkId !== "string" ||
      !linkId.trim()
    ) {
      throw new Error(
        "Valid active link ID is required."
      );
    }

    const access =
      authorization.authorizeAccess({
        linkId,
        requester,
        requiredPermission
      });

    if (
      !access ||
      access.allowed !== true
    ) {
      throw new Error(
        "Communication access denied."
      );
    }

    return communication.createConversation(
      requester,
      recipient,
      {
        linkId
      }
    );
  }

  function sendAuthorizedMessage({
    linkId,
    conversationId,
    sender,
    recipient,
    text
  }) {
    const {
      authorization,
      communication
    } = requireModules();

    if (!validUser(sender)) {
      throw new Error(
        "Authorized sender is required."
      );
    }

    if (!validUser(recipient)) {
      throw new Error(
        "Authorized recipient is required."
      );
    }

    if (
      typeof linkId !== "string" ||
      !linkId.trim()
    ) {
      throw new Error(
        "Valid active link ID is required."
      );
    }

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      throw new Error(
        "Valid conversation ID is required."
      );
    }

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      throw new Error(
        "Valid message text is required."
      );
    }

    const access =
      authorization.authorizeAccess({
        linkId,
        requester: sender,
        requiredPermission: "communication"
      });

    if (
      !access ||
      access.allowed !== true
    ) {
      throw new Error(
        "Message access denied."
      );
    }

    return communication.sendMessage({
      conversationId,
      sender,
      recipient,
      text,
      linkId
    });
  }

  /*
   * IMPORTANT API CONTRACT:
   *
   * Secure Link Authorization.getUserLinks()
   * requires the complete validated user object.
   *
   * The previous bridge passed only userId.
   */
  function getUserLinks(user) {
    if (!validUser(user)) {
      throw new Error(
        "Valid authorized user object is required."
      );
    }

    const {
      authorization
    } = requireModules();

    return (
      authorization.getUserLinks(user) || []
    );
  }

  function getStatus() {
    const authorization = getAuthorization();
    const communication = getCommunication();
    const relationship = getRelationshipLayer();

    const authorizationReady =
      Boolean(
        authorization &&
        typeof authorization.requestLink ===
          "function" &&
        typeof authorization.approveLink ===
          "function" &&
        typeof authorization.authorizeAccess ===
          "function" &&
        typeof authorization.revokeLink ===
          "function" &&
        typeof authorization.getUserLinks ===
          "function"
      );

    const communicationReady =
      Boolean(
        communication &&
        typeof communication.createConversation ===
          "function" &&
        typeof communication.sendMessage ===
          "function"
      );

    const relationshipReady =
      Boolean(
        relationship &&
        typeof relationship.getUserRelationships ===
          "function"
      );

    const ready =
      authorizationReady &&
      communicationReady &&
      relationshipReady;

    return Object.freeze({
      version: VERSION,

      authorizationLoaded:
        authorizationReady,

      communicationLoaded:
        communicationReady,

      verifiedRelationshipLoaded:
        relationshipReady,

      ready,

      securityFlow:
        "identity_role_verified_relationship_authorization_permission_communication",

      verifiedRelationshipRequired:
        true,

      relationshipRecheckedByAuthorization:
        true,

      activeApprovedLinkPassedToCommunication:
        true,

      automaticInformationAccess:
        false,

      prototypeOnly:
        true,

      productionBackendRequired:
        true
    });
  }

  window.PacificEducationEducationLinkBridge =
    Object.freeze({
      version: VERSION,

      requestConnection,
      approveConnection,
      checkAccess,
      revokeConnection,

      openConversation,
      sendAuthorizedMessage,

      getUserLinks,
      getStatus
    });

})();
