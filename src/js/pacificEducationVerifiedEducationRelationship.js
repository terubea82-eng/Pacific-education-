/*
 * =========================================================
 * PACIFIC EDUCATION
 * VERIFIED EDUCATION RELATIONSHIP LAYER
 * =========================================================
 *
 * Version: 1.2.0
 *
 * Security update:
 * getUserRelationships() now requires the complete
 * authorized user object instead of accepting an arbitrary
 * user ID from the browser.
 *
 * Browser prototype only.
 * Production verification must be server-side.
 * =========================================================
 */

(() => {
    "use strict";

    const VERSION = "1.2.0";

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

    function emptyState() {
        return {
            relationships: [],
            audit: []
        };
    }

    function loadState() {
        try {
            const stored =
                localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return emptyState();
            }

            const parsed = JSON.parse(stored);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                !Array.isArray(parsed.relationships) ||
                !Array.isArray(parsed.audit)
            ) {
                return emptyState();
            }

            return parsed;
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

    function createId(prefix) {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2)
        );
    }

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

    function getRule(type) {
        const rule = RELATIONSHIP_TYPES[type];

        if (!rule) {
            throw new Error(
                "Invalid education relationship type."
            );
        }

        return rule;
    }

    function rolesMatch(rule, requester, target) {
        return Boolean(
            rule.roles.includes(requester.role) &&
            rule.roles.includes(target.role) &&
            requester.role !== target.role
        );
    }

    function validEvidence(type, evidence) {
        const rule = getRule(type);

        if (
            !evidence ||
            typeof evidence !== "object" ||
            typeof evidence.type !== "string"
        ) {
            return false;
        }

        if (!rule.requiredEvidence.includes(evidence.type)) {
            return false;
        }

        return evidence.verified === true;
    }

    function validJurisdiction(jurisdiction) {
        return (
            typeof jurisdiction === "string" &&
            Boolean(jurisdiction.trim())
        );
    }

    function validAuthority(authority) {
        if (
            !authority ||
            typeof authority !== "object"
        ) {
            return false;
        }

        return Boolean(
            authority.consent === true ||
            authority.institutionalAuthority === true ||
            authority.guardianshipAuthority === true ||
            authority.studentAuthorization === true
        );
    }

    function audit(action, details = {}) {
        const state = loadState();

        state.audit.push({
            id: createId("audit"),
            action,
            timestamp: new Date().toISOString(),
            ...details
        });

        saveState(state);
    }

    function dispatchEvent(name, detail) {
        if (
            typeof window === "undefined" ||
            typeof window.dispatchEvent !== "function" ||
            typeof CustomEvent === "undefined"
        ) {
            return;
        }

        window.dispatchEvent(
            new CustomEvent(name, {
                detail
            })
        );
    }

    /*
     * =====================================================
     * VERIFY RELATIONSHIP
     * =====================================================
     */

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

        if (requester.id === target.id) {
            throw new Error(
                "Requester and target must be different users."
            );
        }

        const rule = getRule(relationshipType);

        if (!rolesMatch(rule, requester, target)) {
            throw new Error(
                "Roles cannot form this relationship."
            );
        }

        if (!validJurisdiction(jurisdiction)) {
            throw new Error(
                "Jurisdiction verification required."
            );
        }

        if (!validEvidence(relationshipType, evidence)) {
            throw new Error(
                "Relationship evidence is not verified."
            );
        }

        if (!validAuthority(authority)) {
            throw new Error(
                "Lawful authority or consent is required."
            );
        }

        const state = loadState();

        const existing = state.relationships.find(
            item =>
                item.requesterId === requester.id &&
                item.targetId === target.id &&
                item.relationshipType === relationshipType &&
                item.status === "verified"
        );

        if (existing) {
            return existing;
        }

        const relationship = {
            id: createId("relationship"),

            requesterId: requester.id,
            requesterRole: requester.role,

            targetId: target.id,
            targetRole: target.role,

            relationshipType,

            jurisdiction,

            evidenceType: evidence.type,

            evidenceReference:
                typeof evidence.reference === "string"
                    ? evidence.reference
                    : null,

            authorityType:
                typeof authority.type === "string"
                    ? authority.type
                    : null,

            status: "verified",

            verifiedAt:
                new Date().toISOString(),

            revokedAt: null,
            revokedBy: null,
            revokeReason: null
        };

        state.relationships.push(relationship);

        state.audit.push({
            id: createId("audit"),
            action:
                "EDUCATION_RELATIONSHIP_VERIFIED",
            timestamp:
                new Date().toISOString(),
            relationshipId:
                relationship.id,
            relationshipType,
            requesterId:
                requester.id,
            targetId:
                target.id
        });

        saveState(state);

        dispatchEvent(
            "pacificEducationRelationshipVerified",
            {
                relationshipId:
                    relationship.id,
                relationshipType,
                requesterId:
                    requester.id,
                targetId:
                    target.id
            }
        );

        return relationship;
    }

    /*
     * =====================================================
     * CHECK RELATIONSHIP
     * =====================================================
     */

    function checkRelationship({
        relationshipId,
        requester,
        target,
        relationshipType
    }) {
        if (!validUser(requester)) {
            return {
                allowed: false,
                reason: "requester_not_authorized"
            };
        }

        if (!validUser(target)) {
            return {
                allowed: false,
                reason: "target_not_authorized"
            };
        }

        if (
            typeof relationshipId !== "string" ||
            !relationshipId.trim()
        ) {
            return {
                allowed: false,
                reason: "relationship_id_required"
            };
        }

        const state = loadState();

        const relationship =
            state.relationships.find(item =>
                item.id === relationshipId &&
                item.status === "verified" &&
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

    /*
     * =====================================================
     * REVOKE RELATIONSHIP
     * =====================================================
     */

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

        if (
            typeof relationshipId !== "string" ||
            !relationshipId.trim()
        ) {
            throw new Error(
                "Valid relationship ID required."
            );
        }

        const state = loadState();

        const relationship =
            state.relationships.find(
                item =>
                    item.id === relationshipId
            );

        if (!relationship) {
            throw new Error(
                "Verified relationship not found."
            );
        }

        const isParticipant =
            relationship.requesterId ===
                revoker.id ||
            relationship.targetId ===
                revoker.id;

        if (!isParticipant) {
            throw new Error(
                "Relationship revocation denied: revoker is not a participant."
            );
        }

        if (relationship.status !== "verified") {
            throw new Error(
                "Only verified relationships can be revoked."
            );
        }

        const safeReason =
            typeof reason === "string" &&
            reason.trim()
                ? reason.trim()
                : "relationship_authorization_revoked";

        relationship.status = "revoked";
        relationship.revokedAt =
            new Date().toISOString();
        relationship.revokedBy =
            revoker.id;
        relationship.revokeReason =
            safeReason;

        state.audit.push({
            id: createId("audit"),
            action:
                "EDUCATION_RELATIONSHIP_REVOKED",
            timestamp:
                new Date().toISOString(),
            relationshipId,
            revokedBy:
                revoker.id,
            reason:
                safeReason
        });

        saveState(state);

        dispatchEvent(
            "pacificEducationRelationshipRevoked",
            {
                relationshipId,
                revokedBy:
                    revoker.id,
                reason:
                    safeReason
            }
        );

        return relationship;
    }

    /*
     * =====================================================
     * GET USER RELATIONSHIPS
     *
     * SECURITY CHANGE:
     * The caller must provide the complete authorized
     * user object.
     *
     * Passing another person's ID is no longer accepted.
     * =====================================================
     */

    function getUserRelationships(user) {
        if (!validUser(user)) {
            throw new Error(
                "Authorized user object required."
            );
        }

        const state = loadState();

        return state.relationships.filter(
            relationship =>
                relationship.requesterId ===
                    user.id ||
                relationship.targetId ===
                    user.id
        );
    }

    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    function getStatus() {
        const state = loadState();

        return Object.freeze({
            version: VERSION,

            totalRelationships:
                state.relationships.length,

            verifiedRelationships:
                state.relationships.filter(
                    item =>
                        item.status === "verified"
                ).length,

            revokedRelationships:
                state.relationships.filter(
                    item =>
                        item.status === "revoked"
                ).length,

            prototypeOnly: true,

            serverSideVerificationRequired: true,

            automaticAccess: false,

            participantOnlyRevocation: true,

            userRelationshipAccess:
                "authorized_user_object_required"
        });
    }

    /*
     * =====================================================
     * RESET
     * =====================================================
     */

    function resetPrototypeState() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /*
     * =====================================================
     * PUBLIC API
     * =====================================================
     */

    window.PacificEducationVerifiedEducationRelationship =
        Object.freeze({
            version: VERSION,

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
