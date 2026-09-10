/*
 * PACIFIC EDUCATION
 * EDUCATION LINK BRIDGE
 * Version 1.2.0
 *
 * Connects:
 * Core-facing education link services
 * Secure Link Authorization
 * Secure Communication
 *
 * Student • Teacher • Parent • Ministry
 *
 * Security sequence:
 * Verified Relationship
 * → Active Approved Link
 * → Permission
 * → Communication
 *
 * Prototype only.
 * Production authorization MUST remain server-side.
 *
 * No passwords, API keys, access tokens,
 * payment secrets, or private credentials.
 */

(() => {
  "use strict";

  const VERSION = "1.2.0";

  function getAuthorization() {
    return window.PacificEducationSecureLinkAuthorization || null;
  }

  function getCommunication() {
    return window.PacificEducationSecureCommunication || null;
  }

  function requireModules() {
    const authorization = getAuthorization();
    const communication = getCommunication();

    if (!authorization) {
      throw new Error(
        "Secure Link Authorization module is not loaded."
      );
    }

    if (!communication) {
      throw new Error(
        "Secure Communication module is not loaded."
      );
    }

    return {
      authorization,
      communication
    };
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

  function requestConnection(request) {
    const { authorization } = requireModules();

    if (
      !request ||
      typeof request !== "object"
    ) {
      throw new Error(
        "Valid education link request is required."
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
        "Valid education link approval request is required."
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
      throw new Error(
        "Valid access request is required."
      );
    }

    return authorization.authorizeAccess(request);
  }

  function revokeConnection(request) {
    const { authorization } = requireModules();

    if (
      !request ||
      typeof request !== "object"
    ) {
      throw new Error(
        "Valid education link revocation request is required."
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

    if (!linkId) {
      throw new Error(
        "Active approved education link is required."
      );
    }

    if (
      !validUser(requester) ||
      !validUser(recipient)
    ) {
      throw new Error(
        "Authorized requester and recipient are required."
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

    if (!linkId) {
      throw new Error(
        "Active approved education link is required."
      );
    }

    if (!conversationId) {
      throw new Error(
        "Active authorized conversation is required."
      );
    }

    if (
      !validUser(sender) ||
      !validUser(recipient)
    ) {
      throw new Error(
        "Authorized sender and recipient are required."
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

  function getConversation(
    conversationId,
    requester
  ) {
    const { communication } =
      requireModules();

    if (!validUser(requester)) {
      throw new Error(
        "Authorized requester is required."
      );
    }

    return communication.getConversation(
      conversationId,
      requester
    );
  }

  function closeConversation(
    conversationId,
    requester
  ) {
    const { communication } =
      requireModules();

    if (!validUser(requester)) {
      throw new Error(
        "Authorized requester is required."
      );
    }

    return communication.closeConversation(
      conversationId,
      requester
    );
  }

  /*
   * IMPORTANT:
   *
   * Secure Link Authorization requires the
   * complete validated user object for getUserLinks().
   *
   * The previous bridge incorrectly passed only
   * userId. That caused an API contract mismatch.
   *
   * We now require the same validated user object
   * used by the authorization layer.
   */
  function getUserLinks(user) {
    const { authorization } =
      requireModules();

    if (!validUser(user)) {
      throw new Error(
        "Valid authorized user object is required."
      );
    }

    return authorization.getUserLinks(
      user
    );
  }

  function getStatus() {
    const authorization =
      getAuthorization();

    const communication =
      getCommunication();

    return Object.freeze({
      version: VERSION,

      authorizationLoaded:
        Boolean(authorization),

      communicationLoaded:
        Boolean(communication),

      ready:
        Boolean(
          authorization &&
          communication
        ),

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

      getConversation,
      closeConversation,

      getUserLinks,
      getStatus
    });

})();
