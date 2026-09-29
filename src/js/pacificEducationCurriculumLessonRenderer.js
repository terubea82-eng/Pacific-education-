/*
 * Pacific Education
 * Curriculum Lesson Renderer
 * Version 1.2.0
 */
(function(window) {
    "use strict";

    var VERSION = "1.7.0";
    var originalDisplay = null;
    var connected = false;

    function engine() { return window.PacificEducationDailyCurriculumEngine || null; }
    function bridge() { return window.PacificEducationCurriculumDailyLessonsBridge || null; }

    function getDay() {
        var daily = window.PacificEducationDailyLessons;
        if (daily && typeof daily.getCurrentCoreDay === "function") return daily.getCurrentCoreDay();
        var value = Number.parseInt(window.localStorage.getItem("currentDayNumber") || "1", 10);
        return Number.isInteger(value) && value >= 1 && value <= 365 ? value : 1;
    }
    function getLevel() { return window.localStorage.getItem("pacificEducationLevel") || "Class 1"; }
    function getSubject() { return window.localStorage.getItem("pacificEducationSubject") || "English"; }
    function getTerm() { return window.localStorage.getItem("pacificEducationTerm") || "Term 1"; }
    function getCapability() { return window.localStorage.getItem("pacificEducationCapability") || "expected"; }
    function setText(id, value) { var element = document.getElementById(id); if (element) element.textContent = value == null ? "" : String(value); }

    function activityTypeForDay(day) {
        var types = window.PacificEducationActivityTypes || ["multiple_choice", "true_false", "matching", "short_answer", "long_answer"];
        var capability = getCapability();
        var preferred = { remedial: "multiple_choice", developing: "true_false", expected: "short_answer", advanced: "long_answer" }[capability];
        if (preferred && types.indexOf(preferred) >= 0) return preferred;
        return types[(Math.max(1, Number(day) || 1) - 1) % types.length];
    }

    function attachActivity(day, lesson) {
        var activity = window.PacificEducationActivity;
        var container = document.getElementById("dailyLesson");
        if (!container) return false;
        var old = document.getElementById("pacificInteractiveActivity");
        if (old) old.remove();

        var box = document.createElement("section");
        box.id = "pacificInteractiveActivity";
        box.setAttribute("aria-label", "Daily learner activities");
        box.style.marginTop = "1rem";

        var heading = document.createElement("h3");
        heading.textContent = "Daily Activities — Day " + day;
        box.appendChild(heading);

        var question = lesson && lesson.activity && lesson.activity.questionText
            ? lesson.activity.questionText
            : lesson && lesson.activities && lesson.activities[0] && lesson.activities[0].questionText
                ? lesson.activities[0].questionText
                : "Complete today's curriculum activity.";
        var audioText = lesson && lesson.activity && lesson.activity.audioText
            ? lesson.activity.audioText
            : lesson && lesson.activities && lesson.activities[0] && lesson.activities[0].audioText
                ? lesson.activities[0].audioText
                : question;

        var source = document.createElement("p");
        source.textContent = "Curriculum activity: " + question;
        box.appendChild(source);

        var audio = document.createElement("button");
        audio.type = "button";
        audio.textContent = "🔊 Listen to curriculum question";
        audio.addEventListener("click", function() {
            if (typeof window.speakText === "function") window.speakText(String(audioText));
            else if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(String(audioText)));
            }
        });
        box.appendChild(audio);

        var types = window.PacificEducationActivityTypes || ["multiple_choice","true_false","matching","short_answer","long_answer"];
        var recommended = activityTypeForDay(day);

        types.forEach(function(type) {
            var card = document.createElement("article");
            card.style.margin = "0.6rem 0";
            card.style.padding = "0.7rem";
            card.style.border = "1px solid #ccc";
            var title = document.createElement("h4");
            title.textContent = (activity && activity.labels && activity.labels[type] ? activity.labels[type] : type) + (type === recommended ? " — Recommended" : "");
            card.appendChild(title);

            var button = document.createElement("button");
            button.type = "button";
            button.textContent = "Start " + (activity && activity.labels && activity.labels[type] ? activity.labels[type] : type);
            button.disabled = !activity || typeof activity.render !== "function";
            button.addEventListener("click", function() {
                if (activity && typeof activity.render === "function") {
                    var context = Object.assign({}, lesson || {});
                    context.activity = context.activity || {};
                    context.activity.questionText = question;
                    context.activity.audioText = audioText;
                    context.activity.contentBasis = (lesson && lesson.activity && lesson.activity.contentBasis) || "concept-based-pilot-prototype";
                    context.questionText = question;
                    context.audioText = audioText;
                    context.responseMode = "text-or-audio";
                    activity.render(type, day, context);
                }
            });
            card.appendChild(button);
            box.appendChild(card);
        });

        container.appendChild(box);
        return !!activity;
    }

    function setDay(day){var d=Math.max(1,Math.min(60,Number(day)||1));window.localStorage.setItem("pacificEducationPilotTermDay",String(d));window.localStorage.setItem("currentDayNumber",String(d));if(window.PacificEducationDailyLessons&&typeof window.PacificEducationDailyLessons.setCurrentCoreDay==="function"){try{window.PacificEducationDailyLessons.setCurrentCoreDay(d);}catch(e){}}var core=window.PacificEducationCore;if(core&&typeof core.setLesson==="function"&&typeof core.isAuthorized==="function"&&core.isAuthorized()){try{var state=typeof core.getState==="function"?core.getState():null;var lesson=state&&state.lesson?state.lesson:{};core.setLesson({lessonId:lesson.lessonId||null,day:d,subject:lesson.subject||getSubject(),title:"",concept:lesson.concept||"",status:"not_started"});}catch(e){console.warn("Pacific Education: Core day navigation sync deferred.",e);}}refresh();return d;}function bindNavigation(){var prev=document.getElementById("previousLessonButton"),next=document.getElementById("nextLessonButton");if(prev)prev.onclick=function(){setDay(Math.max(1,getDay()-1));};if(next)next.onclick=function(){setDay(Math.min(60,getDay()+1));};}function updateNavigation(day){var d=Math.max(1,Math.min(50,Number(day)||1)),label=document.getElementById("dailyLessonProgress");if(label)label.textContent="Day "+d+" of 60 term days (50 teaching + revision + examination)";var prev=document.getElementById("previousLessonButton"),next=document.getElementById("nextLessonButton");if(prev)prev.disabled=d<=1;if(next)next.disabled=d>=60;}function renderIndicatorStages(lesson) {
        var container=document.getElementById("dailyLesson");
        if(!container)return;
        var old=document.getElementById("pacificAchievementIndicatorStages");
        if(old)old.remove();
        var areas=Array.isArray(lesson.learningAreas)?lesson.learningAreas:[],items=[];
        areas.forEach(function(a){if(Array.isArray(a.activities))a.activities.forEach(function(x){items.push(x);});});
        if(!items.length)return;
        var section=document.createElement("section");
        section.id="pacificAchievementIndicatorStages";
        section.setAttribute("aria-label","Achievement indicator activity sequence");
        var h=document.createElement("h3");h.textContent="Achievement Indicator Activity Sequence";section.appendChild(h);
        items.forEach(function(x,i){
            var card=document.createElement("article");
            card.style.margin="0.75rem 0";card.style.padding="0.75rem";card.style.border="1px solid #ccc";
            var title=document.createElement("h4");title.textContent=(i+1)+". "+(x.title||x.activityType||"Learning activity");card.appendChild(title);
            if(x.achievementIndicator){var p=document.createElement("p");p.innerHTML="<strong>Indicator:</strong> ";p.appendChild(document.createTextNode(x.achievementIndicator));card.appendChild(p);}
            if(x.taskFocus){var f=document.createElement("p");f.innerHTML="<strong>Focus:</strong> ";f.appendChild(document.createTextNode(x.taskFocus));card.appendChild(f);}
            var type=x.activityType||"";
            var labels={"teach":"Teach","guided-practice":"Guided Practice","independent-practice":"Independent Practice","application":"Application","check-assessment":"Check Assessment","remedial-extension":"Remedial / Extension"};
            var assessmentPassed=true;
            if(type==="check-assessment" && x.assessmentResult && x.assessmentResult.passed===false) assessmentPassed=false;
            var instructions={
                "guided-practice":"Work through the task with prompts, examples and feedback.",
                "application":"Use the learning in a new or familiar real-world situation.",
                "remedial-extension":"Review the gap and either reteach the skill or extend the learner with a challenge."
            };
            if(instructions[type]){
                var ip=document.createElement("p");ip.textContent=instructions[type];card.appendChild(ip);
            }
            var stageOrder=["teach","guided-practice","independent-practice","application","check-assessment","remedial-extension"];
            var currentIndex=stageOrder.indexOf(type);
            var indicatorId=x.indicatorId||x.id;
            var existingRecords=[];
            var coverage=window.PacificEducationCurriculumCoverageEngine;
            if(coverage&&typeof coverage.list==="function"){var coreUser=window.PacificEducationCore&&typeof window.PacificEducationCore.getCurrentUser==="function" ? window.PacificEducationCore.getCurrentUser() : null;existingRecords=coverage.list({studentId:coreUser&&coreUser.userId});}
            var priorComplete=stageOrder.slice(0,currentIndex).every(function(s){return existingRecords.some(function(r){return r&&r.evidenceType==="indicator-stage"&&r.indicatorId===indicatorId&&(r.stageType===s||r.activityType===s);});});
            if(currentIndex>0&&!priorComplete){var locked=document.createElement("p");locked.textContent="Complete the previous stage first.";locked.setAttribute("aria-live","polite");card.appendChild(locked);}
            var startStage=document.createElement("button");
            startStage.type="button";
            startStage.textContent="Start "+(labels[type]||"Stage")+" Activity";
            startStage.addEventListener("click",function(){
                var activity=window.PacificEducationActivity;
                if(activity&&typeof activity.render==="function"){
                    activity.render(activityTypeForDay(day),day,Object.assign({},lesson||{},{stageType:type,stageActivity:x}));
                }else{
                    startStage.textContent="Interactive activity unavailable";
                }
            });
            card.appendChild(startStage);
            var action=document.createElement("button");action.type="button";action.textContent="Mark "+(labels[type]||"Stage")+" Complete";action.disabled=currentIndex>0&&!priorComplete;
            action.addEventListener("click",function(){
                var recorder=window.PacificEducationDailyProgressRecorder;
                if(!recorder||typeof recorder.record!=="function"){action.textContent="Recorder unavailable";return;}
                var result=recorder.record({
                    status:type==="teach"?"taught":"practised",evidenceType:"indicator-stage",stageType:type,activityType:type,activityId:"daily-"+String(day)+"-"+String(getSubject()),
                    level:getLevel(),subjectId:getSubject(),term:getTerm(),dayNumber:day,
                    notes:"Pilot completion: "+(labels[type]||type)
                });
                if(result&&result.success){
                    action.disabled=true;action.textContent="Stage Recorded";
                    if(type==="check-assessment" && !assessmentPassed){
                        var support=document.createElement("p");
                        support.textContent="Support needed: return to Remedial / Extension before progressing.";
                        support.setAttribute("aria-live","assertive");
                        card.appendChild(support);
                    }
                    var nextIndex=currentIndex+1;
                    var nextType=nextIndex<stageOrder.length?stageOrder[nextIndex]:null;
                    var nextNotice=document.createElement("p");
                    nextNotice.setAttribute("aria-live","polite");
                    nextNotice.textContent=nextType?"Next: "+(labels[nextType]||"Next Stage"):"All six stages completed for this activity.";
                    card.appendChild(nextNotice);
                    document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
                }else{action.textContent="Try Again";}
            });
            card.appendChild(action);section.appendChild(card);
        });
        container.appendChild(section);
    }

