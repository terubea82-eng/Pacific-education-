/*
 * =========================================================
 * PACIFIC EDUCATION
 * SECURE LINK & AUTHORIZATION LAYER
 * =========================================================
 *
 * Integrated with:
 * PacificEducationVerifiedEducationRelationship
 *
 * Security sequence:
 *
 * Identity
 *   ↓
 * Role
 *   ↓
 * Verified Education Relationship
 *   ↓
 * Jurisdiction / Authority
 *   ↓
 * Link Authorization
 *   ↓
 * Permission
 *   ↓
 * Access / Communication
 *
 * Student • Teacher • Parent • Ministry
 *
 * Prototype only.
 * Production authorization MUST be enforced server-side.
 * =========================================================
 */

(() => {

  "use strict";

  const VERSION = "1.1.0";

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

      return JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
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


  function audit(
    state,
    action,
    details = {}
  ) {

    state.audit.push({

      id:
        crypto.randomUUID(),

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

    if (!layer) {

      return null;

    }

    if (
      typeof layer.getUserRelationships !==
      "function"
    ) {

      return null;

    }

    const requesterRelationships =
      layer.getUserRelationships(
        requesterId
      );

    const targetRelationships =
      layer.getUserRelationships(
        targetId
      );

    const allRelationships = [

      ...requesterRelationships,

      ...targetRelationships

    ];


    const relationship =
      allRelationships.find(
        item =>

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
            ) ||

            (
              item.requesterId ===
                targetId &&

              item.targetId ===
                requesterId
            )
          )

      );


    return relationship || null;

  }


  function requireVerifiedRelationship(
    link
  ) {

    const layer =
      getRelationshipLayer();


    /*
     * Fail closed.
     *
     * If the verification layer is missing,
     * an education link must NOT become active.
     */

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
     * A request may be created before
     * verification is complete.
     *
     * However, it can NEVER become active
     * until a verified relationship exists.
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
      state.links.find(

        link =>

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
        crypto.randomUUID(),

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

      relationshipId:
        relationshipId ||
        (
          verifiedRelationship
            ? verifiedRelationship.id
            : null
        ),

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


    if (
      !rule.roles.includes(
        approver.role
      )
    ) {

      throw new Error(
        "Approver role is not permitted."
      );

    }


    /*
     * ===================================================
     * CRITICAL SECURITY GATE
     * ===================================================
     *
     * The link cannot become active unless the
     * underlying education relationship is verified.
     */

    const verifiedRelationship =
      requireVerifiedRelationship(
        link
      );


    link.relationshipId =
      verifiedRelationship.id;

    link.verificationStatus =
      "verified";


    const approvedPermissions =
      permissions.filter(
        permission =>
          rule.permissions.includes(
            permission
          )
      );


    if (
      !approvedPermissions.length
    ) {

      throw new Error(
        "At least one authorized permission is required."
      );

    }


    link.status =
      "active";

    link.permissions =
      approvedPermissions;

    link.approvedAt =
      new Date().toISOString();

    link.approvedBy =
      approver.id;


    audit(
      state,
      "LINK_APPROVED",
      {

        linkId,

        permissions:
          approvedPermissions,

        relationshipId:
          verifiedRelationship.id,

        relationshipVerified:
          true

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

            linkId,

            permissions:
              approvedPermissions,

            relationshipId:
              verifiedRelationship.id

          }

        }
      )

    );


    return link;

  }


  /* =====================================================
     AUTHORIZE ACCESS
     ===================================================== */

  function authorizeAccess({

    linkId,

    requester,

    requiredPermission

  }) {

    if (!validUser(requester)) {

      return {

        allowed:
          false,

        reason:
          "requester_not_authorized"

      };

    }


    const state =
      loadState();


    const link =
      state.links.find(

        item =>

          item.id ===
            linkId &&

          item.status ===
            "active"

      );


    if (!link) {

      return {

        allowed:
          false,

        reason:
          "active_link_not_found"

      };

    }


    if (

      link.requesterId !==
        requester.id &&

      link.targetId !==
        requester.id

    ) {

      return {

        allowed:
          false,

        reason:
          "requester_not_participant"

      };

    }


    /*
     * Re-check the verified relationship
     * at access time.
     *
     * Revoking the relationship therefore
     * prevents continued access.
     */

    const verifiedRelationship =
      findVerifiedRelationship({

        requesterId:
          link.requesterId,

        targetId:
          link.targetId,

        relationshipType:
          link.linkType

      });


    if (!verifiedRelationship) {

      return {

        allowed:
          false,

        reason:
          "verified_relationship_revoked"

      };

    }


    if (
      !link.permissions.includes(
        requiredPermission
      )
    ) {

      return {

        allowed:
          false,

        reason:
          "permission_not_granted"

      };

    }


    return {

      allowed:
        true,

      linkId,

      permission:
        requiredPermission,

      relationshipId:
        verifiedRelationship.id

    };

  }


  /* =====================================================
     REVOKE LINK
     ===================================================== */

  function revokeLink({

    linkId,

    revoker,

    reason =
      "authorization_revoked"

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
          item.id ===
          linkId
      );


    if (!link) {

      throw new Error(
        "Education link not found."
      );

    }


    if (

      link.requesterId !==
        revoker.id &&

      link.targetId !==
        revoker.id &&

      revoker.role !==
        "ministry"

    ) {

      throw new Error(
        "Revocation authority denied."
      );

    }


    link.status =
      "revoked";

    link.permissions =
      [];

    link.revokedAt =
      new Date().toISOString();

    link.revokedBy =
      revoker.id;

    link.revokeReason =
      reason;


    audit(
      state,
      "LINK_REVOKED",
      {

        linkId,

        reason

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

            linkId,

            reason

          }

        }
      )

    );


    return link;

  }


  /* =====================================================
     GET USER LINKS
     ===================================================== */

  function getUserLinks(
    userId
  ) {

    if (

      typeof userId !==
        "string" ||

      !userId.trim()

    ) {

      throw new Error(
        "Valid user ID required."
      );

    }


    const state =
      loadState();


    return state.links.filter(

      link =>

        link.requesterId ===
          userId ||

        link.targetId ===
          userId

    );

  }


  /* =====================================================
     STATUS
     ===================================================== */

  function getStatus() {

    const state =
      loadState();


    return Object.freeze({

      version:
        VERSION,

      totalLinks:
        state.links.length,

      activeLinks:
        state.links.filter(
          link =>
            link.status ===
            "active"
        ).length,

      pendingLinks:
        state.links.filter(
          link =>
            link.status ===
            "pending"
        ).length,

      revokedLinks:
        state.links.filter(
          link =>
            link.status ===
            "revoked"
        ).length,

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

    });

  }


  /* =====================================================
     RESET PROTOTYPE STATE
     ===================================================== */

  function resetPrototypeState() {

    localStorage.removeItem(
      STORAGE_KEY
    );

  }


  /* =====================================================
     PUBLIC API
     ===================================================== */

  window.PacificEducationSecureLinkAuthorization =

    Object.freeze({

      version:
        VERSION,

      linkRules:
        LINK_RULES,

      requestLink,

      approveLink,

      authorizeAccess,

      revokeLink,

      getUserLinks,

      getStatus,

      resetPrototypeState

    });

})();
