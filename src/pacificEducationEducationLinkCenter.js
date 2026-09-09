/*
 * PACIFIC EDUCATION
 * EDUCATION LINK CENTER
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Dashboard-box connection control.
 * Prototype only.
 *
 * Security rule:
 * Link availability does NOT mean information access.
 * Access requires verification + authorization + active permission.
 */

(() => {
  "use strict";

  const VERSION = "1.0.0";

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

  function validUser(user) {
    return Boolean(
      user &&
      typeof user.id === "string" &&
      user.id.trim() &&
      typeof user.role === "string" &&
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

  function requestLink(request) {
    if (!validUser(request?.requester)) {
      throw new Error("Requester is not authorized.");
    }

    if (!validUser(request?.target)) {
      throw new Error("Target user is not authorized.");
    }

    if (!validLinkType(request.linkType)) {
      throw new Error("Invalid education link type.");
    }

    const authorization = getAuthorization();

    if (!authorization?.requestLink) {
      throw new Error(
        "Secure Link Authorization module is not loaded."
      );
    }

    return authorization.requestLink(request);
  }

  function approveLink(request) {
    const authorization = getAuthorization();

    if (!authorization?.approveLink) {
      throw new Error(
        "Secure Link Authorization module is not loaded."
      );
    }

    return authorization.approveLink(request);
  }

  function revokeLink(request) {
    const authorization = getAuthorization();

    if (!authorization?.revokeLink) {
      throw new Error(
        "Secure Link Authorization module is not loaded."
      );
    }

    return authorization.revokeLink(request);
  }

  function checkAccess(request) {
    const authorization = getAuthorization();

    if (!authorization?.authorizeAccess) {
      return {
        allowed: false,
        reason: "Authorization module unavailable."
      };
    }

    return authorization.authorizeAccess(request);
  }

  function getUserLinks(userId) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID required.");
    }

    const authorization = getAuthorization();

    if (!authorization?.getUserLinks) {
      return [];
    }

    return authorization.getUserLinks(userId);
  }

  function getDashboardModel(user) {
    if (!validUser(user)) {
      throw new Error("Dashboard user is not authorized.");
    }

    const links = getUserLinks(user.id);

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

      linkCount: links.length,

      security: {
        verificationRequired: true,
        authorizationRequired: true,
        permissionRequired: true,
        auditRequired: true,
        automaticInformationAccess: false
      }
    });
  }

  function getStatus() {
    const authorization = getAuthorization();
    const bridge = getBridge();

    return Object.freeze({
      version: VERSION,
      authorizationLoaded: Boolean(authorization),
      bridgeLoaded: Boolean(bridge),
      ready: Boolean(authorization && bridge),
      prototypeOnly: true,
      productionBackendRequired: true
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
      getDashboardModel,
      getStatus
    });

})();
