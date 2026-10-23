/* PacEdu — learner camera evidence, controlled pilot only.
 * Photos are compressed and stored on this device for teacher review.
 * No OCR or automatic correctness claim is made; cross-device delivery needs a secure sync service.
 */
(function(window, document) {
  "use strict";
  var PANEL_ID = "dailyLessonActivity";
  var SECTION_ID = "paceduCameraEvidencePanel";
  var RESPONSE_KEY = "pacificEducationActivityResponses";
  var MAX_SOURCE_BYTES = 8 * 1024 * 1024;
  var MAX_PHOTO_CHARS = 850000;
  var MAX_PENDING_PHOTOS = 5;

  function readItems() {
    try {
      var value = JSON.parse(window.localStorage.getItem(RESPONSE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (e) { return []; }
  }
  function learnerContext() {
    var c = null, roster = window.PacificEducationTeacherClassRosterContext;
    try { c = JSON.parse(window.sessionStorage.getItem("paceduActiveStudentContextV1") || "null"); } catch (e) {}
    if (!c || c.role !== "student" || c.identityVerified !== true || !c.studentId ||
        !c.studentReference || !c.classId || c.assignmentStatus !== "roster-matched-prototype" ||
        !roster || typeof roster.getClass !== "function") return null;
    var assigned;
    try { assigned = roster.getClass(c.classId); } catch (e) { return null; }
    if (!assigned || String(assigned.level || "") !== String(c.classLevel || "") ||
        !Array.isArray(assigned.studentRefs) ||
        assigned.studentRefs.indexOf(String(c.studentReference)) < 0) return null;
    return { studentId: String(c.studentId), studentReference: String(c.studentReference),
      classId: String(c.classId), classLevel: String(assigned.level || ""),
      studentName: String(c.displayName || "Student") };
  }
  function el(tag, text) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    return n;
  }
  function compress(file) {
    return new Promise(function(resolve, reject) {
      if (!file || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type || "")) {
        reject(new Error("Choose a photo image file from the camera or gallery."));
        return;
      }
      if (file.size > MAX_SOURCE_BYTES) {
        reject(new Error("This photo is too large. Choose a photo under 8 MB."));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function() { reject(new Error("PacEdu could not read this photo. Try taking it again.")); };
      reader.onload = function() {
        var img = new Image();
        img.onerror = function() { reject(new Error("This photo format cannot be previewed. Try JPEG or PNG.")); };
        img.onload = function() {
          var scale = Math.min(1, 1280 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
          canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
          var ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Photo compression is not available on this device.")); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          var data = canvas.toDataURL("image/jpeg", 0.68);
          if (data.length > MAX_PHOTO_CHARS) data = canvas.toDataURL("image/jpeg", 0.48);
          if (!/^data:image\/jpeg;base64,/.test(data) || data.length > MAX_PHOTO_CHARS) {
            reject(new Error("The compressed photo is still too large. Retake it closer to the work with lower image size."));
            return;
          }
          resolve(data);
        };
        img.src = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    });
  }
  function inject() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel || !window.PacificEducationActivity || typeof window.PacificEducationActivity.currentContext !== "function") return;
    if (document.getElementById(SECTION_ID)) return;
    var section = el("section");
    section.id = SECTION_ID;
    section.style.cssText = "margin:14px 0;padding:12px;border:2px solid #7bb9e8;border-radius:10px;";
    section.setAttribute("aria-labelledby", "paceduCameraEvidenceHeading");
    var heading = el("h3", "Submit a photo of your work");
    heading.id = "paceduCameraEvidenceHeading";
    section.appendChild(heading);
    section.appendChild(el("p", "Take a clear photo of this activity or select one from your gallery. PacEdu stores it on this device for teacher review. A photo is evidence only; it is not automatically marked correct or sent to another device."));
    var label = el("label", "Camera photo or image: ");
    var input = el("input");
    input.type = "file";
    input.id = "paceduCameraEvidenceFile";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.setAttribute("aria-label", "Take or select a photo of student work");
    label.appendChild(input);
    section.appendChild(label);
    var preview = el("img");
    preview.alt = "Preview of work photo selected for teacher review";
    preview.hidden = true;
    preview.style.cssText = "display:block;max-width:100%;max-height:280px;margin:10px 0;object-fit:contain;";
    section.appendChild(preview);
    var submit = el("button", "Submit photo for teacher review");
    submit.type = "button";
    submit.disabled = true;
    submit.style.cssText = "min-height:48px;padding:12px;border-radius:8px;font-weight:700;";
    section.appendChild(submit);
    var status = el("p", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    section.appendChild(status);
    var photoData = "";
    input.addEventListener("change", function() {
      photoData = "";
      preview.hidden = true;
      submit.disabled = true;
      status.textContent = "";
      var file = input.files && input.files[0];
      if (!file) return;
      compress(file).then(function(data) {
        photoData = data;
        preview.src = data;
        preview.hidden = false;
        submit.disabled = false;
        status.textContent = "Photo ready. Check that the writing is clear and the whole answer is visible.";
      }).catch(function(error) {
        status.textContent = error.message || "Photo could not be prepared.";
      });
    });
    submit.addEventListener("click", function() {
      if (!photoData) return;
      var learner = learnerContext();
      var ctx = window.PacificEducationActivity.currentContext() || {};
      if (!learner) {
        status.textContent = "Cannot submit for assessment yet: learner and class must match the pilot class roster.";
        return;
      }
      var pendingPhotos = readItems().filter(function(x) {
        return x && x.photoDataUrl && x.reviewStatus === "pending-teacher-review" &&
          x.studentId === learner.studentId && x.classId === learner.classId;
      }).length;
      if (pendingPhotos >= MAX_PENDING_PHOTOS) {
        status.textContent = "There are already five photo submissions awaiting review on this device. Ask the teacher to review them before adding another.";
        return;
      }
      var items = readItems();
      var activityType = String(ctx.type || "daily-activity");
      var day = Number(ctx.dayNumber) || 1;
      var activityId = String(ctx.activityId || ("daily-activity-" + activityType + "-day-" + day));
      var record = {
        responseId: "photo-evidence-" + Date.now(),
        type: activityType,
        activityId: activityId,
        studentId: learner.studentId,
        studentReference: learner.studentReference,
        studentName: learner.studentName,
        identityStatus: "roster-matched-prototype",
        classId: learner.classId,
        classLevel: learner.classLevel,
        subject: String(ctx.subjectId || window.localStorage.getItem("pacificEducationSubject") || "English"),
        term: String(ctx.term || window.localStorage.getItem("pacificEducationTerm") || "Term 1"),
        day: day,
        questionText: String(ctx.questionText || panel.querySelector("p") && panel.querySelector("p").textContent || "Daily activity"),
        response: "Photo evidence submitted; teacher marking required.",
        photoDataUrl: photoData,
        responseMode: "photo-evidence",
        reviewStatus: "pending-teacher-review",
        autoMarkStatus: "not-auto-marked",
        teacherGuidance: "",
        date: new Date().toISOString()
      };
      items.push(record);
      try {
        window.localStorage.setItem(RESPONSE_KEY, JSON.stringify(items.slice(-100)));
      } catch (e) {
        status.textContent = "PacEdu could not save this photo on the device. Free storage and try a smaller photo. It has not been submitted.";
        return;
      }
      document.dispatchEvent(new CustomEvent("pacificEducationDailyProgressRecorded", { detail: {
        status: "practised", evidenceType: "photo-evidence", activityId: activityId,
        classId: learner.classId, subjectId: record.subject, term: record.term, dayNumber: day,
        notes: "Photo evidence pending teacher review; not auto-marked."
      }}));
      document.dispatchEvent(new CustomEvent("pacificEducationCameraEvidenceSubmitted", { detail: {
        responseId: record.responseId, studentId: record.studentId, classId: record.classId,
        subject: record.subject, term: record.term, day: day, status: record.reviewStatus
      }}));
      photoData = "";
      input.value = "";
      preview.removeAttribute("src");
      preview.hidden = true;
      submit.disabled = true;
      status.textContent = "Photo saved to this device's teacher review queue. It remains unmarked until a teacher reviews it. This pilot does not sync the photo to another device.";
      if (window.PacificEducationTeacherReview && typeof window.PacificEducationTeacherReview.render === "function") {
        window.PacificEducationTeacherReview.render();
      }
    });
    panel.appendChild(section);
  }
  function start() {
    inject();
    var panel = document.getElementById(PANEL_ID);
    if (!panel || !window.MutationObserver) return;
    var observer = new MutationObserver(function() {
      if (!document.getElementById(SECTION_ID)) inject();
    });
    observer.observe(panel, { childList: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  window.addEventListener("load", start);
  window.PacificEducationCameraEvidence = { version: "1.0.0", inject: inject, verifiedLearnerContext: learnerContext };
})(window, document);
