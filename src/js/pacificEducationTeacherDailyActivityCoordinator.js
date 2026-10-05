/* Pacific Education — Teacher Requested Coordinated Daily Activity Engine.
 * Controlled-pilot implementation.
 * Teacher initiates the request; PacEdu automatically derives the curriculum concept,
 * coordinates the concept across applicable classes, and generates a class-level task.
 */
(function(window, document){
  "use strict";

  var REQUEST_KEY = "pacificEducationTeacherDailyActivityRequestsV1";
  var COORD_KEY = "pacificEducationSchoolConceptCoordinationV1";

  function read(key, fallback){
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch(e){ return fallback; }
  }
  function write(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){} }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];}); }

  function context(){
    var countryCode = localStorage.getItem("pacificEducationCurriculumCountryCode") || localStorage.getItem("pacificEducationPilotCountry") || "";
    var country = localStorage.getItem("pacificEducationCurriculumCountry") || localStorage.getItem("pacificEducationPilotCountryName") || "";
    var subject = localStorage.getItem("pacificEducationSubject") || "";
    var term = localStorage.getItem("pacificEducationTerm") || "";
    var day = localStorage.getItem("currentDayNumber") || "1";
    var school = "", schoolId = "", classId = "", level = "";
    try {
      var p = window.PacificEducationSchoolIdentity && window.PacificEducationSchoolIdentity.getProfile
        ? window.PacificEducationSchoolIdentity.getProfile() : null;
      if(p){ school=p.schoolName||""; schoolId=p.registrationNumber||p.schoolId||school||""; }
    } catch(e){}
    try {
      var r = window.PacificEducationTeacherClassRosterContext;
      if(r && r.getClassId) classId = String(r.getClassId()||"");
      var c = classId && r && r.getClass ? r.getClass(classId) : null;
      if(c) level = String(c.level||c.className||"");
    } catch(e){}
    return {countryCode:countryCode,country:country,school:school,schoolId:schoolId,classId:classId,level:level,subject:subject,term:term,day:day};
  }

  function conceptFor(ctx){
    var concept = "";
    try {
      var engine = window.PacificEducationDailyCurriculumEngine;
      if(engine && typeof engine.getTeachingConcept === "function") concept = engine.getTeachingConcept(ctx) || "";
    } catch(e){}
    if(!concept){
      try { concept = localStorage.getItem("pacificEducationTeachingConcept") || ""; } catch(e){}
    }
    if(!concept) concept = ctx.subject ? (ctx.subject + " — scheduled daily curriculum concept") : "Scheduled daily curriculum concept";
    return concept;
  }

  function newsFor(ctx){
    var item = null;
    try {
      var cfg = window.PacificEducationCountryConfig;
      if(cfg && typeof cfg.getDailyEducationalCurrentAffair === "function") item = cfg.getDailyEducationalCurrentAffair(ctx);
    } catch(e){}
    return item;
  }

  function generate(ctx){
    var concept = conceptFor(ctx);
    var news = newsFor(ctx);
    var sourceType = news ? "EDUCATIONAL_CURRENT_AFFAIRS" : "PACEDU_DAILY_LIFE_ACTIVITY";
    var activity = news
      ? "Use the approved current-affairs context to investigate the scheduled concept, explain what was learned, and complete a class performance task."
      : "Use an age-appropriate real-life situation to investigate the scheduled concept, explain the solution, and complete a class performance task.";
    return {
      id:"TDA-"+Date.now(),
      createdAt:new Date().toISOString(),
      requestType:"TEACHER_REQUESTED_COORDINATED_DAILY_ACTIVITY",
      countryCode:ctx.countryCode,country:ctx.country,schoolId:ctx.schoolId,school:ctx.school,
      classId:ctx.classId,level:ctx.level,subject:ctx.subject,term:ctx.term,day:ctx.day,
      teachingConcept:concept,sourceType:sourceType,
      currentAffairsId:news && (news.id||news.sourceId) || null,
      currentAffairsTitle:news && news.title || null,
      learningObjective:"Learn and demonstrate the scheduled curriculum concept in a meaningful real-world context.",
      teacherActivity:activity,
      performanceTask:"Student explains, demonstrates, solves or produces evidence showing understanding of the shared concept.",
      assessment:"Teacher records performance against the curriculum indicator after review.",
      status:"PENDING_TEACHER_REVIEW",
      coordinatedConcept:true,
      verification:"AI Generated → Curriculum Mapped → Pending Teacher/Reviewer Verification"
    };
  }

  function coordinate(item){
    var all = read(COORD_KEY, []);
    var key = [item.countryCode,item.schoolId,item.subject,item.term,item.day,item.teachingConcept].join("|");
    var group = all.filter(function(x){return x.key===key;})[0];
    if(!group){
      group={key:key,countryCode:item.countryCode,country:item.country,schoolId:item.schoolId,school:item.school,
        subject:item.subject,term:item.term,day:item.day,teachingConcept:item.teachingConcept,
        classIds:[],requests:[],updatedAt:new Date().toISOString()};
      all.push(group);
    }
    if(item.classId && group.classIds.indexOf(item.classId)<0) group.classIds.push(item.classId);
    group.requests.push(item.id);
    group.updatedAt=new Date().toISOString();
    write(COORD_KEY,all);
    item.coordinationGroup=key;
    item.applicableClassCount=group.classIds.length;
    return item;
  }

  function request(){
    var ctx=context();
    if(!ctx.countryCode) return {success:false,reason:"Registered country curriculum link required."};
    if(!ctx.schoolId) return {success:false,reason:"Authorized school context required."};
    var item=coordinate(generate(ctx));
    var requests=read(REQUEST_KEY,[]);
    requests.push(item);
    if(requests.length>200) requests=requests.slice(-200);
    write(REQUEST_KEY,requests);
    try {
      if(window.PacificEducationCountryConfig && typeof window.PacificEducationCountryConfig.upsertDailyActivity==="function"){
        window.PacificEducationCountryConfig.upsertDailyActivity({
          id:item.id,countryCode:item.countryCode,classReference:item.classId,level:item.level,
          subject:item.subject,term:item.term,day:item.day,teachingConcept:item.teachingConcept,
          sourceType:item.sourceType,activity:item.teacherActivity,performance:item.performanceTask,
          status:item.status,coordinationGroup:item.coordinationGroup
        });
      }
    } catch(e){}
    return {success:true,item:item};
  }

  function render(){
    var host=document.getElementById("teacherDashboard");
    if(!host || document.getElementById("pacificEducationTeacherCoordinatedDailyActivity")) return;
    var section=document.createElement("section");
    section.id="pacificEducationTeacherCoordinatedDailyActivity";
    section.setAttribute("aria-label","Teacher requested coordinated daily activity");
    section.style.cssText="margin:12px 0;padding:14px;border:2px solid currentColor;border-radius:8px;";
    section.innerHTML="<h3>Teacher Daily Activity & Performance</h3>"+
      "<p><strong>Teacher request required:</strong> PacEdu will automatically check the registered country curriculum, today's teaching concept, applicable school/region classes and educational current affairs.</p>"+
      '<button type="button" id="pacificEducationRequestCoordinatedDailyActivity" style="min-height:48px;padding:12px 16px;font-weight:bold;">📚 Request Today\'s Coordinated Activity</button>'+
      '<div id="pacificEducationCoordinatedDailyActivityStatus" role="status" aria-live="polite" style="margin-top:10px;">No teacher request made for this session.</div>';
    host.insertBefore(section,host.firstChild);
    document.getElementById("pacificEducationRequestCoordinatedDailyActivity").addEventListener("click",function(){
      var status=document.getElementById("pacificEducationCoordinatedDailyActivityStatus");
      var result=request();
      if(!result.success){status.textContent="Request not completed: "+result.reason; return;}
      var i=result.item;
      status.innerHTML="<strong>Activity prepared — Teacher Review Required.</strong><br>"+
        "Shared concept: "+esc(i.teachingConcept)+"<br>"+
        "Source: "+esc(i.sourceType)+"<br>"+
        "Class activity: "+esc(i.teacherActivity)+"<br>"+
        "Performance: "+esc(i.performanceTask)+"<br>"+
        "Coordinated applicable classes currently registered: "+esc(i.applicableClassCount)+
        "<br><em>"+esc(i.verification)+"</em>";
      if(window.PacificEducationAccessibilityRuntime && window.PacificEducationAccessibilityRuntime.announce)
        window.PacificEducationAccessibilityRuntime.announce("Today's coordinated teacher activity has been prepared for review.");
    });
  }

  window.PacificEducationTeacherDailyActivityCoordinator={
    request:request, context:context, render:render, version:"1.0.0"
  };
  function init(){ render(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  window.addEventListener("load",init);
  document.addEventListener("pacificEducationSelectionChanged",init);
})(window,document);
