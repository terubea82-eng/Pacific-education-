function checkAccess(request) {
  if (!request || typeof request !== "object") {
    return {
      allowed: false,
      reason: "Valid access request required."
    };
  }

  /*
   * =====================================================
   * SECURITY CHAIN
   *
   * Center
   *   ↓
   * Verified Relationship
   *   ↓
   * Education Link Bridge
   *   ↓
   * Secure Link Authorization
   *
   * The Center must not bypass the Bridge.
   * =====================================================
   */

  try {
    requireRelationshipLayer();
  } catch (error) {
    return {
      allowed: false,
      reason:
        error && error.message
          ? error.message
          : "Relationship verification unavailable."
    };
  }

  const bridge = getBridge();

  if (!bridge) {
    return {
      allowed: false,
      reason: "Education Link Bridge unavailable."
    };
  }

  const requiredBridgeMethods = [
    "checkAccess"
  ];

  for (const method of requiredBridgeMethods) {
    if (typeof bridge[method] !== "function") {
      return {
        allowed: false,
        reason:
          `Education Link Bridge API is missing: ${method}.`
      };
    }
  }

  /*
   * Pass the request through the Bridge.
   *
   * The Bridge remains responsible for the
   * authorization boundary.
   */
  try {
    return bridge.checkAccess(request);
  } catch (error) {
    return {
      allowed: false,
      reason:
        error && error.message
          ? error.message
          : "Education Link Bridge denied access."
    };
  }
}
