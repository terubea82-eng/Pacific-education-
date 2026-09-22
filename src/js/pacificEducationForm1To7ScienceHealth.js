/*
 * PACIFIC EDUCATION
 * Form 1-7 Science & Health Pilot Activity Catalog
 * Version 1.0.0
 *
 * Prototype teacher-testing catalog only.
 * These generated activities are NOT official Fiji curriculum prescriptions.
 * Every activity requires authoritative mapping and verification before
 * it may be represented as curriculum-aligned production content.
 */
(function(window) {
    "use strict";

    var VERSION = "1.1.0";
    var LEVELS = ["Form 1","Form 2","Form 3","Form 4","Form 5","Form 6","Form 7"];

    var SUBJECTS = [
        { id:"Health Science", name:"Health Science", areas:[
            "Personal health and hygiene","Nutrition and healthy living",
            "Mental and social wellbeing","Communicable disease prevention",
            "Sexual and reproductive health","First aid and safety"
        ]},
        { id:"Basic Science", name:"Basic Science", areas:[
            "Scientific investigation","Matter and materials",
            "Energy and forces","Living things",
            "Earth and environment","Technology and everyday science"
        ]},
        { id:"Elementary Science", name:"Elementary Science", areas:[
            "Observation and measurement","Plants and animals",
            "Human body and health","Materials and their uses",
            "Weather and Earth","Energy and simple machines"
        ]},
        { id:"Biology", name:"Biology", areas:[
            "Cells and organisation","Nutrition and transport",
            "Respiration and excretion","Reproduction and inheritance",
            "Ecology and biodiversity","Evolution and biotechnology"
        ]},
        { id:"Chemistry", name:"Chemistry", areas:[
            "Laboratory safety and measurement","Particles and atomic structure",
            "Chemical bonding and compounds","Chemical reactions and equations",
            "Acids, bases and salts","Organic and applied chemistry"
        ]},
        { id:"Physics", name:"Physics", areas:[
            "Measurement and motion","Forces and energy",
            "Heat and thermal physics","Waves and sound",
            "Electricity and magnetism","Light, matter and modern physics"
        ]}
    ];

    var VERBS = [
        "Identify and explain","Observe and record","Compare and discuss",
        "Investigate and report","Apply the concept to a Fiji context",
        "Review the concept and answer questions"
    ];

    var records = [];

    SUBJECTS.forEach(function(subject) {
        LEVELS.forEach(function(level) {
            subject.areas.forEach(function(area, index) {
                var verb = VERBS[index];
                records.push({
                    id:"PE-" + level.replace(" ","") + "-" +
                        subject.id.replace(/[^A-Za-z0-9]/g,"") + "-" + (index+1),
                    level:level,
                    subjectId:subject.id,
                    activityNumber:index+1,
                    topic:area,
                    title:verb + ": " + area,
                    instruction:verb + " the key ideas in " +
                        area.toLowerCase() +
                        ". Use observations, examples or evidence where appropriate.",
                    teacherTask:"Pilot teacher task: attempt the activity, check clarity, " +
                        "check the expected level, and record curriculum-alignment feedback.",
                    assessmentType:index % 2 === 0 ? "short-answer" : "discussion-and-application",
                    pilotStatus:"prototype-review",
                    curriculumVerification:"required-before-production",
                    curriculumMapping:{
                        status:"UNVERIFIED",
                        authority:"Fiji Ministry of Education",
                        source:null,
                        strand:null,
                        achievementIndicator:null,
                        verified:false
                    },
                    levelSuitability:"UNVERIFIED — do not treat this generated activity as a Form-specific official prescription until authoritative mapping is completed"
                });
            });
        });
    });

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function list(filters) {
        filters = filters || {};
        return records.filter(function(r) {
            return (!filters.level || r.level === filters.level) &&
                (!filters.subjectId || r.subjectId === filters.subjectId) &&
                (!filters.topic || r.topic === filters.topic);
        }).map(copy);
    }

    function get(id) {
        var found = records.find(function(r) { return r.id === id; });
        return found ? copy(found) : null;
    }

    window.PacificEducationForm1To7ScienceHealth = Object.freeze({
        version:VERSION,
        levels:LEVELS.slice(),
        subjects:SUBJECTS.map(function(s) {
            return {id:s.id,name:s.name,areas:s.areas.slice()};
        }),
        activityCount:records.length,
        list:list,
        get:get,
        exportData:function(){ return copy(records); },
        getSummary:function() {
            return SUBJECTS.map(function(s) {
                return {
                    subjectId:s.id,
                    subjectName:s.name,
                    levels:LEVELS.slice(),
                    activitiesPerLevel:s.areas.length,
                    totalActivities:s.areas.length * LEVELS.length
                };
            });
        }
    });
})(window);
