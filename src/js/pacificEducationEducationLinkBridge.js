/*
 * PACIFIC EDUCATION
 * EDUCATION LINK BRIDGE
 *
 * Connects:
 * Core
 * Secure Link Authorization
 * Secure Communication
 *
 * Student • Teacher • Parent • Ministry
 *
 * Prototype only.
 */

(() => {
  "use strict";

  const VERSION = "1.0.0";

  function getAuthorization() {
    return window.PacificEducationSecureLinkAuthorization;
  }

  function getCommunication() {
    return window.PacificEducationSecureCommunication;
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
    const {
      authorization,
      communication
    } = requireModules();

    const access =
      authorization.authorizeAccess({
        linkId,
        requester,
        requiredPermission
      });

    if (!access.allowed) {
      throw new Error(
        "Communication access denied."
      );
    }

    return communication.createConversation(
      requester,
      recipient
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

    const access =
      authorization.authorizeAccess({
        linkId,
        requester: sender,
        requiredPermission: "communication"
      });

    if (!access.allowed) {
      throw new Error(
        "Message access denied."
      );
    }

    return communication.sendMessage({
      conversationId,
      sender,
      recipient,
      text
    });
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
      getUserLinks,
      getStatus
    });

})();
