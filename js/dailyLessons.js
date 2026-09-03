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
}


63: {
    title: "Things I Can Do",
    activity: "Practise: I can sit, stand, walk, run and jump.",
    practice: "Make five sentences using: I can..."
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
