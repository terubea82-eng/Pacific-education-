/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 * =========================================================
 * Version 1.2.1
 *
 * Security sequence:
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
 * Prototype only.
 * Production authorization MUST be enforced server-side.
 * =========================================================
 */

(() => {
  "use strict";

  const VERSION = "1.2.1";

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


  /* =====================================================
     STATE
     ===================================================== */

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

      return parsed;
    } catch (_) {
      return emptyState();
    }
  }


  function saveState(state) {
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
      `${Math.random().toString(36).slice(2, 12)}`
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


  /* =====================================================
     USER VALIDATION
     ===================================================== */

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


  /* =====================================================
     LINK RULES
     ===================================================== */

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
    return (
      rule.roles.includes(
        requester.role
      ) &&
      rule.roles.includes(
        target.role
      ) &&
      requester.role !== target.role
    );
  }


  function verifyParticipants(
    requester,
    target
  ) {
    if (!validUser(requester)) {
      throw new Error(
        "Requester verification failed."
      );
    }

    if (!validUser(target)) {
      throw new Error(
        "Target verification failed."
      );
    }

    if (
      requester.id ===
      target.id
    ) {
      throw new Error(
        "Requester and target must be different participants."
      );
    }

    return true;
  }


  /* =====================================================
     VERIFIED RELATIONSHIP INTEGRATION
     ===================================================== */

  function getRelationshipLayer() {
    return (
      window
        .PacificEducationVerifiedEducationRelationship
      || null
    );
  }


  function findVerifiedRelationship({
    requesterId,
    targetId,
    relationshipType
  }) {
    const layer =
      getRelationshipLayer();

    if (
      !layer ||
      typeof layer.getUserRelationships !==
        "function"
    ) {
      return null;
    }

    try {
      const requesterRelationships =
        layer.getUserRelationships(
          requesterId
        );

      const targetRelationships =
        layer.getUserRelationships(
          targetId
        );

      if (
        !Array.isArray(
          requesterRelationships
        ) ||
        !Array.isArray(
          targetRelationships
        )
      ) {
        return null;
      }

      return [
        ...requesterRelationships,
        ...targetRelationships
      ].find(item =>
        item &&
        item.status === "verified" &&
        item.relationshipType ===
          relationshipType &&
        (
          (
            item.requesterId ===
              requesterId &&
            item.targetId ===
              targetId
          ) ||
          (
            item.requesterId ===
              targetId &&
            item.targetId ===
              requesterId
          )
        )
      ) || null;
    } catch (_) {
      return null;
    }
  }


  function requireVerifiedRelationship(
    link
  ) {
    const layer =
      getRelationshipLayer();

    if (!layer) {
      throw new Error(
        "Verified education relationship layer is required."
      );
    }

    const relationship =
      findVerifiedRelationship({
        requesterId:
          link.requesterId,
        targetId:
          link.targetId,
        relationshipType:
          link.linkType
      });

    if (!relationship) {
      throw new Error(
        "Verified education relationship required before link approval."
      );
    }

    return relationship;
  }


  /* =====================================================
     REQUEST LINK
     ===================================================== */

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

    /*
     * A request may exist while verification
     * is still required.
     *
     * It cannot become active until the
     * verified relationship exists.
     */

    const verifiedRelationship =
      findVerifiedRelationship({
        requesterId:
          requester.id,
        targetId:
          target.id,
        relationshipType:
          linkType
      });

    const state =
      loadState();

    const existing =
      state.links.find(link =>
        link &&
        link.requesterId ===
          requester.id &&
        link.targetId ===
          target.id &&
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
      id:
        createId("link"),

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
       * Never trust an arbitrary relationshipId
       * supplied by the caller.
       */
      relationshipId:
        verifiedRelationship
          ? verifiedRelationship.id
          : null,

      jurisdiction,

      evidenceReference,

      status:
        "pending",

      verificationStatus:
        verifiedRelationship
          ? "verified"
          : "required",

      requestedAt:
        new Date().toISOString(),

      approvedAt:
        null,

      approvedBy:
        null,

      revokedAt:
        null,

      revokedBy:
        null,

      revokeReason:
        null,

      permissions:
        []
    };

    state.links.push(
      link
    );

    audit(
      state,
      "LINK_REQUESTED",
      {
        linkId:
          link.id,

        linkType,

        relationshipVerified:
          Boolean(
            verifiedRelationship
          ),

        suppliedRelationshipIdIgnored:
          Boolean(
            relationshipId &&
            !verifiedRelationship
          )
      }
    );

    saveState(
      state
    );

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkRequested",
        {
          detail: {
            linkId:
              link.id,

            linkType,

            verificationStatus:
              link.verificationStatus
          }
        }
      )
    );

    return link;
  }


  /* =====================================================
     APPROVE LINK
     ===================================================== */

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
      getRule(
        link.linkType
      );

    /*
     * ===================================================
     * CRITICAL SECURITY GATE
     * ===================================================
     *
     * Only the target participant may approve
     * the pending link.
     *
     * This prevents the requester from approving
     * their own request.
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

    /*
     * The underlying education relationship
     * must also be verified.
     */

    const verifiedRelationship =
      requireVerifiedRelationship(
        link
      );

    const requestedPermissions =
      Array.isArray(
        permissions
      )
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
      id:
        approver.id,
      role:
        approver.role
    };

    link.revokedAt =
      null;

    link.revokedBy =
      null;

    link.revokeReason =
      null;

    audit(
      state,
      "LINK_APPROVED",
      {
        linkId:
          link.id,

        linkType:
          link.linkType,

        approvedBy:
          approver.id,

        permissions:
          approvedPermissions,

        relationshipId:
          verifiedRelationship.id
      }
    );

    saveState(
      state
    );

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkApproved",
        {
          detail: {
            linkId:
              link.id,

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


  /* =====================================================
     AUTHORIZATION
     ===================================================== */

  function authorizeAccess({
    linkId,
    requester,
    requiredPermission
  }) {
    if (!validUser(requester)) {
      throw new Error(
        "Requester authorization failed."
      );
    }

    if (
      typeof requiredPermission !==
        "string" ||
      !requiredPermission.trim()
    ) {
      throw new Error(
        "Required permission is missing."
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
        "active"
    ) {
      throw new Error(
        "Education link is not active."
      );
    }

    const participantIsRequester =
      requester.id ===
        link.requesterId;

    const participantIsTarget =
      requester.id ===
        link.targetId;

    if (
      !participantIsRequester &&
      !participantIsTarget
    ) {
      throw new Error(
        "Access denied: requester is not a participant in this link."
      );
    }

    const expectedRole =
      participantIsRequester
        ? link.requesterRole
        : link.targetRole;

    if (
      requester.role !==
        expectedRole
    ) {
      throw new Error(
        "Access denied: participant role does not match the authorized link role."
      );
    }

    /*
     * Recheck the underlying verified relationship
     * every time access is requested.
     */

    const verifiedRelationship =
      requireVerifiedRelationship(
        link
      );

    if (
      !link.relationshipId ||
      verifiedRelationship.id !==
        link.relationshipId
    ) {
      throw new Error(
        "Access denied: verified relationship no longer matches the authorized link."
      );
    }

    if (
      !link.permissions.includes(
        requiredPermission
      )
    ) {
      throw new Error(
        "Access denied: required permission is not authorized."
      );
    }

    return {
      authorized:
        true,

      linkId:
        link.id,

      linkType:
        link.linkType,

      permission:
        requiredPermission,

      requesterId:
        requester.id,

      requesterRole:
        requester.role,

      relationshipId:
        verifiedRelationship.id,

      checkedAt:
        new Date().toISOString()
    };
  }


  /* =====================================================
     REVOKE LINK
     ===================================================== */

  function revokeLink({
    linkId,
    revoker,
    reason = ""
  }) {
    if (!validUser(revoker)) {
      throw new Error(
        "Revoker authorization failed."
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
      link.status ===
        "revoked"
    ) {
      return link;
    }

    /*
     * Only an actual participant may revoke.
     *
     * There is intentionally no special Ministry
     * bypass here.
     */

    const isRequester =
      revoker.id ===
        link.requesterId &&
      revoker.role ===
        link.requesterRole;

    const isTarget =
      revoker.id ===
        link.targetId &&
      revoker.role ===
        link.targetRole;

    if (
      !isRequester &&
      !isTarget
    ) {
      throw new Error(
        "Revocation authority denied: only a link participant may revoke this link."
      );
    }

    link.status =
      "revoked";

    link.permissions =
      [];

    link.revokedAt =
      new Date().toISOString();

    link.revokedBy = {
      id:
        revoker.id,
      role:
        revoker.role
    };

    link.revokeReason =
      typeof reason ===
        "string"
        ? reason.trim()
        : "";

    audit(
      state,
      "LINK_REVOKED",
      {
        linkId:
          link.id,

        revokedBy:
          revoker.id,

        revokedByRole:
          revoker.role,

        reason:
          link.revokeReason
      }
    );

    saveState(
      state
    );

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationLinkRevoked",
        {
          detail: {
            linkId:
              link.id,

            revokedBy:
              revoker.id
          }
        }
      )
    );

    return link;
  }


  /* =====================================================
     USER LINKS
     ===================================================== */

  function getUserLinks(user) {
    if (!validUser(user)) {
      throw new Error(
        "User authorization failed."
      );
    }

    const state =
      loadState();

    return state.links.filter(
      link =>
        link &&
        (
          link.requesterId ===
            user.id ||
          link.targetId ===
            user.id
        )
    );
  }


  /* =====================================================
     STATUS
     ===================================================== */

  function getStatus() {
    return {
      version:
        VERSION,

      participantOnlyApproval:
        true,

      participantOnlyRevocation:
        true,

      verifiedRelationshipRequired:
        true,

      relationshipRecheckedAtAccess:
        true,

      automaticInformationAccess:
        false,

      prototypeOnly:
        true,

      backendRequiredForProduction:
        true
    };
  }


  /* =====================================================
     PROTOTYPE RESET
     ===================================================== */

  function resetPrototypeState() {
    localStorage.removeItem(
      STORAGE_KEY
    );

    window.dispatchEvent(
      new CustomEvent(
        "pacificEducationSecureLinkStateReset"
      )
    );

    return true;
  }


  /* =====================================================
     PUBLIC API
     ===================================================== */

  const publicApi =
    Object.freeze({
      VERSION,

      ROLES,

      LINK_RULES,

      requestLink,

      approveLink,

      authorizeAccess,

      revokeLink,

      getUserLinks,

      getStatus,

      resetPrototypeState
    });


  window.PacificEducationSecureLinkAuthorization =
    publicApi;

})();
