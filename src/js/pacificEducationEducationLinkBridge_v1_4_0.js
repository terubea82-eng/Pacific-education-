/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK BRIDGE
 * VERSION 1.4.0
 * =========================================================
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
 * → Authorization → Communication Permission
 * → Communication
 *
 * IMPORTANT:
 * - Communication always requires "communication" permission.
 * - Callers cannot substitute another permission.
 * - Link availability NEVER means information access.
 * - Verified relationship and authorization remain required.
 *
 * Prototype only.
 *
 * No passwords, API keys, access tokens,
 * payment secrets, or private credentials.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.4.0";
  const REQUIRED_PERMISSION = "communication";

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

    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid connection request is required."
      );
    }

    return authorization.requestLink(request);
  }

  function approveConnection(request) {
    const { authorization } = requireModules();

    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid connection approval request is required."
      );
    }

    return authorization.approveLink(request);
  }

  function checkAccess(request) {
    const { authorization } = requireModules();

    if (!request || typeof request !== "object") {
      return {
        allowed: false,
        reason: "Valid access request is required."
      };
    }

    /*
     * Authorization contract:
     *
     * authorizeAccess({
     *   linkId,
     *   user,
     *   permission
     * })
     */

    return authorization.authorizeAccess({
      linkId: request.linkId,
      user: request.user,
      permission: request.permission
    });
  }

  function revokeConnection(request) {
    const { authorization } = requireModules();

    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid connection revocation request is required."
      );
    }

    return authorization.revokeLink(request);
  }

  /*
   * =======================================================
   * OPEN SECURE COMMUNICATION
   * =======================================================
   *
   * Communication is deliberately restricted to the
   * communication permission.
   *
   * The caller cannot replace this with another permission.
   */

  function openConversation({
    linkId,
    requester,
    requiredPermission,
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

    /*
     * SECURITY BOUNDARY
     *
     * Ignore any caller-supplied permission.
     *
     * This bridge opens communication only when the
     * requester has the exact communication permission.
     */

    if (
      requiredPermission !== undefined &&
      requiredPermission !== null &&
      requiredPermission !== REQUIRED_PERMISSION
    ) {
      throw new Error(
        "Invalid communication permission requested."
      );
    }

    const access =
      authorization.authorizeAccess({
        linkId,
        user: requester,
        permission: REQUIRED_PERMISSION
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

  /*
   * =======================================================
   * SEND AUTHORIZED MESSAGE
   * =======================================================
   */

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

    /*
     * Communication permission is fixed here.
     * It cannot be supplied by the caller.
     */

    const access =
      authorization.authorizeAccess({
        linkId,
        user: sender,
        permission: REQUIRED_PERMISSION
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
   * =======================================================
   * GET USER LINKS
   * =======================================================
   *
   * Secure Link Authorization.getUserLinks()
   * requires the complete validated user object.
   *
   * Do not pass only userId.
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

  /*
   * =======================================================
   * STATUS
   * =======================================================
   */

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

      requiredPermission:
        REQUIRED_PERMISSION,

      authorizationLoaded:
        authorizationReady,

      communicationLoaded:
        communicationReady,

      verifiedRelationshipLoaded:
        relationshipReady,

      ready,

      securityFlow:
        "identity_role_verified_relationship_authorization_communication_permission_communication",

      verifiedRelationshipRequired:
        true,

      relationshipRecheckedByAuthorization:
        true,

      activeApprovedLinkPassedToCommunication:
        true,

      communicationPermissionFixed:
        true,

      callerCannotSubstitutePermission:
        true,

      automaticInformationAccess:
        false,

      prototypeOnly:
        true,

      productionBackendRequired:
        true
    });
  }

  window.PacificEducationEducationLinkBridgeV140 =
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
