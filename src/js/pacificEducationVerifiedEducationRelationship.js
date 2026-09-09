/*
 * =========================================================
 * PACIFIC EDUCATION
 * VERIFIED EDUCATION RELATIONSHIP LAYER
 * =========================================================
 *
 * Purpose:
 * Verifies that an education link has a legitimate
 * relationship before access is granted.
 *
 * Relationships:
 *
 * Student  <-> Teacher
 * Parent   <-> Student
 * Parent   <-> Teacher
 * Teacher/School <-> Ministry
 * Parent   <-> Ministry
 * Student  <-> Ministry
 *
 * Security pattern:
 *
 * Identity
 *   ↓
 * Role
 *   ↓
 * Relationship
 *   ↓
 * Jurisdiction
 *   ↓
 * Authority / Consent
 *   ↓
 * Education Link Authorization
 *
 * IMPORTANT:
 * This is a browser prototype.
 * It does NOT establish legal identity by itself.
 *
 * Production verification MUST be performed
 * server-side using authorized education systems,
 * institutional records and applicable law.
 *
 * Never store passwords, API keys, authentication
 * tokens or payment secrets in this module.
 * =========================================================
 */

(() => {

    "use strict";

    const VERSION = "1.0.0";

    const STORAGE_KEY =
        "pacificEducationVerifiedRelationships";

    const ROLES = Object.freeze([
        "student",
        "teacher",
        "parent",
        "ministry"
    ]);

    const RELATIONSHIP_TYPES = Object.freeze({

        student_teacher: {
            roles: ["student", "teacher"],
            requiredEvidence: [
                "school_assignment",
                "class_assignment",
                "authorized_school_record"
            ]
        },

        parent_student: {
            roles: ["parent", "student"],
            requiredEvidence: [
                "parent_guardian_record",
                "authorized_school_record",
                "lawful_guardianship_record"
            ]
        },

        parent_teacher: {
            roles: ["parent", "teacher"],
            requiredEvidence: [
                "linked_student_relationship",
                "authorized_school_record"
            ]
        },

        teacher_ministry: {
            roles: ["teacher", "ministry"],
            requiredEvidence: [
                "school_employment_record",
                "authorized_ministry_record",
                "institutional_authority"
            ]
        },

        parent_ministry: {
            roles: ["parent", "ministry"],
            requiredEvidence: [
                "authorized_application",
                "parent_guardian_record",
                "institutional_authority"
            ]
        },

        student_ministry: {
            roles: ["student", "ministry"],
            requiredEvidence: [
                "authorized_student_service",
                "institutional_authority"
            ]
        }

    });


    /* =====================================================
       STATE
       ===================================================== */

    function emptyState() {

        return {
            relationships: [],
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


    /* =====================================================
       VALIDATION
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


    function getRule(type) {

        const rule =
            RELATIONSHIP_TYPES[type];

        if (!rule) {

            throw new Error(
                "Invalid education relationship type."
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


    /* =====================================================
       EVIDENCE VALIDATION
       ===================================================== */

    function validEvidence(
        relationshipType,
        evidence
    ) {

        const rule =
            getRule(
                relationshipType
            );

        if (
            !evidence ||
            typeof evidence.type !==
                "string"
        ) {

            return false;

        }

        if (
            !rule.requiredEvidence.includes(
                evidence.type
            )
        ) {

            return false;

        }

        /*
         * Prototype evidence must explicitly
         * indicate that it has been verified.
         *
         * Production systems must verify this
         * against authoritative records.
         */

        return (
            evidence.verified === true
        );

    }


    /* =====================================================
       JURISDICTION
       ===================================================== */

    function validJurisdiction(
        jurisdiction
    ) {

        if (
            typeof jurisdiction !==
            "string"
        ) {

            return false;

        }

        return Boolean(
            jurisdiction.trim()
        );

    }


    /* =====================================================
       AUTHORITY / CONSENT
       ===================================================== */

    function validAuthority(
        authority
    ) {

        if (!authority) {

            return false;

        }

        /*
         * At least one lawful authority
         * indicator must be explicitly supplied.
         */

        return Boolean(

            authority.consent === true ||

            authority.institutionalAuthority ===
                true ||

            authority.guardianshipAuthority ===
                true ||

            authority.studentAuthorization ===
                true

        );

    }


    /* =====================================================
       VERIFY RELATIONSHIP
       ===================================================== */

    function verifyRelationship({
        requester,
        target,
        relationshipType,
        jurisdiction,
        evidence,
        authority
    }) {

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

        const rule =
            getRule(
                relationshipType
            );

        if (
            !rolesMatch(
                rule,
                requester,
                target
            )
        ) {

            throw new Error(
                "Roles cannot form this relationship."
            );

        }

        if (
            !validJurisdiction(
                jurisdiction
            )
        ) {

            throw new Error(
                "Jurisdiction verification required."
            );

        }

        if (
            !validEvidence(
                relationshipType,
                evidence
            )
        ) {

            throw new Error(
                "Relationship evidence is not verified."
            );

        }

        if (
            !validAuthority(
                authority
            )
        ) {

            throw new Error(
                "Lawful authority or consent is required."
            );

        }

        const state =
            loadState();

        const existing =
            state.relationships.find(
                item =>

                    item.requesterId ===
                        requester.id &&

                    item.targetId ===
                        target.id &&

                    item.relationshipType ===
                        relationshipType &&

                    item.status ===
                        "verified"
            );

        if (existing) {

            return existing;

        }

        const relationship = {

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

            relationshipType,

            jurisdiction,

            evidenceType:
                evidence.type,

            /*
             * Do not store sensitive
             * evidence contents here.
             *
             * Only a reference/identifier
             * should be used.
             */

            evidenceReference:
                evidence.reference ||
                null,

            authorityType:
                authority.type ||
                null,

            status:
                "verified",

            verifiedAt:
                new Date().toISOString(),

            revokedAt:
                null,

            revokedBy:
                null,

            revokeReason:
                null

        };


        state.relationships.push(
            relationship
        );


        state.audit.push({

            id:
                crypto.randomUUID(),

            action:
                "EDUCATION_RELATIONSHIP_VERIFIED",

            timestamp:
                new Date().toISOString(),

            relationshipId:
                relationship.id,

            relationshipType

        });


        saveState(
            state
        );


        window.dispatchEvent(

            new CustomEvent(
                "pacificEducationRelationshipVerified",
                {
                    detail: {
                        relationshipId:
                            relationship.id,

                        relationshipType,

                        requesterId:
                            requester.id,

                        targetId:
                            target.id
                    }
                }
            )

        );


        return relationship;

    }


    /* =====================================================
       CHECK RELATIONSHIP
       ===================================================== */

    function checkRelationship({
        relationshipId,
        requester,
        target,
        relationshipType
    }) {

        if (!validUser(requester)) {

            return {
                allowed: false,
                reason:
                    "requester_not_authorized"
            };

        }

        if (!validUser(target)) {

            return {
                allowed: false,
                reason:
                    "target_not_authorized"
            };

        }

        const state =
            loadState();

        const relationship =
            state.relationships.find(

                item =>

                    item.id ===
                        relationshipId &&

                    item.status ===
                        "verified" &&

                    item.relationshipType ===
                        relationshipType &&

                    (
                        (
                            item.requesterId ===
                                requester.id &&

                            item.targetId ===
                                target.id
                        ) ||

                        (
                            item.requesterId ===
                                target.id &&

                            item.targetId ===
                                requester.id
                        )
                    )

            );


        if (!relationship) {

            return {

                allowed: false,

                reason:
                    "verified_relationship_not_found"

            };

        }


        return {

            allowed: true,

            relationshipId:
                relationship.id,

            relationshipType:
                relationship.relationshipType

        };

    }


    /* =====================================================
       REVOKE RELATIONSHIP
       ===================================================== */

    function revokeRelationship({
        relationshipId,
        revoker,
        reason =
            "relationship_authorization_revoked"
    }) {

        if (!validUser(revoker)) {

            throw new Error(
                "Revoker authorization failed."
            );

        }

        const state =
            loadState();

        const relationship =
            state.relationships.find(
                item =>
                    item.id ===
                    relationshipId
            );

        if (!relationship) {

            throw new Error(
                "Verified relationship not found."
            );

        }


        /*
         * Only participants or Ministry
         * may revoke in this prototype.
         *
         * Production authority must be
         * determined server-side.
         */

        if (

            relationship.requesterId !==
                revoker.id &&

            relationship.targetId !==
                revoker.id &&

            revoker.role !==
                "ministry"

        ) {

            throw new Error(
                "Relationship revocation denied."
            );

        }


        relationship.status =
            "revoked";

        relationship.revokedAt =
            new Date().toISOString();

        relationship.revokedBy =
            revoker.id;

        relationship.revokeReason =
            reason;


        state.audit.push({

            id:
                crypto.randomUUID(),

            action:
                "EDUCATION_RELATIONSHIP_REVOKED",

            timestamp:
                new Date().toISOString(),

            relationshipId,

            reason

        });


        saveState(
            state
        );


        window.dispatchEvent(

            new CustomEvent(
                "pacificEducationRelationshipRevoked",
                {
                    detail: {
                        relationshipId,
                        reason
                    }
                }
            )

        );


        return relationship;

    }


    /* =====================================================
       GET USER RELATIONSHIPS
       ===================================================== */

    function getUserRelationships(
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

        return state.relationships.filter(

            relationship =>

                relationship.requesterId ===
                    userId ||

                relationship.targetId ===
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

            totalRelationships:
                state.relationships.length,

            verifiedRelationships:
                state.relationships.filter(
                    item =>
                        item.status ===
                        "verified"
                ).length,

            revokedRelationships:
                state.relationships.filter(
                    item =>
                        item.status ===
                        "revoked"
                ).length,

            prototypeOnly:
                true,

            serverSideVerificationRequired:
                true,

            automaticAccess:
                false

        });

    }


    /* =====================================================
       RESET
       ===================================================== */

    function resetPrototypeState() {

        localStorage.removeItem(
            STORAGE_KEY
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.PacificEducationVerifiedEducationRelationship =

        Object.freeze({

            version:
                VERSION,

            relationshipTypes:
                RELATIONSHIP_TYPES,

            verifyRelationship,

            checkRelationship,

            revokeRelationship,

            getUserRelationships,

            getStatus,

            resetPrototypeState

        });

})();
