/*
 * PACIFIC EDUCATION
 * EDUCATION LINK BRIDGE
 * Version 1.1.0
 *
 * Connects:
 * Core-facing education link services
 * Secure Link Authorization
 * Secure Communication
 *
 * Student • Teacher • Parent • Ministry
 *
 * Prototype only.
 * Production authorization MUST remain server-side.
 */

(() => {
  "use strict";

  const VERSION = "1.1.0";

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

    return { authorization, communication };
  }

  function requestConnection(request) {
    const { authorization } = requireModules();
    return authorization.requestLink(request);
  }

  function approveConnection(request) {
    const { authorization } = requireModules();
    return authorization.approveLink(request);
  }

  function checkAccess(request) {
    const { authorization } = requireModules();
    return authorization.authorizeAccess(request);
  }

  function revokeConnection(request) {
    const { authorization } = requireModules();
    return authorization.revokeLink(request);
  }

  function openConversation({
    linkId,
    requester,
    requiredPermission = "communication",
    recipient
  }) {
    const { authorization, communication } = requireModules();

    if (!linkId) {
      throw new Error(
        "Active approved education link is required."
      );
    }

    const access = authorization.authorizeAccess({
      linkId,
      requester,
      requiredPermission
    });

    if (!access || access.allowed !== true) {
      throw new Error("Communication access denied.");
    }

    return communication.createConversation(
      requester,
      recipient,
      { linkId }
    );
  }

  function sendAuthorizedMessage({
    linkId,
    conversationId,
    sender,
    recipient,
    text
  }) {
    const { authorization, communication } = requireModules();

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

    const access = authorization.authorizeAccess({
      linkId,
      requester: sender,
      requiredPermission: "communication"
    });

    if (!access || access.allowed !== true) {
      throw new Error("Message access denied.");
    }

    return communication.sendMessage({
      conversationId,
      sender,
      recipient,
      text,
      linkId
    });
  }

  function getConversation(conversationId, requester) {
    const { communication } = requireModules();

    return communication.getConversation(
      conversationId,
      requester
    );
  }

  function closeConversation(conversationId, requester) {
    const { communication } = requireModules();

    return communication.closeConversation(
      conversationId,
      requester
    );
  }

  function getUserLinks(userId) {
    const { authorization } = requireModules();

    return authorization.getUserLinks(userId);
  }

  function getStatus() {
    const authorization = getAuthorization();
    const communication = getCommunication();

    return Object.freeze({
      version: VERSION,
      authorizationLoaded: Boolean(authorization),
      communicationLoaded: Boolean(communication),
      ready: Boolean(
        authorization && communication
      ),
      productionBackendRequired: true
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
