/* =========================================
   PACIFIC EDUCATION
   DAILY LESSON ENGINE
   DAY 1 - DAY 365
========================================= */

const dailyLessons = {
       

    1: {
        title: "My First English Words",
        activity: "Learn and say: hello, goodbye, thank you.",
        practice: "Say each word aloud three times."
    },

    2: {
        title: "Greetings",
        activity: "Practise: Hello! Good morning! How are you?",
        practice: "Say the greeting to a parent, teacher or friend."
    },

    3: {
        title: "My Name",
        activity: "Practise: My name is ______.",
        practice: "Say your name using a complete sentence."
    },

    4: {
        title: "Family Words",
        activity: "Learn: mother, father, sister, brother.",
        practice: "Name the people in your family."
    },

    5: {
        title: "Colours",
        activity: "Learn: red, blue, yellow and green.",
        practice: "Find something around you for each colour."
    },

    6: {
        title: "Numbers 1–5",
        activity: "Practise counting from one to five.",
        practice: "Count five objects around you."
    },

    7: {
    title: "Review Week 1",
    activity: "Review greetings, names, family, colours and numbers.",
    practice: "Say five English words you learned this week."
},

61: {
    title: "Everyday Actions",
    activity: "Learn: walk, run, sit, stand and jump.",
    practice: "Say each action word and demonstrate the action."
},

62: {
    title: "Action Sentences",
    activity: "Practise: I can walk. I can run. I can jump.",
    practice: "Say each sentence aloud and demonstrate the action."
},

63: {
    title: "Things I Can Do",
    activity: "Practise: I can sit, stand, walk, run and jump.",
    practice: "Make five sentences using: I can..."
},

365: {
    title: "My English Learning Journey",
    activity: "Review the English words, sentences, sounds and skills you have learned.",
    practice: "Say what you can do in English and celebrate completing 365 days of learning."
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

    activity: "Learn five new English words about today's topic and practise using them in simple sentences.",

    practice: "Say the five new words aloud and make one sentence using each word."
},
    {
        start: 91,
        end: 120,
        title: "Reading & Understanding",
        activity: "Read a short English passage and identify the main idea.",
        practice: "Tell a parent or teacher what the passage was about."
    },

    {
        start: 121,
        end: 150,
        title: "Writing Skills",
        activity: "Practise writing clear English sentences about familiar topics.",
        practice: "Write five sentences and check your spelling."
    },

    {
        start: 151,
        end: 180,
        title: "Grammar Practice",
        activity: "Practise nouns, verbs, adjectives and correct sentence structure.",
        practice: "Write five sentences using today's grammar skill."
    },

    {
        start: 181,
        end: 210,
        title: "Speaking & Listening",
        activity: "Practise listening carefully and responding in complete English sentences.",
        practice: "Speak about your day for one minute."
    },

    {
        start: 211,
        end: 240,
        title: "Pacific Community English",
        activity: "Practise English using topics about family, school, village, community and Pacific life.",
        practice: "Describe something important in your community using five sentences."
    },

    {
        start: 241,
        end: 270,
        title: "Storytelling",
        activity: "Read, understand and create short English stories.",
        practice: "Tell a short story with a beginning, middle and ending."
    },

    {
        start: 271,
        end: 300,
        title: "Practical English",
        activity: "Practise English used in everyday situations such as shopping, travel, school and work.",
        practice: "Create a short conversation for today's situation."
    },

    {
        start: 301,
        end: 330,
        title: "English Review & Application",
        activity: "Review vocabulary, grammar, reading, writing, listening and speaking skills.",
        practice: "Complete a mixed English activity using several skills."
    },

    {
        start: 331,
        end: 364,
        title: "Final English Preparation",
        activity: "Strengthen your English skills through review, practice and independent learning.",
        practice: "Complete today's English activity and explain what you learned."
    }

];


for (let day = 64; day <= 364; day++) {

    const stage =
        lessonStages.find(function(stage) {

            return day >= stage.start &&
                   day <= stage.end;

        });

    
if (stage) {

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
            " — Day " + day,

        activity:
            stage.activity.replace(
                "today's topic",
                topic || "today's lesson"
            ),

        practice:
            stage.practice

    };

}
        };

    }

}
/* =========================================
   GET CURRENT DAILY LESSON
========================================= */

function getDailyLesson(dayNumber) {

    return dailyLessons[dayNumber] || {

        title: "Daily English Practice",

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
        document.getElementById("phonicsAssessmentDay60");

    if (!assessment) {
        return;
    }

    if (dayNumber === 60) {
        assessment.style.display = "block";
    } else {
        assessment.style.display = "none";
    }

}


/* =========================================
   DISPLAY TODAY'S LESSON
========================================= */

function displayDailyLesson() {

    let dayNumber =
        parseInt(
            localStorage.getItem("currentDayNumber") || "1",
            10
        );

    if (isNaN(dayNumber) || dayNumber < 1) {
        dayNumber = 1;
    }

    if (dayNumber > 365) {
        dayNumber = 365;
    }

    const lesson =
        getDailyLesson(dayNumber);
   updateDay60AssessmentVisibility(dayNumber);

    const day =
        document.getElementById("dailyLessonDay");

    const title =
        document.getElementById("dailyLessonTitle");

    const activity =
        document.getElementById("dailyLessonActivity");

    const practice =
        document.getElementById("dailyLessonPractice");


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
        practice.textContent =
            lesson.practice;
    }

}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayDailyLesson();

    }
);
