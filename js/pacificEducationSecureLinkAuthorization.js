  /*
   * AUTHORIZE ACCESS
   *
   * Every access decision re-checks the current verified
   * relationship. An old "authorized" link alone is never
   * sufficient for access.
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

    /*
     * SECURITY REQUIREMENT:
     * Re-check the CURRENT verified relationship before
     * granting any permission.
     */
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
      audit(state, "ACCESS_DENIED_RELATIONSHIP", {
        linkId: link.id,
        userId: user.id,
        permission: request.permission
      });

      saveState(state);

      return {
        allowed: false,
        reason: "verified_relationship_required"
      };
    }

        /*
     * SECURITY REQUIREMENT:
     * The canonical LINK_RULES permission table is the
     * authoritative permission boundary.
     *
     * Stored link.permissions may exist in client-side
     * prototype state and must never be trusted by itself.
     */
    const canonicalRule = LINK_RULES[link.linkType];

    if (
      !canonicalRule ||
      !Array.isArray(canonicalRule.permissions) ||
      !canonicalRule.permissions.includes(request.permission)
    ) {
      audit(state, "ACCESS_DENIED_CANONICAL_PERMISSION", {
        linkId: link.id,
        userId: user.id,
        linkType: link.linkType,
        permission: request.permission
      });

      saveState(state);

      return {
        allowed: false,
        reason: "canonical_permission_denied"
      };
    }

    /*
     * The stored permission must also contain the
     * canonically approved permission.
     */
    
    /*
     * SECURITY REQUIREMENT:
     * The canonical LINK_RULES permission table is the
     * authoritative permission boundary.
     *
     * Stored link.permissions may exist in client-side
     * prototype state and must never be trusted by itself.
     */
    const canonicalRule = LINK_RULES[link.linkType];

    if (
      !canonicalRule ||
      !Array.isArray(canonicalRule.permissions) ||
      !canonicalRule.permissions.includes(request.permission)
    ) {
      audit(state, "ACCESS_DENIED_CANONICAL_PERMISSION", {
        linkId: link.id,
        userId: user.id,
        linkType: link.linkType,
        permission: request.permission
      });

      saveState(state);

      return {
        allowed: false,
        reason: "canonical_permission_denied"
      };
    }

    /*
     * The stored permission must also contain the
     * canonically approved permission.
     */
    if (!hasPermission(link, request.permission)) {
      audit(state, "ACCESS_DENIED_STORED_PERMISSION", {
        linkId: link.id,
        userId: user.id,
        linkType: link.linkType,
        permission: request.permission
      });

      saveState(state);

      return {
        allowed: false,
        reason: "permission_denied"
      };
    }
      saveState(state);

      return {
        allowed: false,
        reason: "permission_denied"
      };
    }

    audit(state, "ACCESS_AUTHORIZED", {
      linkId: link.id,
      userId: user.id,
      permission: request.permission,
      relationshipRechecked: true
    });

    saveState(state);

    return {
      allowed: true,
      linkId: link.id,
      permission: request.permission,
      relationshipRechecked: true
    };
  }