function attachTextAudioControls(targetId, text) {
        var target=document.getElementById(targetId); if(!target)return;
        var old=document.getElementById(targetId+"AudioControls"); if(old)old.remove();
        var box=document.createElement("div"); box.id=targetId+"AudioControls"; box.className="activity-audio-controls";
        var listen=document.createElement("button"); listen.type="button"; listen.textContent="🔊 Listen"; listen.setAttribute("aria-label","Listen to this learning content");
        listen.addEventListener("click",function(){
            if(typeof window.speakText==="function"){window.speakText(String(text||""));return;}
            if(window.speechSynthesis){window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(String(text||""));window.speechSynthesis.speak(u);}
        });
        var stop=document.createElement("button"); stop.type="button"; stop.textContent="⏹ Stop audio"; stop.addEventListener("click",function(){if(window.speechSynthesis)window.speechSynthesis.cancel();});
        box.appendChild(listen); box.appendChild(stop); target.parentNode.appendChild(box);
    }

    function render(plan) {
        if (!plan || !plan.success || !plan.lesson) return false;
        var lesson = plan.lesson;
        var areas = Array.isArray(lesson.learningAreas) ? lesson.learningAreas : [];
        setText("dailyLessonDay", "Day " + lesson.dayNumber); updateNavigation(lesson.dayNumber);
        setText("dailyLessonTitle", lesson.title || ("Daily " + (lesson.subjectId || "Curriculum") + " Lesson"));
        var schedule = plan.schedule || {};
        var concept = plan.concept && plan.concept.domain ? plan.concept.domain : "";
        var capability = plan.capabilityName || getCapability();
        var evidenceStatus = plan.evidenceStatus || "prototype-pending-verification";
        var evidenceText = evidenceStatus === "verified" ? "Curriculum evidence: verified mapping" : "Pilot prototype activity — official curriculum evidence pending";
        var meta = document.getElementById("pacificLessonPlanMeta");
        if (!meta) { meta = document.createElement("p"); meta.id = "pacificLessonPlanMeta"; meta.setAttribute("aria-live","polite"); var titleNode=document.getElementById("dailyLessonTitle"); if(titleNode && titleNode.parentNode) titleNode.parentNode.insertBefore(meta,titleNode.nextSibling); }
        meta.textContent = evidenceText + " • Term " + (String(lesson.term || "").replace("Term ","") || "") + " • Week " + (schedule.week || "") + " • " + (schedule.phase || "Teaching") + " • Capability: " + capability + " • Concept: " + concept;

        var activityText = [];
        var practiceText = [];
        areas.forEach(function(area) {
            if (area.title) activityText.push(area.title); if (area.achievementIndicator) activityText.push("Achievement Indicator: " + area.achievementIndicator);
            if (Array.isArray(area.activities)) area.activities.forEach(function(item) { if (item.activityType) activityText.push("Stage: " + item.activityType); if (item.achievementIndicator) activityText.push("Indicator: " + item.achievementIndicator); if (item.activityTitle) activityText.push(item.activityTitle + ":"); if (item.description) activityText.push(item.description); if (item.instructions) activityText.push(item.instructions); if (item.teacherAction) activityText.push("Teacher: " + item.teacherAction); if (item.learnerAction) activityText.push("Learner: " + item.learnerAction); if (item.questionText) activityText.push("Question: " + item.questionText); if (item.audioText) activityText.push("Audio: " + item.audioText); if (item.practice) practiceText.push("Practice: " + item.practice); if (item.check) practiceText.push("Check: " + item.check); });
            if (area.integration && Array.isArray(area.integration.integrated)) area.integration.integrated.forEach(function(item) {
                if (item.subjectId) activityText.push("Integration: " + item.subjectId + " — " + (item.activitySuggestion || ""));
            });
            if (Array.isArray(area.assessments)) area.assessments.forEach(function(item) { if (item.title) practiceText.push("Assessment: " + item.title); });
        });
        if (!activityText.length) activityText.push("Complete today's curriculum-linked learning activity.");
        if (!practiceText.length) practiceText.push("Practise today's learning and explain what you learned to a teacher or parent.");
        setText("dailyLessonActivity", activityText.join(" "));
        setText("dailyLessonPractice", practiceText.join(" "));
        attachTextAudioControls("dailyLessonActivity", activityText.join(" "));
        attachTextAudioControls("dailyLessonPractice", practiceText.join(" "));
        var container = document.getElementById("dailyLesson");
        if (container) container.setAttribute("data-curriculum-linked", "true");
        renderIndicatorStages(lesson); attachActivity(lesson.dayNumber, lesson);
        return true;
    }

    function ensureCurriculumData() {
        if (typeof window.ensurePacificEducationCurriculumData === "function") {
            try { window.ensurePacificEducationCurriculumData(); } catch (e) { console.warn("Curriculum data preparation deferred:", e); }
        }
    }

    function generateAndRender() {
        ensureCurriculumData();
        var e = engine();
        if (!e || typeof e.generateDailyPlan !== "function") return false;
        var result = e.generateDailyPlan({ level: getLevel(), subjectId: getSubject(), term: getTerm(), capability: getCapability(), dayNumber: getDay() });
        return render({
            success: result.success,
            evidenceStatus: result.evidenceStatus,
            schedule: result.schedule,
            concept: result.concept,
            capabilityName: result.capabilityName,
            lesson: result.success ? {
                dayNumber: result.dayNumber,
                level: result.level,
                subjectId: result.subjectId,
                term: result.term,
                title: result.level + " — " + result.subjectId + " — Day " + result.dayNumber,
                learningAreas: result.indicators,
                activities: result.activities,
                activity: result.activities && result.activities[0] ? result.activities[0] : null,
                assessments: result.assessments,
                calendar: result.calendar,
                schedule: result.schedule,
                concept: result.concept
            } : null
        });
    }

    function connect() {
        if (connected) return true;
        if (typeof window.displayDailyLesson !== "function") return false;
        originalDisplay = window.displayDailyLesson;
        window.displayDailyLesson = function() {
            originalDisplay();
            var rendered = generateAndRender();
            if (!rendered) {
                var subject = getSubject();
                if (subject && subject !== "English") {
                    setText("dailyLessonTitle", "Daily " + subject + " Lesson — Prototype");
                    setText("dailyLessonActivity", "A subject-specific curriculum lesson is not yet available for this selection. Use the interactive pilot activity area for testing; official curriculum evidence is required before production use.");
                    setText("dailyLessonPractice", "Do not treat this prototype content as an official Fiji curriculum prescription.");
                    var fallback = document.getElementById("dailyLesson");
                    if (fallback) fallback.setAttribute("data-curriculum-linked", "false");
                    return false;
                }
                return originalDisplay();
            }
            return true;
        };
        connected = true;
        return true;
    }

    function renderDayBrowser() {
        var container = document.getElementById("dailyLesson");
        if (!container) return;
        var old = document.getElementById("pacificDailyActivityBrowser");
        if (old) old.remove();
        var section = document.createElement("section");
        section.id = "pacificDailyActivityBrowser";
        section.setAttribute("aria-label", "Daily activity browser");
        section.style.marginTop = "1rem";
        var h = document.createElement("h3");
        h.textContent = "Daily Activities — Days 1–60";
        section.appendChild(h);
        var p = document.createElement("p");
        p.textContent = "Choose any term day to attempt its activities. Pacific Guardian highlights the recommended activity for the learner's current capability.";
        section.appendChild(p);
        var controls = document.createElement("div");
        var select = document.createElement("select");
        select.id = "pacificDailyActivityDay";
        select.setAttribute("aria-label", "Choose daily activity day");
        for (var d = 1; d <= 60; d += 1) {
            var option = document.createElement("option");
            option.value = String(d);
            option.textContent = "Day " + d;
            if (d === getDay()) option.selected = true;
            select.appendChild(option);
        }
        controls.appendChild(select);
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = "Open Selected Day";
        button.addEventListener("click", function() {
            setDay(Number(select.value));
            var target = document.getElementById("dailyLesson");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        controls.appendChild(button);
        section.appendChild(controls);
        var today = document.createElement("p");
        today.textContent = "Current day: Day " + getDay() + " • Recommended: " +
            (getCapability() === "remedial" ? "Multiple Choice" :
             getCapability() === "developing" ? "True or False" :
             getCapability() === "advanced" ? "Long Answer" : "Short Answer");
        today.setAttribute("aria-live", "polite");
        section.appendChild(today);
        container.parentNode.insertBefore(section, container);
    }

    function refresh() {
        if (!connected) connect();
        var result = typeof window.displayDailyLesson === "function" ? window.displayDailyLesson() : false;
        setTimeout(renderDayBrowser, 0);
        return result;
    }

    function status() {
        var container = document.getElementById("dailyLesson");
        return {
            version: VERSION,
            connected: connected,
            engineAvailable: !!engine(),
            dailyLessonsAvailable: !!window.PacificEducationDailyLessons,
            bridgeAvailable: !!bridge(),
            interactiveActivitiesAvailable: !!window.PacificEducationActivity,
            activityTypes: window.PacificEducationActivityTypes || [],
            curriculumLinked: !!container && container.getAttribute("data-curriculum-linked") === "true",
            prototype: true
        };
    }

    function bindAssessmentButtons() {
        var alphabet=document.querySelector("button[onclick*='startAlphabetAssessment']");
        var phonics=document.querySelector("button[onclick*='startPhonicsAssessment']");
        if(alphabet){
            alphabet.removeAttribute("onclick");
            alphabet.addEventListener("click",function(){
                var api=window.PacificEducationAssessments;
                if(api&&typeof api.startAlphabet==="function") api.startAlphabet();
                else if(typeof window.startAlphabetAssessment==="function") window.startAlphabetAssessment();
            });
        }
        if(phonics){
            phonics.removeAttribute("onclick");
            phonics.addEventListener("click",function(){
                var api=window.PacificEducationAssessments;
                if(api&&typeof api.startPhonics==="function") api.startPhonics();
                else if(typeof window.startPhonicsAssessment==="function") window.startPhonicsAssessment();
            });
        }
    }

    function initialise() { connect(); bindNavigation(); refresh(); bindAssessmentButtons(); return status(); }

    window.PacificEducationCurriculumLessonRenderer = Object.freeze({
        name: "PacificEducationCurriculumLessonRenderer",
        version: VERSION,
        connect: connect,
        refresh: refresh,
        generateAndRender: generateAndRender,
        status: status,
        initialise: initialise
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise);
    else initialise();
})(window);
