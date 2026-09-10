/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 * =========================================================
 * Version 1.4.0
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
 * IMPORTANT:
 * - Prototype authorization only.
 * - Production authorization MUST be enforced server-side.
 * - localStorage MUST NOT be trusted as a security boundary.
 * - No automatic information access.
 * - Relationship lookup requires a complete authorized user.
 * - Raw user IDs are never accepted for relationship lookup.
 * - No passwords, API keys, payment secrets or access tokens
 *   are stored by this module.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.4.0";

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
   * SECURITY FIX:
   *
   * The relationship layer now requires the COMPLETE
   * authorized user object.
   *
   * Never pass requester.id or target.id.
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

    let relationships;

    try {
      relationships =
        layer.getUserRelationships(
          user
        );
    } catch (_) {
      return [];
    }

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
        relationship.requesterId ===
          firstId &&
        relationship.targetId ===
          secondId
      ) ||
      (
        relationship.requesterId ===
          secondId &&
        relationship.targetId ===
          firstId
      )
    );
  }

  function findVerifiedRelationship({
    requester,
    target,
    relationshipType
  }) {
    if (
      !validUser(requester) ||
      !validUser(target) ||
      typeof relationshipType !==
        "string" ||
      !relationshipType.trim()
    ) {
      return null;
    }

    let requesterRelationships =
      [];

    try {
      requesterRelationships =
        getRelationshipsForUser(
          requester
        );
    } catch (_) {
      requesterRelationships =
        [];
    }

    const relationship =
      requesterRelationships.find(
        item =>
          item &&
          item.status === "verified" &&
          item.relationshipType ===
            relationshipType &&
          relationshipParticipantsMatch(
            item,
            requester.id,
            target.id
          )
      );

    if (relationship) {
      return relationship;
    }

    /*
     * Do not silently query the target as an arbitrary ID.
     * The target must also be a complete authorized user.
     *
     * This lookup is permitted only because the complete
     * authorized target object was supplied.
     */

    let targetRelationships =
      [];

    try {
      targetRelationships =
        getRelationshipsForUser(
          target
        );
    } catch (_) {
      targetRelationships =
        [];
    }

    return (
      targetRelationships.find(
        item =>
          item &&
          item.status === "verified" &&
          item.relationshipType ===
            relationshipType &&
          relationshipParticipantsMatch(
            item,
            requester.id,
            target.id
          )
      ) ||
      null
    );
  }

  function findVerifiedRelationshipForLink(
    link,
    requester
  ) {
    if (
      !link ||
      typeof link !== "object"
    ) {
      throw new Error(
        "Valid education link required."
      );
    }

    requireUser(
      requester,
      "Authorized requester required."
    );

    const requesterMatches =
      participantMatchesLink(
        requester,
        link,
        "requester"
      ) ||
      participantMatchesLink(
        requester,
        link,
        "target"
      );

    if (!requesterMatches) {
      throw new Error(
        "Requester is not a participant in this link."
      );
    }

    const targetUser =
      link.requesterId === requester.id
        ? {
            id: link.targetId,
            role: link.targetRole,
            authorized: true
          }
        : {
            id: link.requesterId,
            role: link.requesterRole,
            authorized: true
          };

    /*
     * This synthetic object is used only as a prototype
     * lookup identity. Production systems MUST obtain the
     * authoritative authenticated user record server-side.
     */

    const relationship =
      findVerifiedRelationship({
        requester,
        target: targetUser,
        relationshipType:
          link.linkType
      });

    if (!relationship) {
      throw new Error(
        "Verified education relationship required."
      );
    }

    if (
      typeof relationship.id !==
        "string" ||
      !relationship.id.trim()
    ) {
      throw new Error(
        "Verified relationship ID is missing."
      );
    }

    return relationship;
  }

  /*
   * =======================================================
   * REQUEST LINK
   * =======================================================
   */

  function requestLink({
    requester,
    target,
    linkType,
    relationship = null,
    relationshipId = null,
    jurisdiction = null,
    evidenceReference = null
  }) {
    const rule =
      getRule(linkType);

    verifyParticipants(
      requester,
      target
    );

    if (
      !rolesMatch(
        rule,
        requester,
        target
      )
    ) {
      throw new Error(
        "The selected roles cannot create this link."
      );
    }

    const verifiedRelationship =
      findVerifiedRelationship({
        requester,
        target,
        relationshipType:
          linkType
      });

    const state =
      loadState();

    const existing =
      state.links.find(
        link =>
          link &&
          link.requesterId ===
            requester.id &&
          link.targetId ===
            target.id &&
          link.requesterRole ===
            requester.role &&
          link.targetRole ===
            target.role &&
          link.linkType ===
            linkType &&
          (
            link.status ===
              "active" ||
            link.status ===
              "pending"
          )
      );

    if (existing) {
      return existing;
    }

    const link = {
      id: createId("link"),

      requesterId:
        requester.id,

      requesterRole:
        requester.role,

      targetId:
        target.id,

      targetRole:
        target.role,

      linkType,

      relationship:
        relationship || null,

      /*
       * Caller-supplied relationship IDs
       * are never trusted.
       */
      relationshipId:
        verifiedRelationship
          ? verifiedRelationship.id
          : null,

      jurisdiction:
        typeof jurisdiction ===
        "string"
          ? jurisdiction
          : null,

      evidenceReference:
        typeof evidenceReference ===
        "string"
          ? evidenceReference
          : null,

      status:
        "pending",

      verificationStatus:
        verifiedRelationship
          ? "verified"
          : "required",

      requestedAt:
        new Date().toISOString(),

      approvedAt: null,

      approvedBy: null,

      revokedAt: null,

      revokedBy: null,

      revokeReason: null,

      permissions: []
    };

    state.links.push(
      link
    );

    audit(
      state,
      "LINK_REQUESTED",
      {
        linkId: link.id,
        linkType,

        relationshipVerified:
          Boolean(
            verifiedRelationship
          ),

        suppliedRelationshipIdIgnored:
          Boolean(
            relationshipId &&
            relationshipId !==
              link.relationshipId
          )
      }
    );

    saveState(state);

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkRequested",
        {
          detail: {
            linkId: link.id,
            linkType,
            verificationStatus:
              link.verificationStatus
          }
        }
      )
    );

    return link;
  }

  /*
   * =======================================================
   * APPROVE LINK
   * =======================================================
   */

  function approveLink({
    linkId,
    approver,
    permissions = []
  }) {
    requireUser(
      approver,
      "Approver authorization failed."
    );

    if (
      typeof linkId !==
        "string" ||
      !linkId.trim()
    ) {
      throw new Error(
        "Valid link ID required."
      );
    }

    const state =
      loadState();

    const link =
      state.links.find(
        item =>
          item &&
          item.id === linkId
      );

    if (!link) {
      throw new Error(
        "Education link not found."
      );
    }

    if (
      link.status !==
      "pending"
    ) {
      throw new Error(
        "Only pending links can be approved."
      );
    }

    const rule =
      getRule(link.linkType);

    /*
     * CRITICAL SECURITY GATE:
     *
     * Only the target participant may approve.
     */

    if (
      approver.id !==
        link.targetId ||
      approver.role !==
        link.targetRole
    ) {
      throw new Error(
        "Approval authority denied: only the target participant may approve this link."
      );
    }

    const verifiedRelationship =
      findVerifiedRelationship({
        requester: {
          id: link.requesterId,
          role: link.requesterRole,
          authorized: true
        },
        target: approver,
        relationshipType:
          link.linkType
      });

    if (!verifiedRelationship) {
      throw new Error(
        "Verified education relationship required."
      );
    }

    const requestedPermissions =
      Array.isArray(permissions)
        ? permissions
        : [];

    const approvedPermissions =
      [
        ...new Set(
          requestedPermissions.filter(
            permission =>
              typeof permission ===
                "string" &&
              rule.permissions.includes(
                permission
              )
          )
        )
      ];

    if (
      approvedPermissions.length ===
      0
    ) {
      throw new Error(
        "At least one valid permission is required for approval."
      );
    }

    link.permissions =
      approvedPermissions;

    link.status =
      "active";

    link.verificationStatus =
      "verified";

    link.relationshipId =
      verifiedRelationship.id;

    link.approvedAt =
      new Date().toISOString();

    link.approvedBy = {
      id: approver.id,
      role: approver.role
    };

    link.revokedAt = null;
    link.revokedBy = null;
    link.revokeReason = null;

    audit(
      state,
      "LINK_APPROVED",
      {
        linkId: link.id,
        linkType:
          link.linkType,
        approvedBy:
          approver.id,
        permissions:
          [...approvedPermissions],
        relationshipId:
          verifiedRelationship.id
      }
    );

    saveState(state);

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkApproved",
        {
          detail: {
            linkId: link.id,
            linkType:
              link.linkType,
            permissions:
              [...approvedPermissions]
          }
        }
      )
    );

    return link;
  }

  /*
   * =======================================================
   * ACCESS AUTHORIZATION
   * =======================================================
   */

  function
