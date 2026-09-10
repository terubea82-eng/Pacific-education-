/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK CENTER
 * =========================================================
 * Version 1.3.1
 *
 * LEGACY / COMPATIBILITY CENTER
 *
 * Security sequence:
 *
 * Identity
 *   ↓
 * Role
 *   ↓
 * Verified Education Relationship
 *   ↓
 * Link Authorization
 *   ↓
 * Permission
 *   ↓
 * Access / Communication
 *
 * SECURITY RULES:
 * - Complete authorized user objects are required.
 * - Raw user IDs are never used for relationship lookup.
 * - Link availability does NOT mean information access.
 * - Verified relationship is required.
 * - Authorization is required.
 * - Permission is required.
 * - No automatic information access.
 * - No synthetic authorized users.
 * - Caller-supplied relationship IDs are not trusted.
 * - Prototype only.
 * - Production authorization MUST be server-side.
 * - localStorage is NOT a security boundary.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.3.1";

  const LINK_TYPES = Object.freeze({
    student_teacher: ["student", "teacher"],
    parent_student: ["parent", "student"],
    parent_teacher: ["parent", "teacher"],
    teacher_ministry: ["teacher", "ministry"],
    parent_ministry: ["parent", "ministry"],
    student_ministry: ["student", "ministry"]
  });

  function getAuthorization() {
    return window.PacificEducationSecureLinkAuthorization || null;
  }

  function getBridge() {
    return window.PacificEducationEducationLinkBridge || null;
  }

  function getRelationshipLayer() {
    return window.PacificEducationVerifiedEducationRelationship || null;
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

  function requireUser(user, message) {
    if (!validUser(user)) {
      throw new Error(
        message || "Complete authorized user object required."
      );
    }

    return user;
  }

  function validLinkType(type) {
    return Object.prototype.hasOwnProperty.call(
      LINK_TYPES,
      type
    );
  }

  function getAvailableLinkTypes(role) {
    return Object.entries(LINK_TYPES)
      .filter(([, roles]) => roles.includes(role))
      .map(([type]) => type);
  }

  function requireAuthorization() {
    const authorization = getAuthorization();

    const requiredMethods = [
      "requestLink",
      "approveLink",
      "authorizeAccess",
      "revokeLink",
      "getUserLinks"
    ];

    if (!authorization) {
      throw new Error(
        "Secure Link Authorization module is not loaded."
      );
    }

    for (const method of requiredMethods) {
      if (typeof authorization[method] !== "function") {
        throw new Error(
          `Secure Link Authorization API is missing: ${method}.`
        );
      }
    }

    return authorization;
  }

  function requireRelationshipLayer() {
    const relationship = getRelationshipLayer();

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

    return relationship;
  }

  function requestLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error("Valid link request required.");
    }

    requireUser(
      request.requester,
      "Requester is not authorized."
    );

    requireUser(
      request.target,
      "Target user is not authorized."
    );

    if (
      request.requester.id === request.target.id &&
      request.requester.role === request.target.role
    ) {
      throw new Error(
        "Requester and target must be different participants."
      );
    }

    if (!validLinkType(request.linkType)) {
      throw new Error("Invalid education link type.");
    }

    const authorization = requireAuthorization();

    return authorization.requestLink(request);
  }

  function approveLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error("Valid approval request required.");
    }

    requireUser(
      request.approver,
      "Complete authorized approver object required."
    );

    const authorization = requireAuthorization();

    return authorization.approveLink(request);
  }

  function checkAccess(request) {
    if (!request || typeof request !== "object") {
      return {
        allowed: false,
        reason: "Valid access request required."
      };
    }

    if (!validUser(request.requester)) {
      return {
        allowed: false,
        reason:
          "Complete authorized requester object required."
      };
    }

    const authorization = getAuthorization();

    if (
      !authorization ||
      typeof authorization.authorizeAccess !== "function"
    ) {
      return {
        allowed: false,
        reason: "Authorization module unavailable."
      };
    }

    return authorization.authorizeAccess(request);
  }

  function revokeLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error("Valid revoke request required.");
    }

    requireUser(
      request.revoker,
      "Complete authorized revoker object required."
    );

    const authorization = requireAuthorization();

    return authorization.revokeLink(request);
  }

  function getUserLinks(user) {
    requireUser(
      user,
      "Complete authorized user object required."
    );

    const authorization = requireAuthorization();

    return authorization.getUserLinks(user);
  }

  function getUserRelationships(user) {
    requireUser(
      user,
      "Complete authorized user object required for relationship lookup."
    );

    const relationship = requireRelationshipLayer();

    /*
     * IMPORTANT:
     * The complete authorized user object is passed.
     * Never replace this with user.id.
     */
    return relationship.getUserRelationships(user);
  }

  function getDashboardModel(user) {
    requireUser(
      user,
      "Dashboard user is not authorized."
    );

    const links = getUserLinks(user);
    const relationships = getUserRelationships(user);

    const safeLinks = Array.isArray(links)
      ? links
      : [];

    const safeRelationships =
      Array.isArray(relationships)
        ? relationships
        : [];

    return Object.freeze({
      version: VERSION,

      userId: user.id,

      role: user.role,

      availableLinkTypes:
        getAvailableLinkTypes(user.role),

      pending: safeLinks.filter(
        link =>
          link &&
          link.status === "pending"
      ),

      active: safeLinks.filter(
        link =>
          link &&
          link.status === "active"
      ),

      revoked: safeLinks.filter(
        link =>
          link &&
          link.status === "revoked"
      ),

      relationships: safeRelationships,

      linkCount: safeLinks.length,

      relationshipCount:
        safeRelationships.length,

      security: {
        identityRequired: true,
        roleRequired: true,
        verificationRequired: true,
        verifiedRelationshipRequired: true,
        authorizationRequired: true,
        permissionRequired: true,
        auditRequired: true,
        completeAuthorizedUserRequired: true,
        rawIdRelationshipLookup: false,
        syntheticAuthorizedUsers: false,
        automaticInformationAccess: false,
        callerSuppliedRelationshipIdsTrusted: false,
        prototypeOnly: true,
        productionBackendRequired: true
      }
    });
  }

  function getStatus() {
    const authorization = getAuthorization();
    const bridge = getBridge();
    const relationship = getRelationshipLayer();

    const authorizationReady = Boolean(
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

    const bridgeReady = Boolean(
      bridge &&
      typeof bridge.requestConnection ===
        "function" &&
      typeof bridge.approveConnection ===
        "function" &&
      typeof bridge.checkAccess ===
        "function" &&
      typeof bridge.revokeConnection ===
        "function"
    );

    const relationshipReady = Boolean(
      relationship &&
      typeof relationship.getUserRelationships ===
        "function"
    );

    return Object.freeze({
      module: "PacificEducationEducationLinkCenter",

      version: VERSION,

      ready:
        authorizationReady &&
        relationshipReady,

      authorizationReady,

      bridgeReady,

      relationshipReady,

      publicApi: [
        "requestLink",
        "approveLink",
        "revokeLink",
        "checkAccess",
        "getUserLinks",
        "getUserRelationships",
        "getDashboardModel",
        "getStatus"
      ],

      linkTypes: Object.keys(LINK_TYPES),

      security: {
        identityRequired: true,
        roleRequired: true,
        verificationRequired: true,
        verifiedRelationshipRequired: true,
        authorizationRequired: true,
        permissionRequired: true,
        completeAuthorizedUserRequired: true,
        rawIdRelationshipLookup: false,
        syntheticAuthorizedUsers: false,
        automaticInformationAccess: false,
        callerSuppliedRelationshipIdsTrusted: false,
        prototypeOnly: true,
        productionBackendRequired: true,
        localStorageTrusted: false,
        credentialsStored: false,
        apiKeysStored: false,
        paymentSecretsStored: false
      }
    });
  }

  const API = Object.freeze({
    requestLink,
    approveLink,
    revokeLink,
    checkAccess,
    getUserLinks,
    getUserRelationships,
    getDashboardModel,
    getStatus
  });

  window.PacificEducationEducationLinkCenter = API;
})();
