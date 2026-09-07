/* =========================================
   PACIFIC EDUCATION
   5-MINUTE INDEPENDENT PRACTICE
   VERSION 2.0.0
   365-DAY CURRICULUM
========================================= */

/*
   PURPOSE
   - Provides a short independent practice activity
     after the main daily English lesson.
   - Covers Days 1–365.
   - Supports learners who need additional practice.
   - Keeps practice progress separate from lesson progress.
   - Does NOT change the daily lesson day number.
   - Supports learner, parent and teacher use.
   - Designed for future audio, games, accessibility,
     teacher monitoring and FEMIS integration.

   CURRICULUM PRINCIPLES
   - Daily practice should normally take about 5 minutes.
   - Activities progress from simple to more advanced.
   - Activities include speaking, listening, reading,
     phonics, vocabulary, grammar, writing and review.
   - Weekly review is included.
   - Assessment checkpoint days are protected.
   - Practice should reinforce the daily lesson rather
     than replace the daily lesson.

   SECURITY
   - NEVER store passwords.
   - NEVER store authentication credentials.
   - NEVER store payment information.
   - NEVER store API keys or payment secrets.
   - NEVER place confidential account information
     into practice activities.
   - Confidential Pacific Education information must
     not be copied or pasted outside the application.
   - The application should warn users before displaying
     or handling confidential information.
*/

const PACIFIC_EDUCATION_FIVE_MINUTE_VERSION = "2.0.0";

const PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY = 365;


/* =========================================
   SAFE DAY NORMALISATION
========================================= */

function normaliseFiveMinuteDay(dayNumber) {

    const day = parseInt(dayNumber, 10);

    if (
        isNaN(day) ||
        day < 1 ||
        day > PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY
    ) {
        return null;
    }

    return day;
}


/* =========================================
   CURRICULUM WORD BANKS
========================================= */

const fiveMinuteWordBanks = {

    greetings: [
        "hello",
        "good morning",
        "good afternoon",
        "goodbye",
        "thank you",
        "please",
        "sorry",
        "welcome"
    ],

    family: [
        "mother",
        "father",
        "sister",
        "brother",
        "grandmother",
        "grandfather",
        "family",
        "child"
    ],

    colours: [
        "red",
        "blue",
        "yellow",
        "green",
        "black",
        "white",
        "orange",
        "purple"
    ],

    numbers: [
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten"
    ],

    classroom: [
        "book",
        "pen",
        "pencil",
        "desk",
        "chair",
        "bag",
        "teacher",
        "student"
    ],

    actions: [
        "walk",
        "run",
        "sit",
        "stand",
        "jump",
        "read",
        "write",
        "listen",
        "speak",
        "look"
    ],

    home: [
        "house",
        "door",
        "window",
        "room",
        "bed",
        "table",
        "chair",
        "kitchen"
    ],

    nature: [
        "sun",
        "rain",
        "wind",
        "tree",
        "flower",
        "water",
        "river",
        "sea"
    ],

    food: [
        "rice",
        "fish",
        "fruit",
        "bread",
        "water",
        "milk",
        "banana",
        "coconut"
    ],

    community: [
        "school",
        "village",
        "community",
        "market",
        "clinic",
        "road",
        "church",
        "shop"
    ],

    phonics: [
        "cat",
        "dog",
        "sun",
        "fish",
        "map",
        "pen",
        "pig",
        "top",
        "cup",
        "red"
    ],

    adjectives: [
        "big",
        "small",
        "hot",
        "cold",
        "fast",
        "slow",
        "happy",
        "sad",
        "clean",
        "dirty"
    ],

    verbs: [
        "eat",
        "drink",
        "play",
        "read",
        "write",
        "walk",
        "run",
        "help",
        "learn",
        "work"
    ]
};


/* =========================================
   PHONICS DATA
========================================= */

