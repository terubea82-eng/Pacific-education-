/*
 * Pacific Education — Dashboard Reliability Repair Layer
 * PROTOTYPE ONLY. Ensures pilot dashboard dependencies, learner context,
 * role routing, and refresh hooks are connected without granting production authority.
 */
(function(window, document){
  "use strict";
  var VERSION = "1.0.0";
  var PILOT_CLASS = "PILOT-CLASS-001";
  var PILOT_STUDENT = "PILOT-STUDENT-001";

  function role(){ try { return window.sessionStorage.getItem("pacificEducationPilotRole") || ""; } catch(e){ return ""; } }
  function dispatch(name){ try { document.dispatchEvent(new CustomEvent(name)); } catch(e){} }

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

  function renderStudent(){
    ensureStudent();
    var ui = window.PacificEducationStudentProgressDashboardUI;
    if(ui && typeof ui.render === "function") ui.render("pacificEducationStudentProgressDashboard");
  }
  function renderTeacher(){
    ensureTeacherClass();
    var ui = window.PacificEducationTeacherClassDashboardUI;
    if(ui && typeof ui.render === "function") ui.render("pacificEducationTeacherClassDashboard");
    var d = window.PacificEducationDashboards;
    if(d && typeof d.refreshTeacherDashboard === "function") d.refreshTeacherDashboard();
  }
  function renderParent(){
    ensureStudent();
    if(typeof window.refreshParentDashboard === "function") window.refreshParentDashboard();
  }
  function renderAll(){
    var r = role();
    if(r === "student") renderStudent();
    if(r === "teacher" || r === "special-education") renderTeacher();
    if(r === "parent") renderParent();
    if(r === "student" || r === "teacher" || r === "special-education" || r === "parent"){
      if(typeof window.refreshAllDashboards === "function") window.refreshAllDashboards();
    }
  }

  function start(){
    renderAll();
    [250,750,1500].forEach(function(ms){ window.setTimeout(renderAll,ms); });
  }

  window.PacificEducationDashboardRepair = Object.freeze({
    version:VERSION,
    ensureStudent:ensureStudent,
    ensureTeacherClass:ensureTeacherClass,
    refresh:renderAll,
    prototype:true,
    productionEligible:false
  });

  ["pacificEducationStudentChanged","pacificEducationCoverageRefresh","pacificEducationAdaptiveLearningUpdated","pacificEducationTeacherReviewCompleted"].forEach(function(name){ document.addEventListener(name,renderAll); });
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",start); else start();
})(window,document);
