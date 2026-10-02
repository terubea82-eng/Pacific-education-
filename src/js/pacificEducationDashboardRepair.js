/*
 * Pacific Education — Dashboard Reliability Repair Layer
 * PROTOTYPE ONLY. Keeps Student, Teacher, Parent and Inclusion
 * dashboards synchronized with the same saved pilot learning records.
 */
(function(window, document){
  "use strict";
  var VERSION = "1.2.0";
  var PILOT_CLASS = "PILOT-CLASS-001";
  var PILOT_STUDENT = "PILOT-STUDENT-001";

  function role(){ try { return window.sessionStorage.getItem("pacificEducationPilotRole") || ""; } catch(e){ return ""; } }

  function isSyntheticStudentReference(value){
    return /^PILOT-STUDENT-[A-Z0-9-]+$/.test(String(value || ""));
  }

  function ensureStudent(){
    var ctx = window.PacificEducationStudentCoverageContext;
    if(ctx && typeof ctx.setStudentId === "function"){
      var current = "";
      try { current = ctx.getStudentId ? ctx.getStudentId() : ""; } catch(e) {}
      if(!isSyntheticStudentReference(current)){
        ctx.setStudentId(PILOT_STUDENT);
      }
    }

    /*
     * Migrate legacy pilot roster data that may contain a human-looking
     * display name. The controlled pilot must use synthetic references only.
     */
    var roster = window.PacificEducationTeacherClassRosterContext;
    if(roster && typeof roster.getClassId === "function" && typeof roster.getClass === "function"){
      try {
        var classId = roster.getClassId();
        var currentClass = classId ? roster.getClass(classId) : null;
        if(currentClass && Array.isArray(currentClass.studentRefs)){
          var refs = currentClass.studentRefs.filter(isSyntheticStudentReference);
          if(refs.indexOf(PILOT_STUDENT) < 0) refs.unshift(PILOT_STUDENT);
          var unique = refs.filter(function(ref,index){ return refs.indexOf(ref) === index; });
          currentClass.studentRefs.forEach(function(ref){
            if(unique.indexOf(ref) < 0 && typeof roster.removeStudent === "function"){
              roster.removeStudent(classId, ref);
            }
          });
          if(typeof roster.addStudent === "function") roster.addStudent(classId, PILOT_STUDENT);
        }
      } catch(e) {}
    }

    var core = window.PacificEducationCore;
    if(core && typeof core.setStudent === "function"){
      try {
        var state = core.getState ? core.getState() : null;
        var student = state && state.student ? state.student : {};
        if(!student.studentId || !isSyntheticStudentReference(student.studentId) || student.name !== "Student"){
          core.setStudent({
            studentId: PILOT_STUDENT,
            id: PILOT_STUDENT,
            name: "Student"
          });
        }
      } catch(e){}
    }
  }

  function ensurePilotClassContext(){
    var r = window.PacificEducationTeacherClassRosterContext;
    if(!r) return false;
    try{
      var id = r.getClassId && r.getClassId();
      if(id && r.getClass && r.getClass(id)) return true;
      /*
       * The controlled pilot needs one pre-defined synthetic Class Reference
       * so the student flow can actually open Day 1. This is a system pilot
       * fixture, not a user-created class. Never replace an existing class.
       */
      var classes = r.getClasses && r.getClasses();
      var keys = classes && typeof classes === "object" ? Object.keys(classes) : [];
      if(keys.length){
        r.setClassId(keys[0]);
        return !!(r.getClass && r.getClass(keys[0]));
      }
      if(typeof r.createClass !== "function") return false;
      var created = r.createClass(PILOT_CLASS,"Class 1","PILOT-TEACHER-001","Pilot");
      if(!created || !created.success) return false;
      if(typeof r.setClassId === "function") r.setClassId(PILOT_CLASS);
      return !!(r.getClass && r.getClass(PILOT_CLASS));
    }catch(e){ return false; }
  }

  function ensureTeacherClass(){
    var r = window.PacificEducationTeacherClassRosterContext;
    if(!r) return;
    try{
      ensurePilotClassContext();
      var id = r.getClassId && r.getClassId();
      if(!id) return;
      id = r.getClassId ? r.getClassId() : "";
      if(r.getStudents && (!r.getStudents(id) || r.getStudents(id).indexOf(PILOT_STUDENT) === -1)) r.addStudent(id,PILOT_STUDENT);
    }catch(e){}
  }

  function refreshStudent(){
    ensurePilotClassContext();
    ensureStudent();
    var ui = window.PacificEducationStudentProgressDashboardUI;
    if(ui && typeof ui.render === "function") ui.render("pacificEducationStudentProgressDashboard");
  }

  function refreshTeacher(){
    ensureTeacherClass();
    var ui = window.PacificEducationTeacherClassDashboardUI;
    if(ui && typeof ui.render === "function") ui.render("pacificEducationTeacherClassDashboard");
    var d = window.PacificEducationDashboards;
    if(d && typeof d.refreshTeacherDashboard === "function") d.refreshTeacherDashboard();
  }

  function refreshParent(){
    ensureStudent();
    if(typeof window.refreshParentDashboard === "function") window.refreshParentDashboard();
  }

  function refreshAll(){
    var r = role();
    if(r === "student") refreshStudent();
    if(r === "teacher" || r === "special-education") refreshTeacher();
    if(r === "parent") refreshParent();

    /* Keep the underlying dashboard records synchronized even when
       the current role is only viewing one dashboard. */
    if(typeof window.refreshAllDashboards === "function") window.refreshAllDashboards();
  }

  function start(){
    refreshAll();
    [250,750,1500].forEach(function(ms){ window.setTimeout(refreshAll,ms); });
  }

  window.PacificEducationDashboardRepair = Object.freeze({
    version:VERSION,
    ensureStudent:ensureStudent,
    ensureTeacherClass:ensureTeacherClass,
    refresh:refreshAll,
    prototype:true,
    productionEligible:false
  });

  [
    "pacificEducationStudentChanged",
    "pacificEducationCoverageRefresh",
    "pacificEducationAdaptiveLearningUpdated",
    "pacificEducationTeacherReviewCompleted",
    "pacificEducationActivityCompleted",
    "pacificEducationLessonCompleted",
    "pacificEducationAssessmentCompleted",
    "pacificEducationDashboardRefresh"
  ].forEach(function(name){
    document.addEventListener(name,refreshAll);
  });

  window.addEventListener("storage",function(event){
    if(!event || !event.key) return;
    if(
      event.key === "pacificEducationActivityResponses" ||
      event.key === "pacificEducationApprovedHomeAssessments" ||
      event.key === "pacificEducationAdaptiveLastReview" ||
      event.key === "lessonsCompleted" ||
      event.key === "currentDayNumber"
    ) refreshAll();
  });

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",start); else start();
})(window,document);