const fiveMinutePhonics = {

    1: {
        sound: "a",
        examples: ["apple", "ant"]
    },

    2: {
        sound: "b",
        examples: ["ball", "bat"]
    },

    3: {
        sound: "c",
        examples: ["cat", "cup"]
    },

    4: {
        sound: "d",
        examples: ["dog", "duck"]
    },

    5: {
        sound: "e",
        examples: ["egg", "elephant"]
    },

    6: {
        sound: "f",
        examples: ["fish", "fan"]
    },

    7: {
        sound: "g",
        examples: ["goat", "gum"]
    },

    8: {
        sound: "h",
        examples: ["hat", "hen"]
    },

    9: {
        sound: "i",
        examples: ["igloo", "ink"]
    },

    10: {
        sound: "j",
        examples: ["jam", "jug"]
    },

    11: {
        sound: "k",
        examples: ["kite", "king"]
    },

    12: {
        sound: "l",
        examples: ["lion", "leg"]
    },

    13: {
        sound: "m",
        examples: ["map", "man"]
    },

    14: {
        sound: "n",
        examples: ["net", "nose"]
    },

    15: {
        sound: "o",
        examples: ["orange", "ox"]
    },

    16: {
        sound: "p",
        examples: ["pig", "pen"]
    },

    17: {
        sound: "q",
        examples: ["queen", "quiz"]
    },

    18: {
        sound: "r",
        examples: ["rat", "red"]
    },

    19: {
        sound: "s",
        examples: ["sun", "sock"]
    },

    20: {
        sound: "t",
        examples: ["top", "ten"]
    },

    21: {
        sound: "u",
        examples: ["up", "umbrella"]
    },

    22: {
        sound: "v",
        examples: ["van", "vet"]
    },

    23: {
        sound: "w",
        examples: ["wet", "web"]
    },

    24: {
        sound: "x",
        examples: ["fox", "box"]
    },

    25: {
        sound: "y",
        examples: ["yes", "yellow"]
    },

    26: {
        sound: "z",
        examples: ["zoo", "zip"]
    }
};


/* =========================================
   CURRICULUM STAGES
========================================= */

const fiveMinuteStages = [

    {
        min: 1,
        max: 30,
        name: "Foundation English",
        focus: "letters, sounds, greetings, numbers and basic words"
    },

    {
        min: 31,
        max: 60,
        name: "Early Phonics",
        focus: "letter sounds, blending and simple words"
    },

    {
        min: 61,
        max: 90,
        name: "Everyday English",
        focus: "actions, people, objects and simple sentences"
    },

    {
        min: 91,
        max: 120,
        name: "Vocabulary Building",
        focus: "home, school, food, nature and community vocabulary"
    },

    {
        min: 121,
        max: 150,
        name: "Sentence Building",
        focus: "simple sentences, questions and answers"
    },

    {
        min: 151,
        max: 180,
        name: "Grammar Foundations",
        focus: "nouns, verbs, adjectives, pronouns and sentence order"
    },

    {
        min: 181,
        max: 210,
        name: "Reading Development",
        focus: "short texts, comprehension and vocabulary"
    },

    {
        min: 211,
        max: 240,
        name: "Writing Development",
        focus: "sentences, descriptions and short paragraphs"
    },

    {
        min: 241,
        max: 270,
        name: "Communication Skills",
        focus: "speaking, listening, questions and conversation"
    },

    {
        min: 271,
        max: 300,
        name: "Pacific English Practice",
        focus: "everyday Pacific contexts and Standard English development"
    },

    {
        min: 301,
        max: 330,
        name: "Intermediate English",
        focus: "grammar, comprehension, vocabulary and writing"
    },

    {
        min: 331,
        max: 365,
        name: "Consolidation and Mastery",
        focus: "review, communication, reading and independent English"
    }
];


/* =========================================
   GET CURRICULUM STAGE
========================================= */

function getFiveMinuteStage(day) {

    for (let i = 0; i < fiveMinuteStages.length; i++) {

        if (
            day >= fiveMinuteStages[i].min &&
            day <= fiveMinuteStages[i].max
        ) {
            return fiveMinuteStages[i];
        }

    }

    return fiveMinuteStages[
        fiveMinuteStages.length - 1
    ];
}


/* =========================================
   WEEK NUMBER
========================================= */

function getFiveMinuteWeek(day) {

    return Math.ceil(day / 7);
}


/* =========================================
   DAY OF WEEK IN CURRICULUM
========================================= */

function getFiveMinuteDayOfWeek(day) {

    const position = ((day - 1) % 7) + 1;

    return position;
}


/* =========================================
   DAILY CURRICULUM GENERATOR
========================================= */

