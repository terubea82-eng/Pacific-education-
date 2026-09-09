/*
 * PACIFIC EDUCATION
 * SECURE COMMUNICATION SECURITY TEST
 * VERSION 1.1.0
 *
 * Prototype security validation only.
 *
 * Security sequence tested:
 *
 * Identity
 * → Role
 * → Verified Relationship
 * → Approved Link
 * → Communication Permission
 * → Conversation
 * → Message
 * → Relationship Revocation
 * → Access Denied
 *
 * IMPORTANT:
 * This is a development/owner test harness.
 *
 * Do NOT use real:
 * - passwords
 * - API keys
 * - authentication tokens
 * - payment secrets
 * - private student information
 * - confidential family information
 *
 * Production authorization MUST be enforced
 * server-side.
 */

(() => {

  "use strict";

  const VERSION = "1.1.0";

  const RESULTS = [];

  /*
   * Synthetic test identities only.
   */
  const parent = {
    id: "TEST-PARENT-001",
    role: "parent",
    authorized: true
  };

  const teacher = {
    id: "TEST-TEACHER-001",
    role: "teacher",
    authorized: true
  };

  const unauthorizedParent = {
    id: "TEST-UNAUTHORIZED-001",
    role: "parent",
    authorized: false
  };

  let relationshipId = null;
  let linkId = null;
  let conversationId = null;


  /* =====================================================
     RESULT HANDLING
     ===================================================== */

  function record(
    name,
    passed,
    details = ""
  ) {

    RESULTS.push({

      name,

      passed:
        passed === true,

      details,

      timestamp:
        new Date().toISOString()

    });

  }


  function expectSuccess(
    name,
    callback
  ) {

    try {

      const result =
        callback();

      record(
        name,
        true,
        "Operation succeeded as expected."
      );

      return result;

    } catch (error) {

      record(
        name,
        false,
        error?.message ||
          String(error)
      );

      return null;

    }

  }


  function expectDenied(
    name,
    callback
  ) {

    try {

      callback();

      record(
        name,
        false,
        "SECURITY FAILURE: operation was allowed."
      );

      return false;

    } catch (error) {

      record(
        name,
        true,
        "Operation correctly denied: " +
          (
            error?.message ||
            String(error)
          )
      );

      return true;

    }

  }


  /* =====================================================
     MODULE ACCESS
     ===================================================== */

  function getModules() {

    return {

      relationship:
        window
          .PacificEducationVerifiedEducationRelationship,

      authorization:
        window
          .PacificEducationSecureLinkAuthorization,

      communication:
        window
          .PacificEducationSecureCommunication

    };

  }


  function assertModules() {

    const modules =
      getModules();

    const required = [

      "relationship",

      "authorization",

      "communication"

    ];

    required.forEach(
      name => {

        if (!modules[name]) {

          throw new Error(
            name +
              " module is not loaded."
          );

        }

      }
    );

    return modules;

  }


  /* =====================================================
     RESET
     ===================================================== */

  function resetTestState(
    modules
  ) {

    /*
     * Clear only the prototype security
     * state used by this test.
     *
     * No application production data should
     * be placed into this test harness.
     */

    if (
      modules.relationship &&
      typeof modules.relationship
        .resetPrototypeState ===
        "function"
    ) {

      modules.relationship
        .resetPrototypeState();

    }

    /*
     * Authorization module does not expose
     * a reset function in the current API.
     *
     * Therefore remove only its documented
     * prototype storage key.
     */

    try {

      localStorage.removeItem(
        "pacificEducationSecureLinks"
      );

    } catch {

      /*
       * Ignore localStorage cleanup errors.
       */

    }

    /*
     * Communication module uses its own
     * documented prototype storage key.
     */

    try {

      localStorage.removeItem(
        "pacificEducationSecureMessages"
      );

    } catch {

      /*
       * Ignore localStorage cleanup errors.
       */

    }

  }


  /* =====================================================
     1. IDENTITY TESTS
     ===================================================== */

  function testIdentities() {

    record(

      "Parent identity is valid",

      parent.id ===
        "TEST-PARENT-001" &&

      parent.role ===
        "parent" &&

      parent.authorized ===
        true

    );


    record(

      "Teacher identity is valid",

      teacher.id ===
        "TEST-TEACHER-001" &&

      teacher.role ===
        "teacher" &&

      teacher.authorized ===
        true

    );


    record(

      "Unauthorized identity is invalid",

      unauthorizedParent.authorized ===
        false

    );

  }


  /* =====================================================
     2. VERIFIED RELATIONSHIP
     ===================================================== */

  function createVerifiedRelationship(
    modules
  ) {

    const relationship =
      expectSuccess(

        "Create verified parent-teacher relationship",

        () =>

          modules.relationship
            .verifyRelationship({

              requester:
                parent,

              target:
                teacher,

              relationshipType:
                "parent_teacher",

              jurisdiction:
                "Fiji",

              evidence: {

                type:
                  "authorized_school_record",

                verified:
                  true,

                reference:
                  "SYNTHETIC-TEST-REFERENCE"

              },

              authority: {

                type:
                  "synthetic_test_authority",

                consent:
                  true

              }

            })

      );


    if (relationship) {

      relationshipId =
        relationship.id;

    }


    record(

      "Verified relationship ID created",

      typeof relationshipId ===
        "string" &&
      relationshipId.length > 0,

      relationshipId
        ? "Synthetic relationship created."
        : "Relationship ID was not returned."

    );


    return relationship;

  }


  /* =====================================================
     3. LINK REQUEST
     ===================================================== */

  function createSecureLink(
    modules
  ) {

    const link =
      expectSuccess(

        "Request parent-teacher secure link",

        () =>

          modules.authorization
            .requestLink({

              requester:
                parent,

              target:
                teacher,

              linkType:
                "parent_teacher",

              relationshipId:
                relationshipId,

              jurisdiction:
                "Fiji",

              evidenceReference:
                "SYNTHETIC-TEST-REFERENCE"

            })

      );


    if (link) {

      linkId =
        link.id;

    }


    record(

      "Secure link ID created",

      typeof linkId ===
        "string" &&
      linkId.length > 0,

      linkId
        ? "Synthetic secure link created."
        : "Secure link ID was not returned."

    );


    return link;

  }


  /* =====================================================
     4. APPROVE LINK
     ===================================================== */

  function approveSecureLink(
    modules
  ) {

    if (!linkId) {

      record(

        "Approve secure education link",

        false,

        "No link ID available."

      );

      return null;

    }


    const approvedLink =
      expectSuccess(

        "Approve secure education link",

        () =>

          modules.authorization
            .approveLink({

              linkId:
                linkId,

              approver:
                teacher,

              permissions:
                [
                  "communication"
                ]

            })

      );


    record(

      "Approved link is active",

      approvedLink?.status ===
        "active",

      approvedLink
        ? "Link status: " +
          approvedLink.status
        : "No approved link returned."

    );


    record(

      "Communication permission granted",

      approvedLink?.permissions
        ?.includes(
          "communication"
        ) === true,

      approvedLink?.permissions
        ? approvedLink.permissions.join(
            ", "
          )
        : "No permissions returned."

    );


    return approvedLink;

  }


  /* =====================================================
     5. AUTHORIZATION
     ===================================================== */

  function authorizeCommunication(
    modules
  ) {

    if (!linkId) {

      record(

        "Authorize communication",

        false,

        "No link ID available."

      );

      return null;

    }


    const access =
      expectSuccess(

        "Authorize communication permission",

        () =>

          modules.authorization
            .authorizeAccess({

              linkId:

                linkId,

              requester:

                parent,

              requiredPermission:

                "communication"

            })

      );


    record(

      "Communication authorization allowed",

      access?.allowed ===
        true,

      access
        ? "Authorization result: allowed."
        : "No authorization result returned."

    );


    return access;

  }


  /* =====================================================
     6. CREATE CONVERSATION
     ===================================================== */

  function createConversation(
    modules
  ) {

    if (!linkId) {

      record(

        "Create authorized conversation",

        false,

        "No link ID available."

      );

      return null;

    }


    const conversation =
      expectSuccess(

        "Create authorized conversation",

        () =>

          modules.communication
            .createConversation(

              parent,

              teacher,

              {
                linkId:
                  linkId
              }

            )

      );


    if (conversation) {

      conversationId =
        conversation.id;

    }


    record(

      "Conversation ID created",

      typeof conversationId ===
        "string" &&
      conversationId.length > 0,

      conversationId
        ? "Synthetic conversation created."
        : "Conversation ID was not returned."

    );


    return conversation;

  }


  /* =====================================================
     7. SEND MESSAGE
     ===================================================== */

  function sendAuthorizedMessage(
    modules
  ) {

    if (
      !conversationId ||
      !linkId
    ) {

      record(

        "Send authorized message",

        false,

        "Conversation or link ID unavailable."

      );

      return null;

    }


    return expectSuccess(

      "Send authorized message",

      () =>

        modules.communication
          .sendMessage({

            conversationId:

              conversationId,

            sender:

              parent,

            recipient:

              teacher,

            text:

              "Pacific Education security test message.",

            linkId:

              linkId

          })

    );

  }


  /* =====================================================
     8. READ CONVERSATION
     ===================================================== */

  function readAuthorizedConversation(
    modules
  ) {

    if (!conversationId) {

      record(

        "Read authorized conversation",

        false,

        "Conversation ID unavailable."

      );

      return null;

    }


    return expectSuccess(

      "Read authorized conversation",

      () =>

        modules.communication
          .getConversation(

            conversationId,

            parent

          )

    );

  }


  /* =====================================================
     9. VERIFY CONVERSATION IS ACTIVE
     ===================================================== */

  function verifyConversationActive(
    modules
  ) {

    if (!conversationId) {

      record(

        "Conversation remains active before revocation",

        false,

        "Conversation ID unavailable."

      );

      return;

    }


    const conversation =
      expectSuccess(

        "Verify conversation remains active before revocation",

        () =>

          modules.communication
            .getConversation(

              conversationId,

              parent

            )

      );


    record(

      "Conversation status is active before revocation",

      conversation?.status ===
        "active",

      conversation
        ? "Conversation status: " +
          conversation.status
        : "No conversation returned."

    );

  }


  /* =====================================================
     10. REVOKE RELATIONSHIP
     ===================================================== */

  function revokeRelationship(
    modules
  ) {

    if (!relationshipId) {

      record(

        "Revoke verified education relationship",

        false,

        "Relationship ID unavailable."

      );

      return null;

    }


    return expectSuccess(

      "Revoke verified education relationship",

      () =>

        modules.relationship
          .revokeRelationship({

            relationshipId:

              relationshipId,

            revoker:

              parent,

            reason:

              "security_test_revocation"

          })

    );

  }


  /* =====================================================
     11. VERIFY AUTHORIZATION IS DENIED
     ===================================================== */

  function verifyAuthorizationDenied(
    modules
  ) {

    if (!linkId) {

      record(

        "Authorization denied after relationship revocation",

        false,

        "Link ID unavailable."

      );

      return null;

    }


    const access =
      expectSuccess(

        "Check authorization after relationship revocation",

        () =>

          modules.authorization
            .authorizeAccess({

              linkId:

                linkId,

              requester:

                parent,

              requiredPermission:

                "communication"

            })

      );


    record(

      "Authorization denied after relationship revocation",

      access?.allowed ===
        false,

      access
        ? "Authorization result: " +
          access.reason
        : "No authorization result returned."

    );


    record(

      "Revocation reason is verified_relationship_revoked",

      access?.reason ===
        "verified_relationship_revoked",

      access
        ? "Reason: " +
          access.reason
        : "No reason returned."

    );


    return access;

  }


  /* =====================================================
     12. DENY CONVERSATION ACCESS
     ===================================================== */

  function denyConversationAfterRevocation(
    modules
  ) {

    if (!conversationId) {

      record(

        "Deny conversation access after relationship revocation",

        false,

        "Conversation ID unavailable."

      );

      return;

    }


    expectDenied(

      "Deny conversation access after relationship revocation",

      () =>

        modules.communication
          .getConversation(

            conversationId,

            parent

          )

    );

  }


  /* =====================================================
     13. DENY MESSAGE AFTER REVOCATION
     ===================================================== */

  function denyMessageAfterRevocation(
    modules
  ) {

    if (
      !conversationId ||
      !linkId
    ) {

      record(

        "Deny message after relationship revocation",

        false,

        "Conversation or link ID unavailable."

      );

      return;

    }


    expectDenied(

      "Deny message after relationship revocation",

      () =>

        modules.communication
          .sendMessage({

            conversationId:

              conversationId,

            sender:

              parent,

            recipient:

              teacher,

            text:

              "This message MUST be rejected after relationship revocation.",

            linkId:

              linkId

          })

    );

  }


  /* =====================================================
     14. DENY CLOSE AFTER REVOCATION
     ===================================================== */

  function denyCloseAfterRevocation(
    modules
  ) {

    if (!conversationId) {

      record(

        "Deny conversation closure after relationship revocation",

        false,

        "Conversation ID unavailable."

      );

      return;

    }


    expectDenied(

      "Deny conversation closure after relationship revocation",

      () =>

        modules.communication
          .closeConversation(

            conversationId,

            parent

          )

    );

  }


  /* =====================================================
     15. DENY UNAUTHORIZED USER
     ===================================================== */

  function denyUnauthorizedUser(
    modules
  ) {

    if (!conversationId) {

      record(

        "Deny unauthorized user conversation access",

        false,

        "Conversation ID unavailable."

      );

      return;

    }


    expectDenied(

      "Deny unauthorized user conversation access",

      () =>

        modules.communication
          .getConversation(

            conversationId,

            unauthorizedParent

          )

    );

  }


  /* =====================================================
     16. SECURITY STATUS
     ===================================================== */

  function testSecurityStatus(
    modules
  ) {

    if (
      typeof modules.communication
        .getStatus !==
      "function"
    ) {

      record(

        "Read Secure Communication security status",

        false,

        "getStatus() is unavailable."

      );

      return;

    }


    const status =
      expectSuccess(

        "Read Secure Communication security status",

        () =>

          modules.communication
            .getStatus()

      );


    if (!status) {

      return;

    }


    record(

      "Verified relationship required",

      status
        .verifiedRelationshipRequired ===
        true

    );


    record(

      "Active approved link required",

      status
        .activeApprovedLinkRequired ===
        true

    );


    record(

      "Communication permission required",

      status
        .communicationPermissionRequired ===
        true

    );


    record(

      "Automatic information access disabled",

      status
        .automaticInformationAccess ===
        false

    );


    record(

      "Production backend requirement declared",

      status
        .backendRequiredForProduction ===
        true

    );

  }


  /* =====================================================
     REPORT
     ===================================================== */

  function getReport() {

    const passed =
      RESULTS.filter(
        result =>
          result.passed
      ).length;


    const failed =
      RESULTS.filter(
        result =>
          !result.passed
      ).length;


    return Object.freeze({

      version:

        VERSION,

      total:

        RESULTS.length,

      passed,

      failed,

      allPassed:

        failed === 0,

      results:

        RESULTS.slice()

    });

  }


  function printReport(
    report
  ) {

    console.group(
      "Pacific Education Secure Communication Security Test"
    );


    console.log(
      "Version:",
      report.version
    );


    console.log(
      "Total:",
      report.total
    );


    console.log(
      "Passed:",
      report.passed
    );


    console.log(
      "Failed:",
      report.failed
    );


    console.log(
      "ALL TESTS PASSED:",
      report.allPassed
    );


    report.results.forEach(

      result => {

        console.log(

          result.passed
            ? "PASS"
            : "FAIL",

          "-",

          result.name,

          result.details
            ? "(" +
              result.details +
              ")"
            : ""

        );

      }

    );


    console.groupEnd();


    return report;

  }


  /* =====================================================
     MAIN TEST
     ===================================================== */

  function runSecurityTest() {

    RESULTS.length = 0;

    relationshipId = null;
    linkId = null;
    conversationId = null;


    let modules;


    /*
     * -----------------------------------------------------
     * MODULE AVAILABILITY
     * -----------------------------------------------------
     */

    try {

      modules =
        assertModules();

    } catch (error) {

      record(

        "Required security modules loaded",

        false,

        error?.message ||
          String(error)

      );

      return getReport();

    }


    record(

      "Required security modules loaded",

      true,

      "Relationship, Authorization and Communication modules are available."

    );


    /*
     * -----------------------------------------------------
     * CLEAN TEST STATE
     * -----------------------------------------------------
     */

    resetTestState(
      modules
    );


    /*
     * -----------------------------------------------------
     * IDENTITY
     * -----------------------------------------------------
     */

    testIdentities();


    /*
     * -----------------------------------------------------
     * VERIFIED RELATIONSHIP
     * -----------------------------------------------------
     */

    const relationship =
      createVerifiedRelationship(
        modules
      );


    if (!relationship) {

      return getReport();

    }


    /*
     * -----------------------------------------------------
     * SECURE LINK
     * -----------------------------------------------------
     */

    const link =
      createSecureLink(
        modules
      );


    if (!link) {

      return getReport();

    }


    /*
     * -----------------------------------------------------
     * APPROVAL
     * -----------------------------------------------------
     */

    const approvedLink =
      approveSecureLink(
        modules
      );


    if (!approvedLink) {

      return getReport();

    }


    /*
     * -----------------------------------------------------
     * COMMUNICATION AUTHORIZATION
     * -----------------------------------------------------
     */

    const access =
      authorizeCommunication(
        modules
      );


    if (!access) {

      return getReport();

    }


    /*
     * -----------------------------------------------------
     * CONVERSATION
     * -----------------------------------------------------
     */

    const conversation =
      createConversation(
        modules
      );


    if (!conversation) {

      return getReport();

    }


    verifyConversationActive(
      modules
    );


    /*
     * -----------------------------------------------------
     * MESSAGE
     * -----------------------------------------------------
     */

    sendAuthorizedMessage(
      modules
    );


    /*
     * -----------------------------------------------------
     * READ
     * -----------------------------------------------------
     */

    readAuthorizedConversation(
      modules
    );


    /*
     * -----------------------------------------------------
     * CRITICAL SECURITY EVENT
     *
     * Revoke relationship while conversation
     * is still ACTIVE.
     * -----------------------------------------------------
     */

    revokeRelationship(
      modules
    );


    /*
     * -----------------------------------------------------
     * AUTHORIZATION MUST NOW FAIL
     * -----------------------------------------------------
     */

    verifyAuthorizationDenied(
      modules
    );


    /*
     * -----------------------------------------------------
     * COMMUNICATION MUST NOW FAIL
     * -----------------------------------------------------
     */

    denyConversationAfterRevocation(
      modules
    );


    denyMessageAfterRevocation(
      modules
    );


    denyCloseAfterRevocation(
      modules
    );


    /*
     * -----------------------------------------------------
     * UNAUTHORIZED USER MUST FAIL
     * -----------------------------------------------------
     */

    denyUnauthorizedUser(
      modules
    );


    /*
     * -----------------------------------------------------
     * SECURITY STATUS
     * -----------------------------------------------------
     */

    testSecurityStatus(
      modules
    );


    return getReport();

  }


  /* =====================================================
     PUBLIC TEST API
     * ===================================================== */

  window.PacificEducationSecureCommunicationTest =

    Object.freeze({

      version:
        VERSION,

      run:
        () =>
          printReport(
            runSecurityTest()
          ),

      getReport

    });


})();
