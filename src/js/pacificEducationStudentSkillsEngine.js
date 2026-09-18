/*
 * Pacific Education
 * Student Skills Engine
 * Version: 1.0.0
 *
 * PURPOSE:
 * Continuously identify and track individual student skills
 * from daily learning evidence through final assessment.
 *
 * PROTOTYPE ONLY:
 * This is not a production security boundary.
 * Production student identity, authorization, sensitive data,
 * AI analysis and audit protection must be handled server-side.
 */

(function () {
    "use strict";

    const VERSION = "1.0.0";
    const STORAGE_KEY = "pacificEducationStudentSkills";

    const SKILL_STATUS = Object.freeze({
        DEMONSTRATED: "DEMONSTRATED",
        DEVELOPING: "DEVELOPING",
        EMERGING: "EMERGING",
        REQUIRES_PRACTICE: "REQUIRES_PRACTICE",
        REQUIRES_SUPPORT: "REQUIRES_SUPPORT",
        INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
        NOT_YET_INTRODUCED: "NOT_YET_INTRODUCED"
    });

    const EVIDENCE_TYPES = Object.freeze([
        "daily_activity",
        "written_work",
        "oral_response",
        "practical_activity",
        "photo",
        "teacher_observation",
        "voice",
        "text",
        "assessment",
        "test",
        "examination",
        "intervention",
        "reassessment"
    ]);

    const SKILL_CATEGORIES = Object.freeze([
        "literacy",
        "numeracy",
        "science",
        "communication",
        "problem_solving",
        "critical_thinking",
        "creativity",
        "practical_skills",
        "digital_skills",
        "learning_skills",
        "social_learning",
        "health",
        "real_life"
    ]);

    function now() {
        return new Date().toISOString();
    }

    function createId(prefix) {
        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2, 8)
        );
    }

    function safeRead() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    function safeWrite(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            return false;
        }
    }

    function getStudentRecord(studentId) {
        if (!studentId) {
            throw new Error("Student ID is required.");
        }

        const data = safeRead();

        if (!data[studentId]) {
            data[studentId] = {
                studentId,
                createdAt: now(),
                updatedAt: now(),
                skills: {},
                evidence: [],
                recommendations: [],
                audit: []
            };

            safeWrite(data);
        }

        return data[studentId];
    }

    function validateEvidence(evidence) {
        if (!evidence || typeof evidence !== "object") {
            throw new Error("Evidence object is required.");
        }

        if (!evidence.type || !EVIDENCE_TYPES.includes(evidence.type)) {
            throw new Error("Valid evidence type is required.");
        }

        if (!evidence.studentId) {
            throw new Error("Student ID is required.");
        }

        if (!evidence.skillId) {
            throw new Error("Skill ID is required.");
        }

        return true;
    }

    function addEvidence(evidence) {
        validateEvidence(evidence);

        const record = getStudentRecord(evidence.studentId);

        const item = {
            evidenceId: createId("EVID"),
            studentId: evidence.studentId,
            skillId: evidence.skillId,
            type: evidence.type,
            subject: evidence.subject || null,
            activityId: evidence.activityId || null,
            curriculumIndicator: evidence.curriculumIndicator || null,
            age: evidence.age || null,
            classLevel: evidence.classLevel || null,
            result: evidence.result || null,
            observation: evidence.observation || null,
            source: evidence.source || "Pacific Education",
            createdAt: now()
        };

        record.evidence.push(item);
        record.updatedAt = now();

        record.audit.push({
            auditId: createId("AUDIT"),
            action: "EVIDENCE_ADDED",
            evidenceId: item.evidenceId,
            timestamp: now()
        });

        const data = safeRead();
        data[evidence.studentId] = record;
        safeWrite(data);

        return item;
    }

    function updateSkill(studentId, skill) {
        if (!studentId) {
            throw new Error("Student ID is required.");
        }

        if (!skill || !skill.skillId) {
            throw new Error("Skill ID is required.");
        }

        if (
            skill.status &&
            !Object.values(SKILL_STATUS).includes(skill.status)
        ) {
            throw new Error("Invalid skill status.");
        }

        const record = getStudentRecord(studentId);

        const previous = record.skills[skill.skillId] || null;

        record.skills[skill.skillId] = {
            skillId: skill.skillId,
            name: skill.name || skill.skillId,
            category: skill.category || "learning_skills",
            subject: skill.subject || null,
            status:
                skill.status || SKILL_STATUS.INSUFFICIENT_EVIDENCE,
            capabilityLevel: skill.capabilityLevel || null,
            age: skill.age || null,
            classLevel: skill.classLevel || null,
            evidenceCount: skill.evidenceCount || 0,
            confidence: skill.confidence || null,
            lastEvidenceId: skill.lastEvidenceId || null,
            lastUpdated: now(),
            previousStatus: previous ? previous.status : null,
            developmentNotes: skill.developmentNotes || null
        };

        record.updatedAt = now();

        record.audit.push({
            auditId: createId("AUDIT"),
            action: "SKILL_UPDATED",
            skillId: skill.skillId,
            previousStatus: previous ? previous.status : null,
            newStatus: record.skills[skill.skillId].status,
            timestamp: now()
        });

        const data = safeRead();
        data[studentId] = record;
        safeWrite(data);

        return record.skills[skill.skillId];
    }

    function getSkill(studentId, skillId) {
        const record = getStudentRecord(studentId);
        return record.skills[skillId] || null;
    }

    function getAllSkills(studentId) {
        const record = getStudentRecord(studentId);
        return Object.values(record.skills);
    }

    function getEvidence(studentId) {
        const record = getStudentRecord(studentId);
        return [...record.evidence];
    }

    function recommendNextDevelopment(studentId, skillId) {
        const skill = getSkill(studentId, skillId);

        if (!skill) {
            return {
                status: "INSUFFICIENT_EVIDENCE",
                recommendation: "Collect suitable evidence before recommending the next activity."
            };
        }

        switch (skill.status) {
            case SKILL_STATUS.DEMONSTRATED:
                return {
                    status: "EXTENSION",
                    recommendation:
                        "Provide an appropriately more challenging activity that applies this skill in a new context."
                };

            case SKILL_STATUS.DEVELOPING:
                return {
                    status: "PRACTICE",
                    recommendation:
                        "Provide targeted practice followed by another opportunity to demonstrate the skill."
                };

            case SKILL_STATUS.EMERGING:
                return {
                    status: "GUIDED_PRACTICE",
                    recommendation:
                        "Provide explanation, modelling and guided practice before reassessment."
                };

            case SKILL_STATUS.REQUIRES_PRACTICE:
                return {
                    status: "TARGETED_PRACTICE",
                    recommendation:
                        "Provide a short targeted activity focused on the demonstrated difficulty."
                };

            case SKILL_STATUS.REQUIRES_SUPPORT:
                return {
                    status: "INTERVENTION",
                    recommendation:
                        "Provide differentiated support and reassess using appropriate evidence."
                };

            case SKILL_STATUS.NOT_YET_INTRODUCED:
                return {
                    status: "INTRODUCE",
                    recommendation:
                        "Introduce the skill when appropriate according to the authorised curriculum."
                };

            default:
                return {
                    status: "MORE_EVIDENCE",
                    recommendation:
                        "Provide another suitable activity to obtain sufficient evidence."
                };
        }
    }

    function getStudentSkillsProfile(studentId) {
        const record = getStudentRecord(studentId);

        return {
            studentId: record.studentId,
            updatedAt: record.updatedAt,
            skills: getAllSkills(studentId),
            evidenceCount: record.evidence.length,
            recommendations: record.recommendations
        };
    }

    function getStatus() {
        return {
            name: "Pacific Education Student Skills Engine",
            version: VERSION,
            prototypeOnly: true,
            productionSecurityRequired: true,
            skillCategories: [...SKILL_CATEGORIES],
            skillStatuses: { ...SKILL_STATUS },
            evidenceTypes: [...EVIDENCE_TYPES]
        };
    }

    window.PacificEducationStudentSkillsEngine = Object.freeze({
        VERSION,
        SKILL_STATUS,
        EVIDENCE_TYPES,
        SKILL_CATEGORIES,
        addEvidence,
        updateSkill,
        getSkill,
        getAllSkills,
        getEvidence,
        recommendNextDevelopment,
        getStudentSkillsProfile,
        getStatus
    });

})();
