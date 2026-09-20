/* =========================================================
 * PACIFIC EDUCATION — CURRICULUM SOURCE DATA
 * Version: 1.0.0
 *
 * Verified source metadata for Fiji Year 1 English.
 * This file deliberately separates curriculum resources from
 * official achievement-indicator records.
 *
 * SOURCE:
 * Ministry of Education, Heritage and Arts, Curriculum
 * Development Unit, "Year 1 English - Language, Literacy and
 * Communication", 2013; revised 2019; re-printed 2020.
 *
 * The source is reported as issued free to schools and owned
 * by the Ministry/Curriculum Advisory Services. Classroom
 * reproduction conditions apply. This registry does not copy
 * the source text; it records metadata and alignment evidence.
 *
 * IMPORTANT:
 * The 2013/revised-2019 resource is NOT assumed to be the
 * currently authoritative 2026 curriculum. The Ministry has
 * been revising Years 1-4 curriculum documents, so current
 * official versions must be confirmed before production use.
 * ========================================================= */

(function (global) {
    "use strict";

    var VERSION = "1.1.0";

    var SOURCES = Object.freeze([
        Object.freeze({
            sourceId: "FJ-MOE-Y1-LLC-2019-REPRINT2020",
            jurisdiction: "Fiji",
            authority: "Ministry of Education, Heritage and Arts",
            publisherUnit: "Curriculum Development Unit",
            title: "Year 1 English - Language, Literacy and Communication",
            originalYear: 2013,
            revisedYear: 2019,
            reprintYear: 2020,
            sourceType: "teacher_resource",
            currentAuthorityStatus: "REQUIRES_CURRENT_MINISTRY_VALIDATION",
            copyrightOwner:
                "Curriculum Advisory Services, Ministry of Education, Heritage and Arts",
            issuedToSchools: true,
            classroomReproductionOnly: true,
            observedStructure: Object.freeze({
                units: 8,
                phonicsActivitySection: true
            }),
            observedUnits: Object.freeze([
                "Unit 1: Who am I?",
                "Unit 2",
                "Unit 3",
                "Unit 4",
                "Unit 5",
                "Unit 6",
                "Unit 7",
                "Unit 8"
            ]),
            evidenceNotes: Object.freeze([
                "Unit 1 includes personal information and speaking activities.",
                "Unit 1 includes letter-recognition and beginning-sound activities.",
                "A dedicated Phonics Activity section is listed."
            ]),
            achievementIndicatorStatus:
                "NOT_EXTRACTED_FROM_AUTHORIZED_CURRENT_PRESCRIPTION",
            productionUse:
                "Reference/alignment evidence only until current Ministry prescription and achievement indicators are validated."
        })
    ]);



    /*
     * Verified resource evidence from the Ministry resource copy.
     * These are learning-resource topics/activities, NOT official
     * achievement-indicator statements.
     */
    var UNIT_EVIDENCE = Object.freeze([
        Object.freeze({
            unit: 1,
            title: "Who am I?",
            pages: "5-9",
            evidence: [
                "personal introduction",
                "name, age, clothing and colour questions",
                "letter recognition and beginning-sound practice"
            ]
        }),
        Object.freeze({
            unit: 2,
            title: "My Friends - Sera and Tazim",
            pages: "10-14",
            evidence: [
                "describing friends",
                "age and clothing questions",
                "letter recognition and beginning-sound practice"
            ]
        }),
        Object.freeze({
            unit: 3,
            title: "My School",
            pages: "15-19",
            evidence: [
                "talking about school",
                "school/classroom discussion",
                "letter recognition and beginning-sound practice"
            ]
        }),
        Object.freeze({
            unit: 4,
            title: "Getting Ready for School",
            pages: "20-24",
            evidence: [
                "daily routine vocabulary",
                "sequencing actions before school",
                "letter recognition and beginning-sound practice"
            ]
        }),
        Object.freeze({
            unit: 5,
            title: "A Rainy Day",
            pages: "25-29",
            evidence: [
                "weather discussion",
                "recitation",
                "reading familiar words",
                "beginning and middle sound practice"
            ]
        }),
        Object.freeze({
            unit: 6,
            title: "What I Do On A Rainy Day",
            pages: "30-35",
            evidence: [
                "recitation and discussion",
                "drawing and describing activity",
                "phonological segmentation of simple words",
                "beginning, middle and end sound practice"
            ]
        }),
        Object.freeze({
            unit: 7,
            title: "Preparing a Family Feast",
            pages: "36-40",
            evidence: [
                "family activity discussion",
                "helping family",
                "spelling and reading simple words",
                "phonics patterns including consonant and vowel sounds"
            ]
        }),
        Object.freeze({
            unit: 8,
            title: "A Family Feast",
            pages: "41-54",
            evidence: [
                "picture discussion",
                "family and food vocabulary",
                "extended phonics patterns and digraphs",
                "reading and sound practice"
            ]
        })
    ]);

    var PHONICS_EVIDENCE = Object.freeze([
        "beginning sounds",
        "middle sounds",
        "end sounds",
        "letter recognition",
        "simple word segmentation",
        "ai",
        "oa",
        "ie",
        "ee",
        "or",
        "y",
        "x",
        "z",
        "w",
        "ng",
        "oo",
        "ch",
        "sh",
        "th",
        "qu",
        "ou",
        "oi",
        "ue",
        "er",
        "ar"
    ]);

    var ALIGNMENT_RECORDS = Object.freeze([
        Object.freeze({
            recordId: "Y1-LLC-SOURCE-01",
            sourceId: "FJ-MOE-Y1-LLC-2019-REPRINT2020",
            level: "Year 1",
            subject: "English",
            strandArea: "Language, Literacy and Communication",
            evidenceType: "resource_structure",
            evidence:
                "Eight-unit resource with a dedicated phonics activity section.",
            mappedPrototypeAreas: Object.freeze([
                "personal introduction",
                "speaking practice",
                "letter recognition",
                "beginning-sound practice"
            ]),
            coverageStatus: "REFERENCE_ONLY",
            validationStatus: "SOURCE_VERIFIED_NOT_ACHIEVEMENT_INDICATOR"
        })
    ]);

    var api = Object.freeze({
        version: VERSION,
        sources: SOURCES,
        alignmentRecords: ALIGNMENT_RECORDS,
        unitEvidence: UNIT_EVIDENCE,
        phonicsEvidence: PHONICS_EVIDENCE,

        getSources: function () {
            return SOURCES;
        },

        getAlignmentRecords: function () {
            return ALIGNMENT_RECORDS;
        },

        getUnitEvidence: function () {
            return UNIT_EVIDENCE;
        },

        getPhonicsEvidence: function () {
            return PHONICS_EVIDENCE;
        }
    });

    global.PacificEducationCurriculumSourceData = api;

})(window);
