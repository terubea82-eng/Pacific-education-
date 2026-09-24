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
       DAILY LESSONS — DAY 1 TO DAY 60
       Concrete learner activities are defined for
       every day before the progressive 64–364 stages.
       Day 30 remains the Alphabet Assessment gate.
       Day 60 remains the Phonics Assessment gate.
    ========================================= */

    const earlyDailyLessons = {
        1:  ["My First English Words", "Learn and say: hello, goodbye, thank you.", "Say each word aloud three times."],
        2:  ["Greetings", "Practise: Hello! Good morning! How are you?", "Greet a parent, teacher or friend using a complete sentence."],
        3:  ["My Name", "Practise: My name is ______.", "Say your name using a complete sentence three times."],
        4:  ["Family Words", "Learn: mother, father, sister, brother.", "Name four family words and use two in sentences."],
        5:  ["Colours", "Learn: red, blue, yellow and green.", "Find or point to one object for each colour."],
        6:  ["Numbers 1–5", "Practise counting from one to five.", "Count five objects around you."],
        7:  ["Review Week 1", "Review greetings, names, family, colours and numbers.", "Say five English words you learned this week."],
        8:  ["Numbers 6–10", "Practise counting from six to ten.", "Count ten objects and say the numbers aloud."],
        9:  ["My Body", "Learn: head, eyes, ears, nose, mouth and hands.", "Point to each body part and say its name."],
        10: ["Classroom Words", "Learn: book, pencil, bag, desk, chair and teacher.", "Point to five classroom objects and name them."],
        11: ["School Actions", "Practise: read, write, listen, speak and draw.", "Demonstrate each action while saying the word."],
        12: ["Simple Instructions", "Practise: stand up, sit down, look, listen and write.", "Follow five instructions correctly."],
        13: ["Shapes", "Learn: circle, square, triangle and rectangle.", "Find one example of each shape."],
        14: ["Review Week 2", "Review numbers, body parts, classroom words, actions and shapes.", "Name ten things you remember from Days 8–13."],
        15: ["My Home", "Learn: house, room, door, window, table and bed.", "Name six things you can see at home."],
        16: ["Food Words", "Learn: rice, bread, fish, water, fruit and vegetables.", "Name three foods and make simple sentences."],
        17: ["Animals", "Learn: dog, cat, bird, fish, cow and chicken.", "Name six animals and make one sentence about an animal."],
        18: ["Weather", "Learn: sunny, rainy, cloudy, windy and hot.", "Describe today's weather using one sentence."],
        19: ["Clothes", "Learn: shirt, skirt, shorts, dress, shoes and hat.", "Name what you are wearing using three words."],
        20: ["My Community", "Learn: school, village, road, shop, church and market.", "Name three places in your community."],
        21: ["Action Words", "Practise: walk, run, jump, sit, stand and clap.", "Say each action word and demonstrate it safely."],
        22: ["I Can", "Practise: I can walk. I can run. I can read. I can write.", "Make four sentences beginning with “I can”."],
        23: ["I Like", "Practise: I like rice. I like blue. I like reading.", "Say three things you like."],
        24: ["I Do Not Like", "Practise: I do not like ______.", "Make two respectful sentences about things you do not like."],
        25: ["Questions and Answers", "Practise: What is your name? How are you? What do you like?", "Ask and answer three simple questions."],
        26: ["Sentence Building", "Put words together to make simple sentences.", "Write or say five complete sentences."],
        27: ["Listening Practice", "Listen to a short instruction or sentence and identify the key words.", "Repeat the instruction or sentence accurately."],
        28: ["Speaking Review", "Use greetings, family, school, food, animals and action words in conversation.", "Speak for one minute using words learned this month."],
        29: ["Alphabet Review", "Review the letters A–Z and practise saying their names.", "Say the alphabet aloud and identify five letters."],
        30: ["Alphabet Assessment", "Complete the mandatory Alphabet Assessment before progressing beyond Day 30.", "Answer all assessment questions. A passed assessment unlocks the next stage."],
        31: ["Beginning Sounds", "Listen for the beginning sound in simple words.", "Say five words and identify their first sounds."],
        32: ["Letter and Sound Matching", "Match familiar letters with their common sounds.", "Match ten letters to their sounds."],
        33: ["Vowels", "Practise the vowels A, E, I, O and U.", "Say the five vowels and find one word for each."],
        34: ["Short Words", "Read simple two- and three-letter words.", "Read five familiar short words aloud."],
        35: ["Word Families", "Practise simple word families such as -at, -an and -in.", "Say three words from each of two word families."],
        36: ["Review Sounds", "Review letters, beginning sounds, vowels and short words.", "Read ten familiar words aloud."],
        37: ["Simple Nouns", "Identify people, places, animals and things as nouns.", "Name five nouns around you."],
        38: ["Simple Verbs", "Identify action words such as run, eat, read, write and play.", "Make five sentences using action words."],
        39: ["Describing Words", "Practise describing words such as big, small, hot, cold and happy.", "Describe five objects or people with one word each."],
        40: ["This and That", "Practise: This is a book. That is a chair.", "Make four sentences using this and that."],
        41: ["One and Many", "Practise singular and plural words: book/books, dog/dogs.", "Change five one-word examples into plural forms."],
        42: ["Review Sentences", "Review nouns, verbs, describing words and simple sentence patterns.", "Say or write five complete sentences."],
        43: ["Reading Aloud", "Read a short, familiar passage slowly and clearly.", "Read the passage aloud twice."],
        44: ["Finding Information", "Read a short passage and find names, places or objects in it.", "Answer three questions about what you read."],
        45: ["Main Idea", "Listen to or read a short passage and identify what it is mainly about.", "Tell a parent or teacher the main idea."],
        46: ["Sequencing", "Put three simple events in the correct order.", "Tell a short event sequence using first, next and last."],
        47: ["Story Words", "Learn beginning, middle and ending in a simple story.", "Tell a story with a beginning, middle and ending."],
        48: ["Reading Review", "Review reading aloud, finding information, main idea and sequencing.", "Read a short passage and answer three questions."],
        49: ["Writing My Name", "Practise writing your name clearly.", "Write your name three times with correct letter formation."],
        50: ["Writing Words", "Copy and write familiar words carefully.", "Write ten familiar English words."],
        51: ["Writing Sentences", "Write simple sentences using a capital letter and full stop.", "Write five complete sentences."],
        52: ["Capital Letters", "Practise capital letters at the beginning of sentences and names.", "Correct five sentences with missing capital letters."],
        53: ["Full Stops", "Practise using a full stop at the end of a statement.", "Add full stops to five sentences."],
        54: ["Writing Review", "Review names, words, sentences, capital letters and full stops.", "Write five sentences and check each one."],
        55: ["Speaking About Family", "Talk about family using simple complete sentences.", "Say five sentences about family members."],
        56: ["Speaking About School", "Talk about school, classroom objects and activities.", "Say five sentences about school."],
        57: ["Speaking About Home", "Talk about home, rooms and familiar objects.", "Say five sentences about home."],
        58: ["Listening and Responding", "Listen to simple questions and respond with complete sentences.", "Answer five simple questions aloud."],
        59: ["Monthly Review", "Review vocabulary, sounds, reading, writing, speaking and listening.", "Complete a mixed review of ten short activities."],
        60: ["Phonics Assessment", "Complete the mandatory Phonics Assessment before progressing beyond Day 60.", "Answer all assessment questions. A passed assessment unlocks the next stage."]
    };

    Object.keys(earlyDailyLessons).forEach(function (key) {
        const day = Number(key);
        const item = earlyDailyLessons[day];

        dailyLessons[day] = {
            title: item[0],
            activity: item[1],
            practice: item[2]
        };
    });


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
