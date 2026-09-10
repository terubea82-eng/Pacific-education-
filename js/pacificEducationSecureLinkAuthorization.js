/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 * =========================================================
 * Version 1.5.0
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
 * - Prototype authorization only.
 * - Production authorization MUST be server-side.
 * - localStorage is NOT a security boundary.
 * - No automatic information access.
 * - Relationship lookup requires a complete authorized user.
 * - Raw user IDs are never accepted for relationship lookup.
 * - No synthetic user is treated as authenticated.
 * - Relationship verification is based on a real authorized
 *   participant supplied by the caller.
 * - Caller-supplied relationship IDs are never trusted.
 * - No passwords, API keys, payment secrets or access tokens
 *   are stored by this module.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.5.0";

  const STORAGE_KEY =
    "pacificEducationSecureLinks";

  const ROLES = Object.freeze([
    "student",
    "teacher",
    "parent",
    "ministry"
  ]);

  const LINK_RULES = Object.freeze({
    student_teacher: {
      roles: ["student", "teacher"],
      permissions: [
        "communication",
        "learning_summary"
      ]
    },

    parent_student: {
      roles: ["parent", "student"],
      permissions: [
        "communication",
        "basic_status"
      ]
    },

    parent_teacher: {
      roles: ["parent", "teacher"],
      permissions: [
        "communication",
        "learning_summary"
      ]
    },

    teacher_ministry: {
      roles: ["teacher", "ministry"],
      permissions: [
        "communication",
        "education_reporting"
      ]
    },

    parent_ministry: {
      roles: ["parent", "ministry"],
      permissions: [
        "communication",
        "application_status"
      ]
    },

    student_ministry: {
      roles: ["student", "ministry"],
      permissions: [
        "communication",
        "authorized_student_services"
      ]
    }
  });

  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  function emptyState() {
    return {
      links: [],
      audit: []
    };
  }

  function loadState() {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return emptyState();
      }

      const parsed =
        JSON.parse(raw);

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
    if (
      !state ||
      typeof state !== "object" ||
      !Array.isArray(state.links) ||
      !Array.isArray(state.audit)
    ) {
      throw new Error(
        "Invalid authorization state."
      );
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
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
      `${prefix}-${Date.now()}-` +
      `${Math.random()
        .toString(36)
        .slice(2, 12)}`
    );
  }

  function audit(
    state,
    action,
    details = {}
  ) {
    state.audit.push({
      id: createId("audit"),
      action,
      timestamp:
        new Date().toISOString(),
      details
    });
  }

  /*
   * =======================================================
   * USER VALIDATION
   * =======================================================
   */

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

  function requireUser(
    user,
    message
  ) {
    if (!validUser(user)) {
      throw new Error(
        message ||
        "Authorized user required."
      );
    }

    return user;
  }

  function sameParticipant(
    first,
    second
  ) {
    return Boolean(
      first &&
      second &&
      first.id === second.id &&
      first.role === second.role
    );
  }

  function participantMatchesLink(
    user,
    link,
    side
  ) {
    if (
      !validUser(user) ||
      !link ||
      typeof link !== "object"
    ) {
      return false;
    }

    if (side === "requester") {
      return (
        user.id === link.requesterId &&
        user.role === link.requesterRole
      );
    }

    if (side === "target") {
      return (
        user.id === link.targetId &&
        user.role === link.targetRole
      );
    }

    return false;
  }

  function isLinkParticipant(
    user,
    link
  ) {
    return Boolean(
      participantMatchesLink(
        user,
        link,
        "requester"
      ) ||
      participantMatchesLink(
        user,
        link,
        "target"
      )
    );
  }

  /*
   * =======================================================
   * LINK RULES
   * =======================================================
   */

  function getRule(linkType) {
    const rule =
      LINK_RULES[linkType];

    if (!rule) {
      throw new Error(
        "Invalid education link type."
      );
    }

    return rule;
  }

  function rolesMatch(
    rule,
    requester,
    target
  ) {
    return Boolean(
      rule.roles.includes(
        requester.role
      ) &&
      rule.roles.includes(
        target.role
      ) &&
      requester.role !==
        target.role
    );
  }

  function verifyParticipants(
    requester,
    target
  ) {
    requireUser(
      requester,
      "Requester verification failed."
    );

    requireUser(
      target,
      "Target verification failed."
    );

    if (
      sameParticipant(
        requester,
        target
      )
    ) {
      throw new Error(
        "Requester and target must be different participants."
      );
    }

    return true;
  }

  /*
   * =======================================================
   * VERIFIED EDUCATION RELATIONSHIP
   * =======================================================
   */

  function getRelationshipLayer() {
    return (
      window
        .PacificEducationVerifiedEducationRelationship ||
      null
    );
  }

  function requireRelationshipLayer() {
    const layer =
      getRelationshipLayer();

    if (!layer) {
      throw new Error(
        "Verified education relationship layer is required."
      );
    }

    if (
      typeof layer.getUserRelationships !==
      "function"
    ) {
      throw new Error(
        "Verified education relationship API is missing."
      );
    }

    return layer;
  }

  /*
   * SECURITY:
   * Only a COMPLETE authorized user may be supplied.
   * Never pass a raw user ID.
   */

  function getRelationshipsForUser(
    user
  ) {
    requireUser(
      user,
      "Authorized user is required for relationship lookup."
    );

    const layer =
      requireRelationshipLayer();

    const relationships =
      layer.getUserRelationships(
        user
      );

    if (
      !Array.isArray(
        relationships
      )
    ) {
      return [];
    }

    return relationships;
  }

  function relationshipParticipantsMatch(
    relationship,
    firstId,
    secondId
  ) {
    if (
      !relationship ||
      typeof relationship !==
        "object"
    ) {
      return false;
    }

    return Boolean(
      (
        relationship.requester
