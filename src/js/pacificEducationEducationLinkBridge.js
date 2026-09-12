function checkAccess(request) {
  if (!request || typeof request !== "object") {
    return {
      allowed: false,
      reason: "Valid access request is required."
    };
  }

  /*
   * =====================================================
   * SECURITY CHAIN
   *
   * Education Link Center
   *        ↓
   * Verified Relationship
   *        ↓
   * Education Link Bridge
   *        ↓
   * Secure Link Authorization
   *
   * The Bridge must not allow the caller to
   * substitute another permission.
   * =====================================================
   */

  const relationship = getRelationshipLayer();

  if (
    !relationship ||
    typeof relationship.getUserRelationships !==
      "function" ||
    typeof relationship.checkRelationship !==
      "function"
  ) {
    return {
      allowed: false,
      reason:
        "Verified Education Relationship module is unavailable or incomplete."
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
      reason:
        "Secure Link Authorization module is unavailable."
    };
  }

  if (
    typeof request.linkId !== "string" ||
    !request.linkId.trim()
  ) {
    return {
      allowed: false,
      reason: "Valid link ID is required."
    };
  }

  if (!validUser(request.user)) {
    return {
      allowed: false,
      reason: "Authorized user is required."
    };
  }

  /*
   * Communication is the only permission allowed
   * through this Bridge access path.
   */
  return authorization.authorizeAccess({
    linkId: request.linkId,
    user: request.user,
    permission: REQUIRED_PERMISSION
  });
}
