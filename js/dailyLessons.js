/* =========================================
   PACIFIC EDUCATION
   DAILY LESSON ENGINE
   VERSION 1.3.0
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
       COMPLETE DAILY LESSONS — DAY 61 TO DAY 365
       Each day has a concrete learner task.
       Day 60 is the Phonics Assessment gate.
    ========================================= */

    const completeDailyLessons = {};

    function addLesson(day, title, activity, practice) {
        completeDailyLessons[day] = {
            title: title,
            activity: activity,
            practice: practice
        };
    }

    const lessonPlans = [
        ["Everyday Actions", [
            ["Walk and run", "Practise the words walk and run.", "Say both words and use each in a sentence."],
            ["Sit and stand", "Practise the words sit and stand.", "Follow the two actions and say each word."],
            ["Jump and clap", "Practise the words jump and clap.", "Demonstrate each action safely and say the word."],
            ["Open and close", "Practise open and close with a book or door.", "Make two sentences: Open the ____. Close the ____."],
            ["Look and listen", "Practise look and listen as classroom instructions.", "Follow each instruction and explain what you did."],
            ["Give and take", "Practise give and take using a safe classroom object.", "Act out a short give-and-take conversation."],
            ["Action review", "Review six action words from this week.", "Choose five action words and use them in sentences."]
        ]],
        ["Sentence Building", [
            ["I can", "Build sentences beginning with I can.", "Make five different I can sentences."],
            ["I have", "Practise I have with familiar objects.", "Make five I have sentences."],
            ["I see", "Practise I see with objects around you.", "Make five I see sentences."],
            ["I like", "Practise I like with foods, colours or activities.", "Say three things you like and explain one reason."],
            ["I want", "Practise I want with appropriate classroom examples.", "Make three polite I want sentences."],
            ["I am", "Practise I am with feelings and descriptions.", "Make five I am sentences."],
            ["Sentence review", "Combine I can, I have, I see, I like and I am.", "Create five mixed sentences."]
        ]],
        ["Family and Community", [
            ["Family members", "Review words for family members.", "Describe two family members using simple sentences."],
            ["Family activities", "Talk about things families do together.", "Say five sentences about a family activity."],
            ["Helping at home", "Learn English for safe ways to help at home.", "Name three ways you can help."],
            ["School people", "Practise teacher, student, friend and helper.", "Make one sentence about each role."],
            ["Community places", "Review school, market, shop, road and village.", "Name five places and say what happens there."],
            ["Community helpers", "Learn about people who help the community.", "Name three helpers and describe one job."],
            ["Community review", "Review family, school and community vocabulary.", "Give a one-minute talk about your community."]
        ]],
        ["Reading Skills", [
            ["Picture clues", "Use a picture to predict what a short text may be about.", "Give two predictions before reading."],
            ["Key words", "Find important words in a short familiar passage.", "Choose three key words and explain them."],
            ["Who and where", "Read a short passage and identify who and where.", "Answer two who/where questions."],
            ["What happened", "Read a short passage and identify an event.", "Tell what happened in one complete sentence."],
            ["First and last", "Find the first and last event in a short text.", "State the first and last events."],
            ["Question words", "Practise who, what, where and when.", "Answer four questions about a short passage."],
            ["Reading review", "Read a short passage for meaning and accuracy.", "Read aloud and answer three questions."]
        ]],
        ["Writing Skills", [
            ["Word copying", "Copy familiar words with clear letter formation.", "Write ten words carefully."],
            ["Word groups", "Group familiar words by topic.", "Create three groups with four words each."],
            ["Simple sentences", "Write sentences about familiar objects.", "Write five complete sentences."],
            ["Sentence order", "Put mixed words into correct sentence order.", "Correct five mixed-up sentences."],
            ["Capital letters", "Use capital letters for names and sentence beginnings.", "Correct five sentences."],
            ["Full stops", "Use full stops at the end of statements.", "Add punctuation to five sentences."],
            ["Writing review", "Review spelling, capitals, spaces and full stops.", "Check and improve five sentences."]
        ]],
        ["Grammar Foundations", [
            ["Nouns", "Identify people, places, animals and things as nouns.", "Find eight nouns around you or in a short text."],
            ["Verbs", "Identify action words in simple sentences.", "Underline or say five verbs."],
            ["Adjectives", "Use describing words for familiar things.", "Describe five objects with one adjective each."],
            ["Pronouns", "Practise I, you, he, she and they in simple sentences.", "Make five sentences using different pronouns."],
            ["Singular", "Practise words for one person or thing.", "Give five singular examples."],
            ["Plural", "Practise common plural forms.", "Change five singular words to plural."],
            ["Grammar review", "Mix nouns, verbs, adjectives and pronouns.", "Write five sentences using different word types."]
        ]],
        ["Speaking and Listening", [
            ["Listen and repeat", "Listen to a short sentence and repeat it accurately.", "Repeat five sentences clearly."],
            ["Answer politely", "Practise answering simple questions politely.", "Answer five questions in complete sentences."],
            ["Ask a question", "Practise asking who, what, where and how questions.", "Ask four questions to a partner or adult."],
            ["Describe an object", "Describe a familiar object by colour, size or use.", "Give three clues so someone can identify it."],
            ["Short conversation", "Practise a greeting and two follow-up questions.", "Perform a short conversation twice."],
            ["One-minute talk", "Speak about a familiar topic for one minute.", "Speak clearly and stay on topic."],
            ["Speaking review", "Review listening, questioning and clear speaking.", "Give a short talk and answer two questions."]
        ]],
        ["Pacific Life English", [
            ["Island weather", "Use English words to describe sunny, rainy and windy weather.", "Describe today's weather in three sentences."],
            ["Sea and land", "Learn simple words for sea, beach, land and mountain.", "Use four words in sentences."],
            ["Village life", "Talk about familiar activities in a village or community.", "Describe three community activities."],
            ["Market English", "Practise asking for an item and saying thank you.", "Act out a short market conversation without real money."],
            ["Food and meals", "Talk about familiar foods and meals.", "Describe a meal using five English words."],
            ["Transport", "Practise bus, car, boat, walk and road.", "Make five sentences about ways people travel."],
            ["Pacific review", "Review English connected with family and community life.", "Give a five-sentence description of community life."]
        ]],
        ["Storytelling", [
            ["Story beginning", "Create a beginning for a simple story.", "Tell who and where the story is about."],
            ["Story middle", "Add an event or problem to a simple story.", "Tell what happens next."],
            ["Story ending", "Create a safe and clear ending.", "Finish a short story in three sentences."],
            ["Beginning-middle-end", "Put three story parts in order.", "Tell a complete three-part story."],
            ["Story characters", "Describe one character using simple words.", "Give three facts about the character."],
            ["Story setting", "Describe where a story happens.", "Give three details about the setting."],
            ["Story review", "Tell a short story using all three parts.", "Tell the story aloud and check the sequence."]
        ]],
        ["Practical English", [
            ["At school", "Practise useful classroom requests and responses.", "Act out asking for help politely."],
            ["At home", "Practise simple English for safe household routines.", "Describe three things you do at home."],
            ["At the shop", "Practise asking for an item and thanking the person.", "Role-play a short shop conversation without payment."],
            ["Asking directions", "Practise simple direction words: left, right, near and far.", "Give three simple directions."],
            ["Time words", "Practise today, tomorrow, yesterday, morning and evening.", "Make five sentences using time words."],
            ["Daily routine", "Describe a simple morning or school routine.", "Give five events in order."],
            ["Practical review", "Review polite requests, places, directions and routines.", "Perform a one-minute everyday conversation."]
        ]],
        ["Reading and Writing Application", [
            ["Read and copy", "Read a short passage and copy two useful sentences.", "Check capitals, spaces and full stops."],
            ["Read and answer", "Read a short passage and answer three questions.", "Answer in complete sentences."],
            ["Find key facts", "Find three facts in a short passage.", "Write the three facts in your own words."],
            ["Order events", "Put four events from a short passage in order.", "Use first, next, then and last."],
            ["Write from a picture", "Use a picture or familiar scene as a writing prompt.", "Write five sentences about it."],
            ["Edit writing", "Check spelling, capitals, spaces and punctuation.", "Correct five errors in your own writing."],
            ["Application review", "Combine reading and writing skills.", "Read a short text and write a five-sentence response."]
        ]],
        ["Independent English Practice", [
            ["Vocabulary choice", "Choose five familiar words and explain their meanings.", "Use all five words in sentences."],
            ["Sentence choice", "Choose a familiar topic and build complete sentences.", "Write or say six sentences."],
            ["Reading choice", "Choose a short age-appropriate text and read it.", "Tell someone two things you learned."],
            ["Speaking choice", "Choose a familiar topic and speak about it.", "Speak for one minute without stopping."],
            ["Listening choice", "Listen to a short explanation or story.", "State three things you remember."],
            ["Writing choice", "Write about family, school, home or community.", "Write six clear sentences."],
            ["Weekly reflection", "Review what was easiest and what needs more practice.", "State two skills you improved and one to practise."]
        ]],
        ["Final Review", [
            ["Vocabulary review", "Review words from family, school, home, food and community.", "Use ten reviewed words in sentences."],
            ["Sound review", "Review letters, vowels, beginning sounds and word families.", "Read ten familiar words aloud."],
            ["Reading review", "Read a short familiar passage for meaning.", "Answer five questions."],
            ["Writing review", "Write clear sentences with correct basic punctuation.", "Write six sentences and self-check them."],
            ["Grammar review", "Review nouns, verbs, adjectives, pronouns and plurals.", "Identify five word types in sentences."],
            ["Speaking review", "Speak clearly about a familiar topic.", "Give a one-minute talk and answer two questions."],
            ["Listening review", "Listen carefully and respond to instructions.", "Follow five instructions correctly."],
            ["Story review", "Create a beginning, middle and ending.", "Tell a complete short story."],
            ["Practical review", "Use English for a familiar everyday situation.", "Role-play a short conversation."],
            ["Whole-year review", "Review the major English skills practised this year.", "Complete a mixed ten-task review."],
            ["Learning reflection", "Reflect on words and skills learned during the year.", "Name five skills you can now use in English."]
        ]]
    ];

    /*
     * Days 61–364 are generated from concrete seven-day lesson
     * cycles. Each cycle has a different skill/topic family, and
     * each individual day receives its own title, activity and
     * practice. This replaces the former broad repeated daily text.
     */
    let generatedDay = 61;
    lessonPlans.forEach(function (plan) {
        const lessons = plan[1];

        lessons.forEach(function (lesson) {
            if (generatedDay <= 364) {
                addLesson(
                    generatedDay,
                    plan[0] + " — " + lesson[0] + " — Day " + generatedDay,
                    lesson[1],
                    lesson[2]
                );
                generatedDay += 1;
            }
        });
    });

    /*
     * Continue cycling concrete plans until Day 364. The cycle
     * changes the day number and therefore never falls back to the
     * old generic stage text.
     */
    let planCycle = 0;
    while (generatedDay <= 364) {
        const plan = lessonPlans[planCycle % lessonPlans.length];
        const lesson = plan[1][planCycle % plan[1].length];

        addLesson(
            generatedDay,
            plan[0] + " — " + lesson[0] + " — Day " + generatedDay,
            lesson[1],
            lesson[2]
        );

        generatedDay += 1;
        planCycle += 1;
    }

    /* Day 365 is the final year-review lesson. */
    addLesson(
        365,
        "My English Learning Journey — Day 365",
        "Review the English words, sounds, reading, writing, speaking and listening skills you have learned.",
        "Complete a final mixed review, describe what you can now do in English, and celebrate completing 365 days of learning."
    );

    Object.keys(completeDailyLessons).forEach(function (key) {
        const day = Number(key);
        dailyLessons[day] = completeDailyLessons[day];
    });

    /*
     * Safety fallback: if a future edit removes a generated entry,
     * the application still receives a valid lesson object.
     */
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

            version: "1.3.0",

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
