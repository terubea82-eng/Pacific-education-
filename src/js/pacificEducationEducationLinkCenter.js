/*
 * =========================================================
 * PACIFIC EDUCATION
 * EDUCATION LINK CENTER
 * =========================================================
 *
 * Version: 1.3.0
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Dashboard-box connection control.
 * Prototype only.
 *
 * Security rules:
 * - Link availability does NOT mean information access.
 * - Access requires verified relationship + authorization + permission.
 * - Relationship queries require the complete authorized user object.
 * - No automatic information access.
 * - Production backend security is required.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.3.0";

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

    if (!validUser(request.requester)) {
      throw new Error("Requester is not authorized.");
    }

    if (!validUser(request.target)) {
      throw new Error("Target user is not authorized.");
    }

    if (!validLinkType(request.linkType)) {
      throw new Error("Invalid education link type.");
    }

    const authorization = requireAuthorization();

    return authorization.requestLink(request);
  }

  function approveLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid approval request required."
      );
    }

    if (!validUser(request.approver)) {
      throw new Error("Approver is not authorized.");
    }

    const authorization = requireAuthorization();

    return authorization.approveLink(request);
  }

  function revokeLink(request) {
    if (!request || typeof request !== "object") {
      throw new Error(
        "Valid revoke request required."
      );
    }

    if (!validUser(request.revoker)) {
      throw new Error("Revoker is not authorized.");
    }

    const authorization = requireAuthorization();

    return authorization.revokeLink(request);
  }

  function checkAccess(request) {
    if (!request || typeof request !== "object") {
      return {
        allowed: false,
        reason: "Valid access request required."
      };
    }

    const authorization = getAuthorization();

    if (
      !authorization ||
      typeof authorization.authorizeAccess !==
        "function"
    ) {
      return {
        allowed: false,
        reason: "Authorization module unavailable."
      };
    }

    return authorization.authorizeAccess(request);
  }

  function getUserLinks(user) {
    if (!validUser(user)) {
      throw new Error(
        "Complete authorized user object required."
      );
    }

    const authorization = requireAuthorization();

    return authorization.getUserLinks(user);
  }

  /*
   * SECURITY:
   * Relationship access must receive the complete
   * authorized user object.
   *
   * Raw user IDs are intentionally rejected.
   */
  function getUserRelationships(user) {
    if (!validUser(user)) {
      throw new Error(
        "Complete authorized user object required."
      );
    }

    const relationship = requireRelationshipLayer();

    return relationship.getUserRelationships(user);
  }

  function getDashboardModel(user) {
    if (!validUser(user)) {
      throw new Error(
        "Dashboard user is not authorized."
      );
    }

    const links = getUserLinks(user);
    const relationships = getUserRelationships(user);

    return Object.freeze({
      version: VERSION,

      userId: user.id,

      role: user.role,

      availableLinkTypes:
        getAvailableLinkTypes(user.role),

      pending: links.filter(
        link => link.status === "pending"
      ),

      active: links.filter(
        link => link.status === "active"
      ),

      revoked: links.filter(
        link => link.status === "revoked"
      ),

      relationships: Array.isArray(relationships)
        ? relationships
        : [],

      linkCount: links.length,

      security: {
        verificationRequired: true,
        verifiedRelationshipRequired: true,
        authorizationRequired: true,
        permissionRequired: true,
        auditRequired: true,
        completeAuthorizedUserRequired: true,
        automaticInformationAccess: false
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
      version: VERSION,

      authorizationLoaded:
        Boolean(authorization),

      authorizationReady,

      bridgeLoaded:
        Boolean(bridge),

      bridgeReady,

      relationshipLoaded:
        Boolean(relationship),

      relationshipReady,

      ready:
        authorizationReady &&
        bridgeReady &&
        relationshipReady,

      prototypeOnly: true,

      productionBackendRequired: true,

      security: {
        verifiedRelationshipRequired: true,
        authorizationRequired: true,
        permissionRequired: true,
        completeAuthorizedUserRequired: true,
        automaticInformationAccess: false
      }
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
