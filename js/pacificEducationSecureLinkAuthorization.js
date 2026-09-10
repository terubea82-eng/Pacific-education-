/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 * =========================================================
 * Version 1.2.0
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

  const VERSION = "1.2.0";

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
        localStorage.getItem(
          STORAGE_KEY
        );

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

      id:
        createId("audit"),

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

      typeof user.id ===
        "string" &&

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

      requester.role !==
        target.role

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

        item.status ===
          "verified" &&

        item.relationshipType ===
          relationshipType &&

        (

          (
            item.requesterId ===
              requesterId &&

            item.targetId ===
              targetId
          )

          ||

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
          item.id ===
            linkId
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

             