function generateFiveMinutePractice(day) {

    const stage =
        getFiveMinuteStage(day);

    const week =
        getFiveMinuteWeek(day);

    const weekDay =
        getFiveMinuteDayOfWeek(day);

    /*
       Every seventh curriculum day is a review.
       This creates regular reinforcement without
       requiring 365 separate hard-coded objects.
    */

    if (weekDay === 7) {

        return {

            title:
                "5-Minute Practice — Week " +
                week +
                " Review",

            activity:
                "Review the English skills practised this week.",

            steps: [

                "Review three words from this week's lessons.",

                "Say the words aloud.",

                "Read one sentence from this week's learning.",

                "Make one new sentence using a word you remember.",

                "Explain one thing you learned this week."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "weekly-review"

        };

    }


    /* =====================================
       FOUNDATION STAGE
    ===================================== */

    if (day <= 30) {

        const word =
            fiveMinuteWordBanks.greetings[
                (day - 1) %
                fiveMinuteWordBanks.greetings.length
            ];

        return {

            title:
                "5-Minute Practice — Foundation English",

            activity:
                "Practise a basic English word or phrase.",

            steps: [

                "Look at the word: " + word + ".",

                "Say the word three times.",

                "Spell the word if you can.",

                "Use the word in a short sentence.",

                "Say your sentence aloud."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "foundation"

        };

    }


    /* =====================================
       EARLY PHONICS
    ===================================== */

    if (day <= 59) {

        const phonicsDay =
            ((day - 31) % 26) + 1;

        const phonics =
            fiveMinutePhonics[phonicsDay];

        return {

            title:
                "5-Minute Practice — Phonics",

            activity:
                "Practise the sound /" +
                phonics.sound +
                "/.",

            steps: [

                "Say the sound /" +
                phonics.sound +
                "/.",

                "Say " +
                phonics.examples[0] +
                ".", 

                "Say " +
                phonics.examples[1] +
                ".", 

                "Listen for the target sound.",

                "Practise the sound and words again."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "phonics"

        };

    }


    /* =====================================
       DAY 60 CHECKPOINT
    ===================================== */

    if (day === 60) {

        return {

            title:
                "5-Minute Practice — Phonics Checkpoint",

            activity:
                "Prepare for the Day 60 Phonics Assessment.",

            steps: [

                "Say the beginning sound in cat.",

                "Say the beginning sound in sun.",

                "Say the beginning sound in dog.",

                "Blend /c/ /a/ /t/ to make cat.",

                "Practise until you feel ready for the assessment."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "assessment-preparation",
            assessmentDay: 60

        };

    }


    /* =====================================
       EVERYDAY ENGLISH
    ===================================== */

    if (day <= 90) {

        const action =
            fiveMinuteWordBanks.actions[
                (day - 61) %
                fiveMinuteWordBanks.actions.length
            ];

        return {

            title:
                "5-Minute Practice — Everyday Actions",

            activity:
                "Practise using an action word in English.",

            steps: [

                "Say the word: " + action + ".",

                "Show the action if possible.",

                "Say: I can " +
                action +
                ".",

                "Repeat the sentence three times.",

                "Make one new sentence using the word."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "everyday-english"

        };

    }


    /* =====================================
       VOCABULARY
    ===================================== */

    if (day <= 120) {

        const groups = [
            fiveMinuteWordBanks.family,
            fiveMinuteWordBanks.home,
            fiveMinuteWordBanks.food,
            fiveMinuteWordBanks.nature,
            fiveMinuteWordBanks.community
        ];

        const group =
            groups[
                (day - 91) %
                groups.length
            ];

        const word =
            group[
                Math.floor(
                    (day - 91) /
                    groups.length
                ) %
                group.length
            ];

        return {

            title:
                "5-Minute Practice — Vocabulary",

            activity:
                "Learn and use one everyday English word.",

            steps: [

                "Say the word: " + word + ".",

                "Explain what the word means.",

                "Spell the word.",

                "Use the word in a sentence.",

                "Say your sentence aloud."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "vocabulary"

        };

    }


    /* =====================================
       SENTENCE BUILDING
    ===================================== */

    if (day <= 150) {

        const subjects = [
            "I",
            "We",
            "You",
            "He",
            "She",
            "They"
        ];

        const subject =
            subjects[
                (day - 121) %
                subjects.length
            ];

        const verb =
            fiveMinuteWordBanks.verbs[
                Math.floor(
                    (day - 121) /
                    subjects.length
                ) %
                fiveMinuteWordBanks.verbs.length
            ];

        return {

            title:
                "5-Minute Practice — Sentence Building",

            activity:
                "Build and say a complete English sentence.",

            steps: [

                "Start with: " +
                subject +
                ".",

                "Add an action word: " +
                verb +
                ".",

                "Make the sentence: " +
                subject +
                " " +
                verb +
                ".",

                "Say the sentence three times.",

                "Create one different sentence."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "sentence-building"

        };

    }


    /* =====================================
       GRAMMAR
    ===================================== */

    if (day <= 180) {

        const grammarSkills = [

            "nouns",
            "verbs",
            "pronouns",
            "adjectives",
            "singular and plural words",
            "capital letters",
            "full stops",
            "question marks",
            "present tense",
            "sentence order"

        ];

        const skill =
            grammarSkills[
                (day - 151) %
                grammarSkills.length
            ];

        return {

            title:
                "5-Minute Practice — Grammar",

            activity:
                "Practise " + skill + " in English.",

            steps: [

                "Name the grammar skill: " +
                skill +
                ".",

                "Think of one example.",

                "Say the example aloud.",

                "Write the example if appropriate.",

                "Check that the sentence makes sense."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "grammar"

        };

    }


    /* =====================================
       READING
    ===================================== */

    if (day <= 210) {

        return {

            title:
                "5-Minute Practice — Reading",

            activity:
                "Read a short English passage and show understanding.",

            steps: [

                "Read a short sentence or paragraph.",

                "Read it aloud.",

                "Identify one important word.",

                "Explain what the sentence means.",

                "Tell someone one thing you learned."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "reading"

        };

    }


    /* =====================================
       WRITING
    ===================================== */

    if (day <= 240) {

        return {

            title:
                "5-Minute Practice — Writing",

            activity:
                "Practise writing clear English.",

            steps: [

                "Choose one familiar topic.",

                "Write one complete sentence.",

                "Check the first letter is capitalised.",

                "Check the sentence has correct punctuation.",

                "Read your sentence aloud."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "writing"

        };

    }


    /* =====================================
       COMMUNICATION
    ===================================== */

    if (day <= 270) {

        const questions = [

            "What is your name?",

            "How are you today?",

            "What do you like?",

            "What did you learn today?",

            "What is your favourite activity?",

            "Who helps you at school?",

            "What can you do well?"

        ];

        const question =
            questions[
                (day - 241) %
                questions.length
            ];

        return {

            title:
                "5-Minute Practice — Communication",

            activity:
                "Practise answering an English question.",

            steps: [

                "Read the question: " +
                question,

                "Think about your answer.",

                "Answer using a complete sentence.",

                "Say your answer aloud.",

                "Ask yourself one related question."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "communication"

        };

    }


    /* =====================================
       PACIFIC ENGLISH → STANDARD ENGLISH
    ===================================== */

    if (day <= 300) {

        return {

            title:
                "5-Minute Practice — Pacific English to Standard English",

            activity:
                "Practise clear English for everyday communication.",

            steps: [

                "Think of an English expression you use every day.",

                "Say it clearly.",

                "Think about how it would be expressed in Standard English.",

                "Practise the Standard English sentence.",

                "Use the sentence in a real conversation."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "pacific-standard-english"

        };

    }


    /* =====================================
       INTERMEDIATE ENGLISH
    ===================================== */

    if (day <= 330) {

        const skills = [

            "reading comprehension",
            "sentence structure",
            "vocabulary",
            "grammar",
            "speaking",
            "writing",
            "listening",
            "summarising"

        ];

        const skill =
            skills[
                (day - 301) %
                skills.length
            ];

        return {

            title:
                "5-Minute Practice — Intermediate English",

            activity:
                "Strengthen your " +
                skill +
                " skills.",

            steps: [

                "Practise one " +
                skill +
                " activity.",

                "Say or write your answer.",

                "Check your English carefully.",

                "Correct one mistake if you find one.",

                "Repeat the improved answer."

            ],

            stage: stage.name,
            week: week,
            day: day,
            type: "intermediate"

        };

    }


    /* =====================================
       FINAL CONSOLIDATION
    ===================================== */

    return {

        title:
            "5-Minute Practice — English Mastery",

        activity:
            "Review and apply the English skills you have learned.",

        steps: [

            "Choose one English skill you have learned.",

            "Practise it for one minute.",

            "Read or say your example aloud.",

            "Create a new example independently.",

            "Explain what you learned."

        ],

        stage: stage.name,
        week: week,
        day: day,
        type: "mastery"

    };

}


/* =========================================
   GET PRACTICE FOR A DAY
========================================= */

function getFiveMinutePractice(dayNumber) {

    const day =
        normaliseFiveMinuteDay(dayNumber);

    if (day === null) {

        return {

            title:
                "5-Minute English Practice",

            activity:
                "Please select a valid practice day from Day 1 to Day 365.",

            steps: [

                "Select a valid day.",

                "Read the practice activity.",

                "Practise the activity aloud.",

                "Complete the activity.",

                "Review your learning."

            ],

            stage: "Invalid day",
            week: null,
            day: null,
            type: "invalid"

        };

    }

    return generateFiveMinutePractice(day);
}


/* =========================================
   PRACTICE STORAGE
========================================= */

function getFiveMinutePracticeHistory() {

    try {

        const saved =
            localStorage.getItem(
                "pacificEducationFiveMinutePractice"
            );

        if (!saved) {
            return {};
        }

        const history =
            JSON.parse(saved);

        if (
            !history ||
            typeof history !== "object" ||
            Array.isArray(history)
        ) {
            return {};
        }

        return history;

    } catch (error) {

        console.warn(
            "Pacific Education: practice history could not be loaded."
        );

        return {};

    }

}


function saveFiveMinutePracticeHistory(history) {

    try {

        localStorage.setItem(
            "pacificEducationFiveMinutePractice",
            JSON.stringify(history)
        );

        return true;

    } catch (error) {

        console.warn(
            "Pacific Education: practice history could not be saved."
        );

        return false;

    }

}


/* =========================================
   PRACTICE STATUS
========================================= */

function getFiveMinutePracticeStatus(dayNumber) {

    const day =
        normaliseFiveMinuteDay(dayNumber);

    if (day === null) {

        return {

            completed: false,
            valid: false

        };

    }

    const history =
        getFiveMinutePracticeHistory();

    return history[String(day)] || {

        completed: false,
        valid: true,
        day: day

    };

}


/* =========================================
   PRACTICE PROGRESS SUMMARY
========================================= */

function getFiveMinutePracticeProgress() {

    const history =
        getFiveMinutePracticeHistory();

    let completedDays = 0;

    for (
        let day = 1;
        day <= PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY;
        day++
    ) {

        const record =
            history[String(day)];

        if (
            record &&
            record.completed === true
        ) {
            completedDays++;
        }

    }

    return {

        completedDays: completedDays,

        totalDays:
            PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY,

        remainingDays:
            PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY -
            completedDays,

        percentage:
            Math.round(
                (
                    completedDays /
                    PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY
                ) * 100
            )

    };

}


/* =========================================
   START PRACTICE
========================================= */

function startFiveMinutePractice(dayNumber) {

    const day =
        normaliseFiveMinuteDay(dayNumber);

    if (day === null) {

        console.warn(
            "Pacific Education: invalid practice day."
        );

        return false;

    }

    const practice =
        getFiveMinutePractice(day);

    document.dispatchEvent(

        new CustomEvent(
            "pacificEducationFiveMinutePracticeStarted",
            {
                detail: {

                    day: day,

                    title:
                        practice.title,

                    type:
                        practice.type,

                    stage:
                        practice.stage,

                    version:
                        PACIFIC_EDUCATION_FIVE_MINUTE_VERSION

                }
            }
        )

    );

    return true;

}


/* =========================================
   COMPLETE PRACTICE
========================================= */

function completeFiveMinutePractice(dayNumber) {

    const day =
        normaliseFiveMinuteDay(dayNumber);

    if (day === null) {
        return false;
    }

    const history =
        getFiveMinutePracticeHistory();

    history[String(day)] = {

        completed: true,

        completedAt:
            new Date().toISOString(),

        version:
            PACIFIC_EDUCATION_FIVE_MINUTE_VERSION

    };

    const saved =
        saveFiveMinutePracticeHistory(history);

    if (!saved) {
        return false;
    }

    document.dispatchEvent(

        new CustomEvent(
            "pacificEducationFiveMinutePracticeCompleted",
            {
                detail: {

                    day: day,

                    completed: true,

                    progress:
                        getFiveMinutePracticeProgress(),

                    version:
                        PACIFIC_EDUCATION_FIVE_MINUTE_VERSION

                }
            }
        )

    );

    return true;

}


/* =========================================
   RESET ONE DAY
========================================= */

function resetFiveMinutePracticeDay(dayNumber) {

    const day =
        normaliseFiveMinuteDay(dayNumber);

    if (day === null) {
        return false;
    }

    const history =
        getFiveMinutePracticeHistory();

    delete history[String(day)];

    return saveFiveMinutePracticeHistory(history);

}


/* =========================================
   RESET ALL PRACTICE
========================================= */

function resetFiveMinutePracticeHistory() {

    try {

        localStorage.removeItem(
            "pacificEducationFiveMinutePractice"
        );

        return true;

    } catch (error) {

        console.warn(
            "Pacific Education: practice history could not be reset."
        );

        return false;

    }

}


/* =========================================
   RENDER PRACTICE
========================================= */

function renderFiveMinutePractice(
    container,
    dayNumber
) {

    if (!container) {
        return;
    }

    const day =
        normaliseFiveMinuteDay(dayNumber);

    const practice =
        getFiveMinutePractice(day);

    const status =
        getFiveMinutePracticeStatus(day);

    container.textContent = "";


    /* =====================================
       TITLE
    ===================================== */

    const title =
        document.createElement("h3");

    title.textContent =
        practice.title;

    container.appendChild(title);


    /* =====================================
       SAFETY NOTICE
    ===================================== */

    const warning =
        document.createElement("div");

    warning.setAttribute(
        "role",
        "note"
    );

    warning.setAttribute(
        "aria-label",
        "Pacific Education safety notice"
    );

    warning.textContent =
        "Safety notice: Never copy or paste passwords, payment details, authentication codes, API keys, or other confidential Pacific Education information outside the app.";

    container.appendChild(warning);


    /* =====================================
       ACTIVITY
    ===================================== */

    const activity =
        document.createElement("p");

    activity.textContent =
        practice.activity;

    container.appendChild(activity);


    /* =====================================
       STAGE INFORMATION
    ===================================== */

    const stage =
        document.createElement("p");

    stage.textContent =
        "Learning stage: " +
        (practice.stage || "English practice");

    container.appendChild(stage);


    /* =====================================
       INSTRUCTIONS
    ===================================== */

    const list =
        document.createElement("ol");

    practice.steps.forEach(
        function(step) {

            const item =
                document.createElement("li");

            item.textContent =
                step;

            list.appendChild(item);

        }
    );

    container.appendChild(list);


    /* =====================================
       COMPLETION STATUS
    ===================================== */

    const statusText =
        document.createElement("p");

    statusText.setAttribute(
        "aria-live",
        "polite"
    );

    statusText.textContent =
        status.completed
            ? "Status: Completed"
            : "Status: Not completed";

    container.appendChild(statusText);


    /* =====================================
       COMPLETE BUTTON
    ===================================== */

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.textContent =
        status.completed
            ? "5-Minute Practice Completed"
            : "Complete 5-Minute Practice";

    button.disabled =
        status.completed;


    button.addEventListener(
        "click",
        function() {

            if (
                completeFiveMinutePractice(day)
            ) {

                button.textContent =
                    "5-Minute Practice Completed";

                button.disabled =
                    true;

                statusText.textContent =
                    "Status: Completed";

            }

        }
    );


    container.appendChild(button);

}


/* =========================================
   PUBLIC API
========================================= */

window.PacificEducationFiveMinutePractice = {

    version:
        PACIFIC_EDUCATION_FIVE_MINUTE_VERSION,

    maxDay:
        PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY,

    getPractice:
        getFiveMinutePractice,

    getStatus:
        getFiveMinutePracticeStatus,

    getProgress:
        getFiveMinutePracticeProgress,

    getStage:
        getFiveMinuteStage,

    start:
        startFiveMinutePractice,

    complete:
        completeFiveMinutePractice,

    resetDay:
        resetFiveMinutePracticeDay,

    resetAll:
        resetFiveMinutePracticeHistory,

    render:
        renderFiveMinutePractice

};


/* =========================================
   READY EVENT
========================================= */

document.dispatchEvent(

    new CustomEvent(
        "pacificEducationFiveMinutePracticeLoaded",
        {
            detail: {

                version:
                    PACIFIC_EDUCATION_FIVE_MINUTE_VERSION,

                totalDays:
                    PACIFIC_EDUCATION_FIVE_MINUTE_MAX_DAY

            }
        }
    )

);
