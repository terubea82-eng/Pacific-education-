/*
 * PACIFIC EDUCATION
 * EDUCATION LINK BRIDGE
 * VERSION 1.2.0
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
 */

(() => {
  "use strict";

  const VERSION = "1.2.0";

  function getAuthorization() {
    return window.PacificEducationSecureLinkAuthorization;
  }

  function getCommunication() {
    return window.PacificEducationSecureCommunication;
  }

  function getRelationshipLayer() {
    return window.PacificEducationVerifiedEducationRelationship;
  }

  function requireModules() {
    const authorization = getAuthorization();
    const communication = getCommunication();
    const relationship = getRelationshipLayer();

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

    if (!relationship) {
      throw new Error(
        "Verified Education Relationship module is not loaded."
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
      text,
      linkId
    });
  }

  function getUserLinks(userId) {
    const { authorization } = requireModules();

    return authorization.getUserLinks(userId);
  }

  function getStatus() {
    const authorization = getAuthorization();
    const communication = getCommunication();
    const relationship = getRelationshipLayer();

    const allLoaded =
      Boolean(
        authorization &&
        communication &&
        relationship
      );

    return Object.freeze({
      version: VERSION,

      authorizationLoaded:
        Boolean(authorization),

      communicationLoaded:
        Boolean(communication),

      verifiedRelationshipLoaded:
        Boolean(relationship),

      ready: allLoaded,

      securityFlow:
        "identity_role_verified_relationship_authorization_permission_communication",

      verifiedRelationshipRequired: true,

      relationshipRecheckedByAuthorization: true,

      activeApprovedLinkPassedToCommunication: true,

      automaticInformationAccess: false,

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
