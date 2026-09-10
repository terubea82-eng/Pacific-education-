/*
 * PACIFIC EDUCATION
 * EDUCATION LINK CENTER
 * VERSION 1.2.0
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Dashboard-box connection control.
 * Prototype only.
 *
 * Security flow:
 * Identity → Role → Verified Relationship
 * → Authorization → Permission → Communication
 *
 * Link availability NEVER means information access.
 *
 * No passwords, API keys, access tokens,
 * payment secrets, or private credentials.
 */

(() => {
  "use strict";

  const VERSION = "1.2.0";

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

  function getBridge() {
    return (
      window.PacificEducationEducationLinkBridge ||
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

  function validLinkType(type) {
    return Object.prototype.hasOwnProperty.call(
      LINK_TYPES,
      type
    );
  }

  function getAvailableLinkTypes(role) {
    return Object.entries(LINK_TYPES)
      .filter(([, roles]) =>
        roles.includes(role)
      )
      .map(([type]) => type);
  }

  function requireAuthorization() {
    const authorization =
      getAuthorization();

    if (
      !authorization ||
      typeof authorization.requestLink !==
        "function" ||
      typeof authorization.approveLink !==
        "function" ||
      typeof authorization.authorizeAccess !==
        "function" ||
      typeof authorization.revokeLink !==
        "function" ||
      typeof authorization.getUserLinks !==
        "function"
    ) {
      throw new Error(
        "Secure Link Authorization module is unavailable or incomplete."
      );
    }

    return authorization;
  }

  function requireRelationshipLayer() {
    const relationship =
      getRelationshipLayer();

    if (
      !relationship ||
      typeof relationship.getUserRelationships !==
        "function"
    ) {
      throw new Error(
        "Verified Education Relationship module is unavailable or incomplete."
      );
    }

    return relationship;
  }

  function requestLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid link request is required."
      );
    }

    if (!validUser(request.requester)) {
      throw new Error(
        "Requester is not authorized."
      );
    }

    if (!validUser(request.target)) {
      throw new Error(
        "Target user is not authorized."
      );
    }

    if (!validLinkType(request.linkType)) {
      throw new Error(
        "Invalid education link type."
      );
    }

    return requireAuthorization().requestLink(
      request
    );
  }

  function approveLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid link approval request is required."
      );
    }

    return requireAuthorization().approveLink(
      request
    );
  }

  function revokeLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid link revocation request is required."
      );
    }

    return requireAuthorization().revokeLink(
      request
    );
  }

  function checkAccess(request) {
    if (!request || typeof request !== "object") {
      return {
        allowed: false,
        reason:
          "Valid access request is required."
      };
    }

    return requireAuthorization()
      .authorizeAccess(request);
  }

  /*
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

    return (
      requireAuthorization().getUserLinks(
        user
      ) || []
    );
  }

  function getUserRelationships(userId) {
    if (
      typeof userId !== "string" ||
      !userId.trim()
    ) {
      throw new Error(
        "Valid user ID is required."
      );
    }

    return (
      requireRelationshipLayer()
        .getUserRelationships(userId) || []
    );
  }

  function getDashboardModel(user) {
    if (!validUser(user)) {
      throw new Error(
        "Dashboard user is not authorized."
      );
    }

    const links =
      getUserLinks(user);

    const relationships =
      getUserRelationships(user.id);

    const verifiedRelationships =
      relationships.filter(
        relationship =>
          relationship &&
          relationship.status ===
            "verified"
      );

    return Object.freeze({
      version: VERSION,

      userId: user.id,

      role: user.role,

      availableLinkTypes:
        getAvailableLinkTypes(
          user.role
        ),

      pending:
        links.filter(
          link =>
            link &&
            link.status === "pending"
        ),

      active:
        links.filter(
          link =>
            link &&
            link.status === "active"
        ),

      revoked:
        links.filter(
          link =>
            link &&
            link.status === "revoked"
        ),

      linkCount:
        links.length,

      verifiedRelationshipCount:
        verifiedRelationships.length,

      security: {
        identityRequired: true,
        roleRequired: true,
        verificationRequired: true,
        verifiedRelationshipRequired: true,
        authorizationRequired: true,
        permissionRequired: true,
        auditRequired: true,
        automaticInformationAccess:
          false
      }
    });
  }

  function getStatus() {
    const authorization =
      getAuthorization();

    const bridge =
      getBridge();

    const relationship =
      getRelationshipLayer();

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

    const bridgeReady =
      Boolean(
        bridge &&
        typeof bridge.requestConnection ===
          "function" &&
        typeof bridge.approveConnection ===
          "function" &&
        typeof bridge.checkAccess ===
          "function" &&
        typeof bridge.revokeConnection ===
          "function" &&
        typeof bridge.openConversation ===
          "function" &&
        typeof bridge.sendAuthorizedMessage ===
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
      bridgeReady &&
      relationshipReady;

    return Object.freeze({
      version: VERSION,

      authorizationLoaded:
        authorizationReady,

      bridgeLoaded:
        bridgeReady,

      verifiedRelationshipLoaded:
        relationshipReady,

      ready,

      securityFlow:
        "identity_role_verified_relationship_authorization_permission_communication",

      verifiedRelationshipRequired:
        true,

      activeApprovedLinkRequired:
        true,

      automaticInformationAccess:
        false,

      prototypeOnly:
        true,

      productionBackendRequired:
        true
    });
  }

  window.PacificEducationEducationLinkCenter =
    Object.freeze({
      version: VERSION,

      requestLink,
      approveLink,
      revokeLink,
      checkAccess,

      getUserLinks,
      getUserRelationships,

      getDashboardModel,
      getStatus
    });

})();
