
/* =========================================
   PACIFIC EDUCATION
   5-MINUTE INDEPENDENT PRACTICE
   VERSION 1.0.0
========================================= */

/*
   Purpose:
   - Provides a short 5-minute practice activity
     after the main daily English lesson.
   - Supports learners who need additional practice.
   - Keeps practice progress separate from lesson progress.
   - Does NOT change the daily lesson day number.
   - Suitable for parent, teacher and learner support.
   - Designed for future audio, games, accessibility
     and FEMIS integration.

   SECURITY:
   - Never store passwords.
   - Never store authentication credentials.
   - Never store payment information.
   - Never store API keys or payment secrets.
   - Do not expose confidential Pacific Education
     information through copy/paste.
*/

const PACIFIC_EDUCATION_FIVE_MINUTE_VERSION = "1.0.0";

const fiveMinutePracticeData = {

    default: {
        title: "5-Minute English Practice",
        activity:
            "Review today's English lesson for five minutes.",
        steps: [
            "Read today's lesson words or sentences.",
            "Say the words or sentences aloud.",
            "Practise one example.",
            "Try the activity again without help."
        ]
    },

    1: {
        title: "5-Minute Practice — English Words",
        activity:
            "Practise hello, goodbye and thank you.",
        steps: [
            "Say hello three times.",
            "Say goodbye three times.",
            "Say thank you three times.",
            "Use one word in a short sentence."
        ]
    },

    2: {
        title: "5-Minute Practice — Greetings",
        activity:
            "Practise English greetings.",
        steps: [
            "Say Hello!",
            "Say Good morning!",
            "Say How are you?",
            "Practise a short greeting with someone."
        ]
    },

    3: {
        title: "5-Minute Practice — My Name",
        activity:
            "Practise introducing yourself.",
        steps: [
            "Say My name is...",
            "Say your full name.",
            "Repeat the sentence three times.",
            "Ask someone their name."
        ]
    },

    4: {
        title: "5-Minute Practice — Family",
        activity:
            "Practise family words.",
        steps: [
            "Say mother.",
            "Say father.",
            "Say sister.",
            "Say brother.",
            "Make one sentence about your family."
        ]
    },

    5: {
        title: "5-Minute Practice — Colours",
        activity:
            "Review basic colour words.",
        steps: [
            "Find something red.",
            "Find something blue.",
            "Find something yellow.",
            "Find something green."
        ]
    },

    6: {
        title: "5-Minute Practice — Numbers",
        activity:
            "Practise counting from one to five.",
        steps: [
            "Say one.",
            "Say two.",
            "Say three.",
            "Say four.",
            "Say five.",
            "Count five objects."
        ]
    },

    7: {
        title: "5-Minute Practice — Week 1 Review",
        activity:
            "Review the English learned during Week 1.",
        steps: [
            "Say one greeting.",
            "Say your name.",
            "Name one family member.",
            "Name two colours.",
            "Count from one to five."
        ]
    },

    60: {
        title: "5-Minute Practice — Phonics Checkpoint",
        activity:
            "Prepare for the Day 60 Phonics Assessment.",
        steps: [
            "Say the beginning sound in cat.",
            "Say the beginning sound in sun.",
            "Say the beginning sound in dog.",
            "Blend /c/ /a/ /t/ to make cat.",
            "Practise until you feel ready for the assessment."
        ]
    },

    61: {
        title: "5-Minute Practice — Everyday Actions",
        activity:
            "Review action words.",
        steps: [
            "Say walk.",
            "Say run.",
            "Say sit.",
            "Say stand.",
            "Say jump.",
            "Demonstrate each action."
        ]
    },

    62: {
        title: "5-Minute Practice — Action Sentences",
        activity:
            "Practise sentences using I can.",
        steps: [
            "Say I can walk.",
            "Say I can run.",
            "Say I can sit.",
            "Say I can stand.",
            "Say I can jump."
        ]
    },

    63: {
        title: "5-Minute Practice — Things I Can Do",
        activity:
            "Create five sentences using I can.",
        steps: [
            "Make one I can sentence.",
            "Make a second sentence.",
            "Make a third sentence.",
            "Make a fourth sentence.",
            "Make a fifth sentence."
        ]
    }

};


/* =========================================
   GET PRACTICE FOR A DAY
========================================= */

function getFiveMinutePractice(dayNumber) {

    const day = parseInt(dayNumber, 10);

    if (
        !isNaN(day) &&
        fiveMinutePracticeData[day]
    ) {
        return fiveMinutePracticeData[day];
    }

    return {
        ...fiveMinutePracticeData.default,
        title:
            "5-Minute English Practice — Day " +
            (isNaN(day) ? "" : day)
    };

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

        return saved ? JSON.parse(saved) : {};

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

    } catch (error) {

        console.warn(
            "Pacific Education: practice history could not be saved."
        );

    }

}


/* =========================================
   PRACTICE STATUS
========================================= */

function getFiveMinutePracticeStatus(dayNumber) {

    const history =
        getFiveMinutePracticeHistory();

    const day =
        String(parseInt(dayNumber, 10));

    return history[day] || {
        completed: false
    };

}


/* =========================================
   START PRACTICE
========================================= */

function startFiveMinutePractice(dayNumber) {

    const day =
        parseInt(dayNumber, 10);

    if (
        isNaN(day) ||
        day < 1 ||
        day > 365
    ) {
        console.warn(
            "Pacific Education: invalid practice day."
        );
        return false;
    }

    const practice =
        getFiveMinutePractice(day);

    const event =
        new CustomEvent(
            "pacificEducationFiveMinutePracticeStarted",
            {
                detail: {
                    day: day,
                    title: practice.title,
                    version:
                        PACIFIC_EDUCATION_FIVE_MINUTE_VERSION
                }
            }
        );

    document.dispatchEvent(event);

    return true;

}


/* =========================================
   COMPLETE PRACTICE
========================================= */

function completeFiveMinutePractice(dayNumber) {

    const day =
        parseInt(dayNumber, 10);

    if (
        isNaN(day) ||
        day < 1 ||
        day > 365
    ) {
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

    saveFiveMinutePracticeHistory(history);

    document.dispatchEvent(
        new CustomEvent(
            "pacificEducationFiveMinutePracticeCompleted",
            {
                detail: {
                    day: day,
                    completed: true,
                    version:
                        PACIFIC_EDUCATION_FIVE_MINUTE_VERSION
                }
            }
        )
    );

    return true;

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
        parseInt(dayNumber, 10);

    const practice =
        getFiveMinutePractice(day);

    const status =
        getFiveMinutePracticeStatus(day);

    container.textContent = "";

    const title =
        document.createElement("h3");

    title.textContent =
        practice.title;

    container.appendChild(title);


    const activity =
        document.createElement("p");

    activity.textContent =
        practice.activity;

    container.appendChild(activity);


    const list =
        document.createElement("ol");

    practice.steps.forEach(function(step) {

        const item =
            document.createElement("li");

        item.textContent =
            step;

        list.appendChild(item);

    });

    container.appendChild(list);


    const button =
        document.createElement("button");

    button.type = "button";

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

                button.disabled = true;

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

    getPractice:
        getFiveMinutePractice,

    getStatus:
        getFiveMinutePracticeStatus,

    start:
        startFiveMinutePractice,

    complete:
        completeFiveMinutePractice,

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
                    PACIFIC_EDUCATION_FIVE_MINUTE_VERSION
            }
        }
    )
);
