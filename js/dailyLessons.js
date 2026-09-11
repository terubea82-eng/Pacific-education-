/* =========================================
   PACIFIC EDUCATION
   DAILY LESSON ENGINE
   VERSION 1.2.0
   DAY 1 - DAY 365

   CONNECTION RULES
   -----------------------------------------
   • Five-Minute Practice loads before this file.
   • Pacific Education Core is the primary
     progression authority.
   • localStorage is compatibility fallback only.
   • Daily lessons remain compatible with the
     protected Core/assessment system.
   • Assessment/dashboard messages must not
     permanently destroy the daily lesson UI.
   • Returning to the daily lesson always
     restores the original lesson structure.
========================================= */

(function (window) {

    "use strict";


    /* =========================================
       DAILY LESSON DATA
    ========================================= */

    const dailyLessons = {

        1: {
            title: "My First English Words",
            activity:
                "Learn and say: hello, goodbye, thank you.",
            practice:
                "Say each word aloud three times."
        },

        2: {
            title: "Greetings",
            activity:
                "Practise: Hello! Good morning! How are you?",
            practice:
                "Say the greeting to a parent, teacher or friend."
        },

        3: {
            title: "My Name",
            activity:
                "Practise: My name is ______.",
            practice:
                "Say your name using a complete sentence."
        },

        4: {
            title: "Family Words",
            activity:
                "Learn: mother, father, sister, brother.",
            practice:
                "Name the people in your family."
        },

        5: {
            title: "Colours",
            activity:
                "Learn: red, blue, yellow and green.",
            practice:
                "Find something around you for each colour."
        },

        6: {
            title: "Numbers 1–5",
            activity:
                "Practise counting from one to five.",
            practice:
                "Count five objects around you."
        },

        7: {
            title: "Review Week 1",
            activity:
                "Review greetings, names, family, colours and numbers.",
            practice:
                "Say five English words you learned this week."
        },

        61: {
            title: "Everyday Actions",
            activity:
                "Learn: walk, run, sit, stand and jump.",
            practice:
                "Say each action word and demonstrate the action."
        },

        62: {
            title: "Action Sentences",
            activity:
                "Practise: I can walk. I can run. I can jump.",
            practice:
                "Say each sentence aloud and demonstrate the action."
        },

        63: {
            title: "Things I Can Do",
            activity:
                "Practise: I can sit, stand, walk, run and jump.",
            practice:
                "Make five sentences using: I can..."
        },

        365: {
            title: "My English Learning Journey",
            activity:
                "Review the English words, sentences, sounds and skills you have learned.",
            practice:
                "Say what you can do in English and celebrate completing 365 days of learning."
        }

    };


    /* =========================================
       PROGRESSIVE DAILY LESSONS
       DAY 64 - DAY 364
    ========================================= */

    const lessonStages = [

        {
            start: 64,
            end: 90,
            title: "Vocabulary & Sentences",

            topics: [
                "Family",
                "School",
                "Home",
                "Pacific Community",
                "Food",
                "Animals",
                "Weather",
                "Clothes",
                "Transport",
                "Feelings"
            ],

            activity:
                "Learn five new English words about today's topic and practise using them in simple sentences.",

            practice:
                "Say the five new words aloud and make one sentence using each word."
        },

        {
            start: 91,
            end: 120,
            title: "Reading & Understanding",

            activity:
                "Read a short English passage and identify the main idea.",

            practice:
                "Tell a parent or teacher what the passage was about."
        },

        {
            start: 121,
            end: 150,
            title: "Writing Skills",

            activity:
                "Practise writing clear English sentences about familiar topics.",

            practice:
                "Write five sentences and check your spelling."
        },

        {
            start: 151,
            end: 180,
            title: "Grammar Practice",

            activity:
                "Practise nouns, verbs, adjectives and correct sentence structure.",

            practice:
                "Write five sentences using today's grammar skill."
        },

        {
            start: 181,
            end: 210,
            title: "Speaking & Listening",

            activity:
                "Practise listening carefully and responding in complete English sentences.",

            practice:
                "Speak about your day for one minute."
        },

        {
            start: 211,
            end: 240,
            title: "Pacific Community English",

            activity:
                "Practise English using topics about family, school, village, community and Pacific life.",

            practice:
                "Describe something important in your community using five sentences."
        },

        {
            start: 241,
            end: 270,
            title: "Storytelling",

            activity:
                "Read, understand and create short English stories.",

            practice:
                "Tell a short story with a beginning, middle and ending."
        },

        {
            start: 271,
            end: 300,
            title: "Practical English",

            activity:
                "Practise English used in everyday situations such as shopping, travel, school and work.",

            practice:
                "Create a short conversation for today's situation."
        },

        {
            start: 301,
            end: 330,
            title: "English Review & Application",

            activity:
                "Review vocabulary, grammar, reading, writing, listening and speaking skills.",

            practice:
                "Complete a mixed English activity using several skills."
        },

        {
            start: 331,
            end: 364,
            title: "Final English Preparation",

            activity:
                "Strengthen your English skills through review, practice and independent learning.",

            practice:
                "Complete today's English activity and explain what you learned."
        }

    ];


    /* =========================================
       BUILD DAYS 64 - 364
    ========================================= */

    for (let day = 64; day <= 364; day++) {

        const stage = lessonStages.find(
            function (stage) {
                return (
                    day >= stage.start &&
                    day <= stage.end
                );
            }
        );

        if (!stage) {
            continue;
        }

        let topic = "";

        if (stage.topics) {

            const topicIndex =
                (day - stage.start) %
                stage.topics.length;

            topic =
                stage.topics[topicIndex];
        }

        dailyLessons[day] = {

            title:
                stage.title +
                (topic ? " — " + topic : "") +
                " — Day " +
                day,

            activity:
                stage.activity.replace(
                    "today's topic",
                    topic || "today's lesson"
                ),

            practice:
                stage.practice
        };
    }


    /* =========================================
       GET CURRENT CORE DAY
       
       CORE IS THE PRIMARY AUTHORITY.
       localStorage is compatibility fallback.
    ========================================= */

    function getCurrentCoreDay() {

        try {

            const core =
                window.PacificEducationCore;

            if (
                core &&
                typeof core.getState === "function"
            ) {

                const state =
                    core.getState();

                const coreDay =
                    Number(
                        state &&
                        state.lesson &&
                        state.lesson.day
                    );

                if (
                    Number.isInteger(coreDay) &&
                    coreDay >= 1 &&
                    coreDay <= 365
                ) {

                    return coreDay;
                }
            }

        } catch (error) {

            console.warn(
                "Pacific Education: Core day could not be read."
            );
        }


        /* =====================================
           COMPATIBILITY FALLBACK
        ===================================== */

        try {

            const fallbackDay =
                Number.parseInt(
                    window.localStorage.getItem(
                        "currentDayNumber"
                    ) || "1",
                    10
                );

            if (
                Number.isInteger(fallbackDay) &&
                fallbackDay >= 1 &&
                fallbackDay <= 365
            ) {

                return fallbackDay;
            }

        } catch (error) {

            console.warn(
                "Pacific Education: localStorage day fallback unavailable."
            );
        }


        return 1;
    }


    /* =========================================
       GET DAILY LESSON
    ========================================= */

    function getDailyLesson(dayNumber) {

        return dailyLessons[dayNumber] || {

            title:
                "Daily English Practice",

            activity:
                "Practise speaking, listening, reading and writing in English.",

            practice:
                "Complete today's English activity with a parent or teacher."
        };
    }


    /* =========================================
       DAY 60 PHONICS ASSESSMENT VISIBILITY
    ========================================= */

    function updateDay60AssessmentVisibility(dayNumber) {

        const assessment =
            document.getElementById(
                "phonicsAssessmentDay60"
            );

        if (!assessment) {
            return;
        }

        assessment.style.display =
            dayNumber === 60
                ? "block"
                : "none";
    }


    /* =========================================
       DAILY LESSON CONTAINER
    ========================================= */

    function getDailyLessonContainer() {

        return document.getElementById(
            "dailyLesson"
        );
    }


    /* =========================================
       PRESERVE THE ORIGINAL LESSON UI
    ========================================= */

    let originalLessonHTML = null;

    function captureOriginalLessonHTML() {

        const container =
            getDailyLessonContainer();

        if (
            container &&
            originalLessonHTML === null
        ) {

            originalLessonHTML =
                container.innerHTML;
        }
    }


    /* =========================================
       RESTORE THE ORIGINAL LESSON UI
    ========================================= */

    function restoreDailyLessonStructure() {

        const container =
            getDailyLessonContainer();

        if (!container) {
            return false;
        }

        if (originalLessonHTML !== null) {

            container.innerHTML =
                originalLessonHTML;

            return true;
        }

        return false;
    }


    /* =========================================
       DISPLAY TODAY'S LESSON
       
       Core-controlled day is used first.
    ========================================= */

    function displayDailyLesson() {

        captureOriginalLessonHTML();


        const dayNumber =
            getCurrentCoreDay();


        const lesson =
            getDailyLesson(dayNumber);


        updateDay60AssessmentVisibility(
            dayNumber
        );


        const day =
            document.getElementById(
                "dailyLessonDay"
            );

        const title =
            document.getElementById(
                "dailyLessonTitle"
            );

        const activity =
            document.getElementById(
                "dailyLessonActivity"
            );

        const practice =
            document.getElementById(
                "dailyLessonPractice"
            );


        if (day) {

            day.textContent =
                "Day " + dayNumber;
        }


        if (title) {

            title.textContent =
                lesson.title;
        }


        if (activity) {

            activity.textContent =
                lesson.activity;
        }


        if (practice) {

            if (
                window.PacificEducationFiveMinutePractice &&
                typeof
                    window.PacificEducationFiveMinutePractice.render ===
                    "function"
            ) {

                window.PacificEducationFiveMinutePractice.render(
                    practice,
                    dayNumber
                );

            } else {

                practice.textContent =
                    lesson.practice;
            }
        }
    }


    /* =========================================
       SHOW APPLICATION MESSAGE / ASSESSMENT
       
       IMPORTANT:
       This function may temporarily replace
       the daily lesson display.
       
       The original lesson structure is preserved
       in memory and can always be restored.
    ========================================= */

    function showLesson(html) {

        const container =
            getDailyLessonContainer();

        if (!container) {

            console.warn(
                "Pacific Education: dailyLesson container not found."
            );

            return false;
        }

        captureOriginalLessonHTML();

        container.innerHTML =
            html || "";

        return true;
    }


    /* =========================================
       START / RETURN TO DAILY LESSON
    ========================================= */

    function startDailyLesson() {

        /*
         * Restore the original HTML structure
         * before rebuilding the current lesson.
         */

        restoreDailyLessonStructure();

        displayDailyLesson();


        const dailyLesson =
            getDailyLessonContainer();

        if (dailyLesson) {

            dailyLesson.scrollIntoView({

                behavior: "smooth",

                block: "start"
            });
        }

        return true;
    }


    /* =========================================
       PACIFIC EDUCATION DAILY LESSON API
    ========================================= */

    window.PacificEducationDailyLessons =
        Object.freeze({

            version: "1.2.0",

            getDailyLesson:
                getDailyLesson,

            getCurrentCoreDay:
                getCurrentCoreDay,

            updateDay60AssessmentVisibility:
                updateDay60AssessmentVisibility,

            displayDailyLesson:
                displayDailyLesson,

            showLesson:
                showLesson,

            start:
                startDailyLesson,

            restore:
                restoreDailyLessonStructure
        });


    /*
     * Preserve existing global functions.
     */

    window.getDailyLesson =
        getDailyLesson;

    window.displayDailyLesson =
        displayDailyLesson;

    window.showLesson =
        showLesson;

    window.startDailyLesson =
        startDailyLesson;


    /* =========================================
       PAGE LOAD
    ========================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            captureOriginalLessonHTML();

            displayDailyLesson();

        }
    );


})(window);
