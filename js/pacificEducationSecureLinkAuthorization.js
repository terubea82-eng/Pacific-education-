/*
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 *
 * Student • Teacher • Parent • Ministry of Education
 *
 * Prototype only.
 * Production authorization MUST be enforced server-side.
 */

(() => {
  "use strict";

  const VERSION = "1.0.0";
  const STORAGE_KEY = "pacificEducationSecureLinks";

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
    return {
      links: [],
      audit: []
    };
  }

  function loadState() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || emptyState();
    } catch {
      return emptyState();
    }
  }

  function saveState(state) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  }

  function audit(state, action, details = {}) {
    state.audit.push({
      id: crypto.randomUUID(),
      action,
      timestamp: new Date().toISOString(),
      details
    });
  }

  function validRole(role) {
    return ROLES.includes(role);
  }

  function validUser(user) {
    return Boolean(
      user &&
      typeof user.id === "string" &&
      user.id.trim() &&
      validRole(user.role) &&
      user.authorized === true
    );
  }

  function getRule(linkType) {
    const rule = LINK_RULES[linkType];

    if (!rule) {
      throw new Error("Invalid education link type.");
    }

    return rule;
  }

  function rolesMatch(rule, requester, target) {
    return (
      rule.roles.includes(requester.role) &&
      rule.roles.includes(target.role) &&
      requester.role !== target.role
    );
  }

  function verifyParticipants(requester, target) {
    if (!validUser(requester)) {
      throw new Error("Requester verification failed.");
    }

    if (!validUser(target)) {
      throw new Error("Target verification failed.");
    }

    return true;
  }

  function requestLink({
    requester,
    target,
    linkType,
    relationship = null,
    jurisdiction = null,
    evidenceReference = null
  }) {
    const rule = getRule(linkType);

    verifyParticipants(requester, target);

    if (!rolesMatch(rule, requester, target)) {
      throw new Error(
        "The selected roles cannot create this link."
      );
    }

    const state = loadState();

    const existing = state.links.find(
      link =>
        link.requesterId === requester.id &&
        link.targetId === target.id &&
        link.linkType === linkType &&
        link.status === "active"
    );

    if (existing) {
      return existing;
    }

    const link = {
      id: crypto.randomUUID(),

      requesterId: requester.id,
      requesterRole: requester.role,

      targetId: target.id,
      targetRole: target.role,

      linkType,

      relationship,

      jurisdiction,

      evidenceReference,

      status: "pending",

      requestedAt: new Date().toISOString(),

      approvedAt: null,
      approvedBy: null,

      revokedAt: null,
      revokedBy: null,
      revokeReason: null,

      permissions: []
    };

    state.links.push(link);

    audit(state, "LINK_REQUESTED", {
      linkId: link.id,
      linkType
    });

    saveState(state);

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkRequested",
        {
          detail: {
            linkId: link.id,
            linkType
          }
        }
      )
    );

    return link;
  }

  function approveLink({
    linkId,
    approver,
    permissions = []
  }) {
    if (!validUser(approver)) {
      throw new Error(
        "Approver authorization failed."
      );
    }

    const state = loadState();

    const link = state.links.find(
      item => item.id === linkId
    );

    if (!link) {
      throw new Error("Education link not found.");
    }

    if (link.status !== "pending") {
      throw new Error(
        "Only pending links can be approved."
      );
    }

    const rule = getRule(link.linkType);

    if (!rule.roles.includes(approver.role)) {
      throw new Error(
        "Approver role is not permitted."
      );
    }

    const approvedPermissions =
      permissions.filter(permission =>
        rule.permissions.includes(permission)
      );

    if (!approvedPermissions.length) {
      throw new Error(
        "At least one authorized permission is required."
      );
    }

    link.status = "active";
    link.permissions = approvedPermissions;
    link.approvedAt = new Date().toISOString();
    link.approvedBy = approver.id;

    audit(state, "LINK_APPROVED", {
      linkId,
      permissions: approvedPermissions
    });

    saveState(state);

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkApproved",
        {
          detail: {
            linkId,
            permissions: approvedPermissions
          }
        }
      )
    );

    return link;
  }

  function authorizeAccess({
    linkId,
    requester,
    requiredPermission
  }) {
    if (!validUser(requester)) {
      return {
        allowed: false,
        reason: "requester_not_authorized"
      };
    }

    const state = loadState();

    const link = state.links.find(
      item =>
        item.id === linkId &&
        item.status === "active"
    );

    if (!link) {
      return {
        allowed: false,
        reason: "active_link_not_found"
      };
    }

    if (
      link.requesterId !== requester.id &&
      link.targetId !== requester.id
    ) {
      return {
        allowed: false,
        reason: "requester_not_participant"
      };
    }

    if (
      !link.permissions.includes(
        requiredPermission
      )
    ) {
      return {
        allowed: false,
        reason: "permission_not_granted"
      };
    }

    return {
      allowed: true,
      linkId,
      permission: requiredPermission
    };
  }

  function revokeLink({
    linkId,
    revoker,
    reason = "authorization_revoked"
  }) {
    if (!validUser(revoker)) {
      throw new Error(
        "Revoker authorization failed."
      );
    }

    const state = loadState();

    const link = state.links.find(
      item => item.id === linkId
    );

    if (!link) {
      throw new Error("Education link not found.");
    }

    if (
      link.requesterId !== revoker.id &&
      link.targetId !== revoker.id &&
      revoker.role !== "ministry"
    ) {
      throw new Error(
        "Revocation authority denied."
      );
    }

    link.status = "revoked";
    link.permissions = [];
    link.revokedAt = new Date().toISOString();
    link.revokedBy = revoker.id;
    link.revokeReason = reason;

    audit(state, "LINK_REVOKED", {
      linkId,
      reason
    });

    saveState(state);

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkRevoked",
        {
          detail: {
            linkId,
            reason
          }
        }
      )
    );

    return link;
  }

  function getUserLinks(userId) {
    if (
      typeof userId !== "string" ||
      !userId.trim()
    ) {
      throw new Error("Valid user ID required.");
    }

    const state = loadState();

    return state.links.filter(
      link =>
        link.requesterId === userId ||
        link.targetId === userId
    );
  }

  function getStatus() {
    const state = loadState();

    return Object.freeze({
      version: VERSION,
      totalLinks: state.links.length,
      activeLinks: state.links.filter(
        link => link.status === "active"
      ).length,
      pendingLinks: state.links.filter(
        link => link.status === "pending"
      ).length,
      revokedLinks: state.links.filter(
        link => link.status === "revoked"
      ).length,
      prototypeOnly: true,
      backendRequiredForProduction: true
    });
  }

  function resetPrototypeState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.PacificEducationSecureLinkAuthorization =
    Object.freeze({
      version: VERSION,
      linkRules: LINK_RULES,
      requestLink,
      approveLink,
      authorizeAccess,
      revokeLink,
      getUserLinks,
      getStatus,
      resetPrototypeState
    });

})();
