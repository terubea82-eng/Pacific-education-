/* Pacific Education — Learner Activity Runtime
 * Pilot-only interactive daily activities.
 * Keeps daily activities available independently of the formal assessment module.
 */
(function(window, document) {
  "use strict";

  var VERSION = "1.1.0";
  var TYPES = ["multiple_choice", "true_false", "matching", "short_answer", "long_answer"];
  var LABELS = {
    multiple_choice: "Multiple Choice",
    true_false: "True or False",
    matching: "Matching",
    short_answer: "Short Answer",
    long_answer: "Long Answer"
  };
  var active = { type: null, day: 0, context: {} };

  function escape(value) {
    if (typeof window.escapeHTML === "function") return window.escapeHTML(String(value == null ? "" : value));
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch];
    });
  }

  function speak(value) {
    var text = String(value || "");
    if (typeof window.speakText === "function") return window.speakText(text);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  }

  function readAudio(done) {
    var input = document.getElementById("peActivityAudio");
    var file = input && input.files && input.files[0];
    if (!file) return done("");
    var reader = new FileReader();
    reader.onload = function() { done(String(reader.result || "")); };
    reader.onerror = function() { done(""); };
    reader.readAsDataURL(file);
  }

  function contextFrom(lesson, day) {
    var source = lesson && lesson.activity ? lesson.activity : (lesson || {});
    return {
      level: lesson && lesson.level || localStorage.getItem("pacificEducationLevel") || "Class 1",
      subjectId: lesson && lesson.subjectId || localStorage.getItem("pacificEducationSubject") || "English",
      term: lesson && lesson.term || localStorage.getItem("pacificEducationTerm") || "Term 1",
      dayNumber: Number(day) || 1,
      activityTitle: source.activityTitle || lesson && lesson.title || "Daily Activity",
      questionText: source.questionText || source.learnerTask || source.description || "Complete today's learning activity.",
      audioText: source.audioText || source.questionText || source.learnerTask || "",
      answerKey: source.answerKey,
      options: Array.isArray(source.options) ? source.options.slice(0, 6) : (Array.isArray(source.choices) ? source.choices.slice(0, 6) : (Array.isArray(source.answerOptions) ? source.answerOptions.slice(0, 6) : [])),
      answerIndex: Number.isInteger(Number(source.answerIndex)) ? Number(source.answerIndex) : null,
      contentBasis: source.contentBasis || "concept-based-pilot-prototype",
      indicatorId: source.indicatorId || null,
      achievementIndicator: source.achievementIndicator || null,
      strand: source.strand || null,
      subStrand: source.subStrand || null,
      concept: source.concept || source.subStrand || null,
      activitySequence: Number.isInteger(Number(source.activitySequence)) ? Number(source.activitySequence) : null,
      renderTargetId: source.renderTargetId || null,
      stageType: lesson && lesson.stageType || null,
      responseMode: "text-or-audio"
    };
  }

  function save(type, response, audio, ctx) {
    var key = "pacificEducationActivityResponses";
    var items = [];
    try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
    items.push({
      type: type,
      day: ctx.dayNumber,
      response: response || "",
      questionText: ctx.questionText,
      audioDataUrl: audio || "",
      classLevel: ctx.level,
      subject: ctx.subjectId,
      term: ctx.term,
      curriculumContext: ctx,
      reviewStatus: ctx.answerKey !== undefined && ctx.answerKey !== null && String(ctx.answerKey) !== "" ? "auto-scored" : "pending-teacher-review",
      date: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(items.slice(-500)));

    var recorder = window.PacificEducationDailyProgressRecorder;
    if (recorder && typeof recorder.record === "function") {
      try {
        var hasKey = ctx.answerKey !== undefined && ctx.answerKey !== null && String(ctx.answerKey) !== "";
        var score = hasKey ? (String(response || "").trim().toLowerCase() === String(ctx.answerKey).trim().toLowerCase() ? 100 : 0) : null;
        recorder.record({
          status: hasKey ? "assessed" : "practised",
          evidenceType: hasKey ? "daily-assessment" : "daily-practice",
          score: score,
          passingScore: 60,
          activityId: "daily-activity-" + type + "-day-" + ctx.dayNumber,
          assessmentId: "daily-activity-" + type,
          level: ctx.level,
          subjectId: ctx.subjectId,
          term: ctx.term,
          dayNumber: ctx.dayNumber,
          notes: "Pilot learner response. Review status: " + (hasKey ? "auto-scored" : "pending-teacher-review")
        });
      } catch (e) {}
    }

    if (audio) {
      var homeKey = "pacificEducationHomeSubmissions";
      var home = [];
      try { home = JSON.parse(localStorage.getItem(homeKey) || "[]"); } catch (e) {}
      home.push({
        submissionId: "audio-activity-" + Date.now(),
        studentId: "pilot-student-demo",
        studentName: "Student",
        classLevel: ctx.level,
        subject: ctx.subjectId,
        term: ctx.term,
        type: "daily-activity-audio",
        activityType: type,
        day: ctx.dayNumber,
        answers: [{ questionNumber: 1, question: ctx.questionText, answer: response || "" }],
        audioDataUrl: audio,
        status: "pending-special-education-review",
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem(homeKey, JSON.stringify(home.slice(-100)));
    }
  }

  function complete(type, response) {
    var ctx = active.context;
    readAudio(function(audio) {
      save(type, response, audio, ctx);
      var status = ctx.answerKey !== undefined && ctx.answerKey !== null && String(ctx.answerKey) !== "" ? "auto-scored" : "pending-teacher-review";
      if (typeof window.showLesson === "function") {
        window.showLesson(LABELS[type] + " — Complete",
          '<div class="activity"><h3>Response submitted</h3><p>Your answer and the curriculum question have been recorded.</p>' +
          '<p><strong>Review:</strong> ' + escape(status) + '</p>' +
          '<p>Teacher review is required when no verified answer key is available.</p>' +
          '<button type="button" onclick="startDailyLesson()">📚 Continue Learning</button></div>');
      }
    });
  }

  function render(type, day, lesson) {
    if (TYPES.indexOf(type) < 0) type = "short_answer";
    active.type = type;
    active.day = Number(day) || 1;
    active.context = contextFrom(lesson, active.day);

    var prompt = active.context.questionText;
    var audio = active.context.audioText || prompt;
    var title = (lesson && lesson.title ? lesson.title : "Daily Activity") + " — " + LABELS[type];
    var audioButton = '<button type="button" id="peActivityListen">🔊 Listen to question</button><button type="button" id="peActivityRecord">🎙️ Record voice answer</button><span id="peActivityRecordStatus" aria-live="polite"></span>';
    var audioFile = '<label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label>';

    var curriculumInfo = ""; if (active.context.achievementIndicator || active.context.concept || active.context.strand || active.context.subStrand) { curriculumInfo += '<div class="pe-daily-curriculum-context" aria-label="Daily curriculum alignment">'; if (active.context.achievementIndicator) curriculumInfo += '<p><strong>Achievement Indicator:</strong> ' + escape(active.context.achievementIndicator) + '</p>'; if (active.context.strand) curriculumInfo += '<p><strong>Strand:</strong> ' + escape(active.context.strand) + '</p>'; if (active.context.subStrand) curriculumInfo += '<p><strong>Sub-strand / Concept:</strong> ' + escape(active.context.subStrand) + '</p>'; if (active.context.activitySequence) curriculumInfo += '<p><strong>Activity Progression:</strong> Activity ' + escape(String(active.context.activitySequence)) + '</p>'; curriculumInfo += '</div>'; }
    var body = '<div class="activity">' + curriculumInfo + '<p>' + escape(prompt) + '</p>' + audioButton + audioFile;

    if (type === "true_false") {
      body += '<p>Choose True or False.</p><button type="button" id="peActivityTrue">True</button><button type="button" id="peActivityFalse">False</button><button type="button" id="peActivitySubmitChoice" disabled>Submit Selected Answer</button>';
    } else if (type === "multiple_choice") {
      var choices = [];
      var activitySource = lesson && lesson.activity ? lesson.activity : {};
      var rawChoices = activitySource.options || activitySource.choices || activitySource.answerOptions || (lesson && (lesson.options || lesson.choices || lesson.answerOptions));
      if (Array.isArray(rawChoices)) choices = rawChoices.slice(0, 6);
      if (!choices.length && Array.isArray(activitySource.multipleChoiceOptions)) choices = activitySource.multipleChoiceOptions.slice(0, 6);
      if (choices.length) {
        body += '<p id="peMultipleChoiceSelection" aria-live="polite">Select one answer:</p><div id="peMultipleChoiceOptions" role="group" aria-label="Multiple choice answers">';
        choices.forEach(function(option, index) {
          body += '<button type="button" class="pe-multiple-choice-option" data-option-index="' + index + '">' + escape(option) + '</button>';
        });
        body += '</div><button type="button" id="peActivitySubmitChoice" disabled>Submit Selected Answer</button>';
      } else {
        body += '<p>Select or enter your answer:</p><input id="peWrittenAnswer" placeholder="Type your selected answer"><button type="button" id="peActivitySubmit">Submit Answer</button>';
      }
    } else if (type === "matching") {
      body += '<input id="peMatchAnswer" placeholder="Enter your matching answer"><button type="button" id="peActivitySubmit">Submit Match</button>';
    } else {
      var rows = type === "short_answer" ? 3 : 8;
      var instruction = type === "short_answer" ? "Write a short answer." : "Write a detailed answer with an explanation or example.";
      body += '<p>' + instruction + '</p><textarea id="peWrittenAnswer" rows="' + rows + '" maxlength="' + (type === "short_answer" ? 500 : 2000) + '"></textarea><button type="button" id="peActivitySubmit">Submit Answer</button>';
    }

    body += '</div>';
    var activityPanel = active.context.renderTargetId ? document.getElementById(active.context.renderTargetId) : document.getElementById("dailyLessonActivity");
    if (activityPanel) {
      activityPanel.innerHTML = body;
      activityPanel.hidden = false;
      activityPanel.setAttribute("aria-live", "polite");
    } else if (typeof window.showLesson === "function") {
      window.showLesson(title, body);
    }

    var listen = document.getElementById("peActivityListen");
    if (listen) listen.addEventListener("click", function() { speak(audio); });

    var recordButton = document.getElementById("peActivityRecord");
    var recordStatus = document.getElementById("peActivityRecordStatus");
    var mediaRecorder = null;
    var recordedChunks = [];
    if (recordButton) {
      recordButton.addEventListener("click", function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
          if (recordStatus) recordStatus.textContent = "Voice recording is not supported here. Use the audio file option instead.";
          return;
        }
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          recordButton.textContent = "🎙️ Record voice answer";
          return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
          recordedChunks = [];
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = function(event) {
            if (event.data && event.data.size) recordedChunks.push(event.data);
          };
          mediaRecorder.onstop = function() {
            stream.getTracks().forEach(function(track) { track.stop(); });
            var blob = new Blob(recordedChunks, { type: "audio/webm" });
            var input = document.getElementById("peActivityAudio");
            try {
              var file = new File([blob], "voice-answer.webm", { type: "audio/webm" });
              var transfer = new DataTransfer();
              transfer.items.add(file);
              if (input) input.files = transfer.files;
              if (recordStatus) recordStatus.textContent = "Voice answer recorded and ready to submit.";
            } catch (e) {
              if (recordStatus) recordStatus.textContent = "Voice answer recorded. If it is not attached automatically, use the audio file picker.";
            }
          };
          mediaRecorder.start();
          recordButton.textContent = "⏹ Stop recording";
          if (recordStatus) recordStatus.textContent = "Recording… tap Stop recording when finished.";
        }).catch(function() {
          if (recordStatus) recordStatus.textContent = "Microphone permission was not granted. You can still answer by text or choose an audio file.";
        });
      });
    }

    var submit = document.getElementById("peActivitySubmit");
    if (submit) submit.addEventListener("click", function() {
      var input = document.getElementById(type === "matching" ? "peMatchAnswer" : "peWrittenAnswer");
      complete(type, input ? input.value : "");
    });

    var choiceButtons = document.querySelectorAll(".pe-multiple-choice-option");
    var selectedChoice = "";
    var choiceSubmit = document.getElementById("peActivitySubmitChoice");
    for (var ci = 0; ci < choiceButtons.length; ci += 1) {
      choiceButtons[ci].setAttribute("aria-pressed", "false");
      choiceButtons[ci].addEventListener("click", function() {
        selectedChoice = this.textContent || "";
        for (var cj = 0; cj < choiceButtons.length; cj += 1) {
          choiceButtons[cj].setAttribute("aria-pressed", choiceButtons[cj] === this ? "true" : "false");
          choiceButtons[cj].classList.toggle("selected", choiceButtons[cj] === this);
        }
        if (choiceSubmit) choiceSubmit.disabled = !selectedChoice;
        var selection = document.getElementById("peMultipleChoiceSelection");
        if (selection) selection.textContent = "Selected: " + selectedChoice + ". Tap Submit Selected Answer to record it.";
      });
    }
    if (choiceSubmit) {
      choiceSubmit.addEventListener("click", function() {
        if (!selectedChoice) return;
        choiceSubmit.disabled = true;
        complete("multiple_choice", selectedChoice);
      });
    }

    var yes = document.getElementById("peActivityTrue");
    var no = document.getElementById("peActivityFalse");
    var tfSubmit = document.getElementById("peActivitySubmitChoice");
    var tfSelected = "";
    if (yes) yes.addEventListener("click", function() {
      tfSelected = "True";
      yes.setAttribute("aria-pressed","true"); no.setAttribute("aria-pressed","false");
      if (tfSubmit) tfSubmit.disabled = false;
    });
    if (no) no.addEventListener("click", function() {
      tfSelected = "False";
      no.setAttribute("aria-pressed","true"); yes.setAttribute("aria-pressed","false");
      if (tfSubmit) tfSubmit.disabled = false;
    });
    if (tfSubmit && (yes || no)) tfSubmit.addEventListener("click", function() {
      if (!tfSelected) return;
      tfSubmit.disabled = true;
      complete(type, tfSelected);
    });

    return true;
  }

  window.PacificEducationActivityTypes = TYPES.slice();
  window.PacificEducationActivity = {
    version: VERSION,
    labels: LABELS,
    render: render,
    answer: function(type, day, response) {
      if (type !== active.type || Number(day) !== active.day) {
        active.day = Number(day) || active.day;
        active.type = type;
      }
      complete(type, response);
    },
    submitField: function(type, day, id) {
      var input = document.getElementById(id);
      if (!input) return;
      complete(type, input.value || "");
    }
  };
})(window, document);
