function requireModules() {
  const authorization = getAuthorization();
  const communication = getCommunication();
  const relationship = getRelationshipLayer();

  if (
    !authorization ||
    typeof authorization.requestLink !== "function" ||
    typeof authorization.approveLink !== "function" ||
    typeof authorization.authorizeAccess !== "function" ||
    typeof authorization.revokeLink !== "function" ||
    typeof authorization.getUserLinks !== "function"
  ) {
    throw new Error(
      "Secure Link Authorization module is unavailable or incomplete."
    );
  }

  if (
    !communication ||
    typeof communication.createConversation !== "function" ||
    typeof communication.sendMessage !== "function"
  ) {
    throw new Error(
      "Secure Communication module is unavailable or incomplete."
    );
  }

  if (
    !relationship ||
    typeof relationship.getUserRelationships !== "function" ||
    typeof relationship.checkRelationship !== "function"
  ) {
    throw new Error(
      "Verified Education Relationship module is unavailable or incomplete."
    );
  }

  return {
    authorization,
    communication,
    relationship
  };
}
