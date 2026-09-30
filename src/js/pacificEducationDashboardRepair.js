/*
 * Pacific Education — Dashboard Reliability Repair Layer
 * PROTOTYPE ONLY. Keeps Student, Teacher, Parent and Inclusion
 * dashboards synchronized with the same saved pilot learning records.
 */
(function(window, document){
  "use strict";
  var VERSION = "1.1.0";
  var PILOT_CLASS = "PILOT-CLASS-001";
  var PILOT_STUDENT = "PILOT-STUDENT-001";

  function role(){ try { return window.sessionStorage.getItem("pacificEducationPilotRole") || ""; } catch(e){ return ""; } }

  function ensureStudent(){
    var ctx = window.PacificEducationStudentCoverageContext;
    if(ctx && typeof ctx.setStudentId === "function" && !ctx.getStudentId()) ctx.setStudentId(PILOT_STUDENT);
    var core = window.PacificEducationCore;
    if(core && typeof core.setStudent === "function"){
      try {
        var state = core.getState ? core.getState() : null;
        if(!state || !state.student || !state.student.studentId) core.setStudent({studentId:PILOT_STUDENT,id:PILOT_STUDENT,name:"Student"});
      } catch(e){}
    }
  }

  function ensureTeacherClass(){
    var r = window.PacificEducationTeacherClassRosterContext;
    if(!r) return;
    try{
      var id = r.getClassId && r.getClassId();
      if(!id){ r.createClass(PILOT_CLASS,"Class 7"); r.setClassId(PILOT_CLASS); }
      id = r.getClassId ? r.getClassId() : PILOT_CLASS;
      if(r.getStudents && (!r.getStudents(id) || r.getStudents(id).indexOf(PILOT_STUDENT) === -1)) r.addStudent(id,PILOT_STUDENT);
    }catch(e){}
  }

  function refreshStudent(){
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
