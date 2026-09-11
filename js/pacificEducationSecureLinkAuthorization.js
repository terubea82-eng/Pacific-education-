/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 * =========================================================
 * Version 1.6.0
 *
 * Prototype authorization only.
 * Production authorization MUST be server-side.
 * localStorage is NOT a security boundary.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.6.0";
  const STORAGE_KEY = "pacificEducationSecureLinks";
  const MAX_AUDIT = 200;

  const ROLES = Object.freeze([
    "student",
    "teacher",
    "parent",
    "ministry"
  ]);

  const LINK_RULES = Object.freeze({
    student_teacher: {
      roles: ["student", "teacher"],
      permissions: ["communication", "learning_summary"]
    },
    parent_student: {
      roles: ["parent", "student"],
      permissions: ["communication", "basic_status"]
    },
    parent_teacher: {
      roles: ["parent", "teacher"],
      permissions: ["communication", "learning_summary"]
    },
    teacher_ministry: {
      roles: ["teacher", "ministry"],
      permissions: ["communication", "education_reporting"]
    },
    parent_ministry: {
      roles: ["parent", "ministry"],
      permissions: ["communication", "application_status"]
    },
    student_ministry: {
      roles: ["student", "ministry"],
      permissions: ["communication", "authorized_student_services"]
    }
  });

  function emptyState() {
    return { links: [], audit: [] };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();

      const parsed = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.links) ||
        !Array.isArray(parsed.audit)
      ) {
        return emptyState();
      }

      return {
        links: parsed.links,
        audit: parsed.audit
      };
    } catch (_) {
      return emptyState();
    }
  }

  function saveState(state) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        links: Array.isArray(state.links) ? state.links : [],
        audit: Array.isArray(state.audit)
          ? state.audit.slice(-MAX_AUDIT)
          : []
      })
    );
  }

  function createId(prefix) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return (
      prefix +
      "-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function validRole(role) {
    return ROLES.includes(role);
  }

  function validUser(user) {
    return Boolean(
      user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      user.id.trim() &&
      validRole(user.role) &&
      user.authorized === true
    );
  }

  function requireUser(user, message) {
    if (!validUser(user)) {
      throw new Error(message || "Authorized user required.");
    }

    return user;
  }

  function getRule(linkType) {
    const rule = LINK_RULES[linkType];

    if (!rule) {
      throw new Error("Invalid education link type.");
    }

    return rule;
  }

  function rolesMatch(rule, requester, target) {
    return Boolean(
      rule.roles.includes(requester.role) &&
      rule.roles.includes(target.role) &&
      requester.role !== target.role
    );
  }

  function getRelationshipLayer() {
    return (
      window.PacificEducationVerifiedEducationRelationship ||
      null
    );
  }

  function requireRelationshipLayer() {
    const layer = getRelationshipLayer();

    if (
      !layer ||
      typeof layer.getUserRelationships !== "function" ||
      typeof layer.checkRelationship !== "function"
    ) {
      throw new Error(
        "Verified education relationship layer is unavailable."
      );
    }

    return layer;
  }

  function audit(state, action, details) {
    state.audit.push({
      id: createId("audit"),
      action,
      timestamp: new Date().toISOString(),
      details: details || {}
    });

    state.audit = state.audit.slice(-MAX_AUDIT);
  }

  function dispatch(name, detail) {
    if (
      typeof window !== "undefined" &&
      typeof window.dispatchEvent === "function" &&
      typeof CustomEvent !== "undefined"
    ) {
      window.dispatchEvent(
        new CustomEvent(name, { detail })
      );
    }
  }

  function normalizePermissionList(permissions) {
    if (!Array.isArray(permissions)) return [];

    return permissions.filter(
      item =>
        typeof item === "string" &&
        item.trim()
    );
  }

  function hasPermission(link, permission) {
    return Boolean(
      link &&
      link.status === "authorized" &&
      Array.isArray(link.permissions) &&
      link.permissions.includes(permission)
    );
  }

  /*
   * REQUEST
   */
  function requestLink(request) {
    if (!request || typeof request !== "object") {
      return {
        success: false,
        reason: "invalid_request"
      };
    }

    const requester = requireUser(
      request.requester,
      "Authorized requester required."
    );

    const target = requireUser(
      request.target,
      "Authorized target required."
    );

    if (requester.id === target.id) {
      return {
        success: false,
        reason: "participants_must_differ"
      };
    }

    const rule = getRule(request.linkType);

    if (!rolesMatch(rule, requester, target)) {
      return {
        success: false,
        reason: "roles_not_permitted"
      };
    }

    const relationshipLayer = requireRelationshipLayer();

    const relationships =
      relationshipLayer.getUserRelationships(requester);

    const relationship = Array.isArray(relationships)
      ? relationships.find(
          item =>
            item &&
            item.status === "verified" &&
            item.relationshipType === request.linkType &&
            (
              (
                item.requesterId === requester.id &&
                item.targetId === target.id
              ) ||
              (
                item.requesterId === target.id &&
                item.targetId === requester.id
              )
            )
        )
      : null;

    if (!relationship) {
      return {
        success: false,
        reason: "verified_relationship_required"
      };
    }

    const state = loadState();

    const existing = state.links.find(
      item =>
        item.status !== "revoked" &&
        item.requesterId === requester.id &&
        item.targetId === target.id &&
        item.linkType === request.linkType
    );

    if (existing) {
      return {
        success: true,
        status: existing.status,
        linkId: existing.id,
        permissions: existing.permissions.slice()
      };
    }

    const link = {
      id: createId("link"),

      requesterId: requester.id,
      requesterRole: requester.role,

      targetId: target.id,
      targetRole: target.role,

      linkType: request.linkType,
      relationshipId: relationship.id,

      permissions: normalizePermissionList(
        request.permissions &&
        request.permissions.length
          ? request.permissions
          : rule.permissions
      ),

      status: "pending",

      requestedAt: new Date().toISOString(),

      approvedAt: null,
      approvedBy: null,

      revokedAt: null,
      revokedBy: null,
      revokeReason: null
    };

    state.links.push(link);

    audit(state, "LINK_REQUESTED", {
      linkId: link.id,
      linkType: link.linkType,
      requesterId: requester.id,
      targetId: target.id
    });

    saveState(state);

    dispatch(
      "pacificEducationSecureLinkRequested",
      {
        linkId: link.id,
        linkType: link.linkType
      }
    );

    return {
      success: true,
      status: "pending",
      linkId: link.id,
      permissions: link.permissions.slice()
    };
  }

  /*
   * APPROVE
   */
  function approveLink(request) {
    if (!request || typeof request !== "object") {
      return {
        success: false,
        reason: "invalid_request"
      };
    }

    const approver = requireUser(
      request.approver,
      "Authorized approver required."
    );

    if (
      typeof request.linkId !== "string" ||
      !request.linkId.trim()
    ) {
      return {
        success: false,
        reason: "link_id_required"
      };
    }

    const state = loadState();

    const link = state.links.find(
      item => item.id === request.linkId
    );

    if (!link) {
      return {
        success: false,
        reason: "link_not_found"
      };
    }

    if (link.status !== "pending") {
      return {
        success: false,
        reason: "link_not_pending"
      };
    }

    if (
      approver.id !== link.targetId ||
      approver.role !== link.targetRole
    ) {
      return {
        success: false,
        reason: "target_authorization_required"
      };
    }

    const relationshipLayer = requireRelationshipLayer();

    const relationshipCheck =
      relationshipLayer.checkRelationship({
        relationshipId: link.relationshipId,

        requester: {
          id: link.requesterId,
          role: link.requesterRole,
          authorized: true
        },

        target: {
          id: link.targetId,
          role: link.targetRole,
          authorized: true
        },

        relationshipType: link.linkType
      });

    if (
      !relationshipCheck ||
      relationshipCheck.allowed !== true
    ) {
      return {
        success: false,
        reason: "verified_relationship_required"
      };
    }

    link.status = "authorized";
    link.approvedAt = new Date().toISOString();
    link.approvedBy = approver.id;

    audit(state, "LINK_APPROVED", {
      linkId: link.id,
      approvedBy: approver.id
    });

    saveState(state);

    dispatch(
      "pacificEducationSecureLinkApproved",
      {
        linkId: link.id
      }
    );

    return {
      success: true,
      status: "authorized",
      linkId: link.id,
      permissions: link.permissions.slice()
    };
  }

  /*
   * AUTHORIZE ACCESS
   */
  function authorizeAccess(request) {
    if (!request || typeof request !== "object") {
      return {
        allowed: false,
        reason: "invalid_request"
      };
    }

    const user = validUser(request.user)
      ? request.user
      : null;

    if (!user) {
      return {
        allowed: false,
        reason: "authorization_required"
      };
    }

    if (
      typeof request.linkId !== "string" ||
      !request.linkId.trim()
    ) {
      return {
        allowed: false,
        reason: "link_id_required"
      };
    }

    if (
      typeof request.permission !== "string" ||
      !request.permission.trim()
    ) {
      return {
        allowed: false,
        reason: "permission_required"
      };
    }

    const state = loadState();

    const link = state.links.find(
      item =>
        item.id === request.linkId &&
        item.status === "authorized"
    );

    if (!link) {
      return {
        allowed: false,
        reason: "authorized_link_not_found"
      };
    }

    if (
      user.id !== link.requesterId &&
      user.id !== link.targetId
    ) {
      return {
        allowed: false,
        reason: "participant_access_required"
      };
    }

    if (!hasPermission(link, request.permission)) {
      return {
        allowed: false,
        reason: "permission_denied"
      };
    }

    audit(state, "ACCESS_AUTHORIZED", {
      linkId: link.id,
      userId: user.id,
      permission: request.permission
    });

    saveState(state);

    return {
      allowed: true,
      linkId: link.id,
      permission: request.permission
    };
  }

  /*
   * REVOKE
   */
  function revokeLink(request) {
    if (!request || typeof request !== "object") {
      return {
        success: false,
        reason: "invalid_request"
      };
    }

    const revoker = requireUser(
      request.revoker,
      "Authorized revoker required."
    );

    if (
      typeof request.linkId !== "string" ||
      !request.linkId.trim()
    ) {
      return {
        success: false,
        reason: "link_id_required"
      };
    }

    const state = loadState();

    const link = state.links.find(
      item => item.id === request.linkId
    );

    if (!link) {
      return {
        success: false,
        reason: "link_not_found"
      };
    }

    if (
      revoker.id !== link.requesterId &&
      revoker.id !== link.targetId
    ) {
      return {
        success: false,
        reason: "participant_revocation_required"
      };
    }

    if (link.status === "revoked") {
      return {
        success: true,
        status: "revoked",
        linkId: link.id
      };
    }

    link.status = "revoked";
    link.revokedAt = new Date().toISOString();
    link.revokedBy = revoker.id;

    link.revokeReason =
      typeof request.reason === "string" &&
      request.reason.trim()
        ? request.reason.trim()
        : "relationship_authorization_revoked";

    audit(state, "LINK_REVOKED", {
      linkId: link.id,
      revokedBy: revoker.id,
      reason: link.revokeReason
    });

    saveState(state);

    dispatch(
      "pacificEducationSecureLinkRevoked",
      {
        linkId: link.id,
        revokedBy: revoker.id
      }
    );

    return {
      success: true,
      status: "revoked",
      linkId: link.id
    };
  }

  function getLinksForUser(user) {
    requireUser(
      user,
      "Authorized user required."
    );

    const state = loadState();

    return state.links.filter(
      link =>
        link.requesterId === user.id ||
        link.targetId === user.id
    );
  }

  function getStatus() {
    const state = loadState();

    return {
      version: VERSION,
      available: true,

      prototypeOnly: true,

      productionServerAuthorizationRequired: true,

      localStorageIsSecurityBoundary: false,

      automaticAccess: false,

      verifiedRelationshipRequired: true,

      totalLinks:
        state.links.length,

      pendingLinks:
        state.links.filter(
          link => link.status === "pending"
        ).length,

      authorizedLinks:
        state.links.filter(
          link => link.status === "authorized"
        ).length,

      revokedLinks:
        state.links.filter(
          link => link.status === "revoked"
        ).length
    };
  }

  function resetPrototypeState() {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  window.PacificEducationSecureLinkAuthorization =
    Object.freeze({
      version: VERSION,

      roles: ROLES.slice(),

      linkRules: LINK_RULES,

      isValidUser: validUser,

      requestLink,

      approveLink,

      authorizeAccess,

      revokeLink,

      getLinksForUser,
      getUserLinks: getLinksForUser,

      getStatus,

      resetPrototypeState
    });
})();
  
  
