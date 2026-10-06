/* Pacific Education — Teacher Requested Coordinated Daily Activity Engine.
 * Controlled-pilot implementation.
 * Teacher initiates the request; PacEdu automatically derives the curriculum concept,
 * coordinates the concept across applicable classes, and generates a class-level task.
 */
(function(window, document){
  "use strict";

  var REQUEST_KEY = "pacificEducationTeacherDailyActivityRequestsV1";
  var COORD_KEY = "pacificEducationSchoolConceptCoordinationV2";

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
    var regionId="",region="";
try{regionId=String(localStorage.getItem("pacificEducationRegionId")||"").trim();region=String(localStorage.getItem("pacificEducationRegion")||"").trim();}catch(e){}
if(p){regionId=regionId||String(p.regionId||p.region||"").trim();region=region||String(p.region||"").trim();}
return {countryCode:countryCode,country:country,school:school,schoolId:schoolId,regionId:regionId,region:region,classId:classId,level:level,subject:subject,term:term,day:day};
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

  function applicableClasses(ctx){
    var out=[];
    try{
      var r=window.PacificEducationTeacherClassRosterContext;
      var all=r&&typeof r.getClasses==="function"?r.getClasses():{};
      Object.keys(all||{}).forEach(function(id){
        var x=all[id]||{};
        var sameSchool=ctx.schoolId && (String(x.schoolId||x.registrationNumber||"")===String(ctx.schoolId));
        var sameRegion=ctx.regionId && (String(x.regionId||x.region||"")===String(ctx.regionId));
        if((sameSchool||sameRegion) && String(x.subject||ctx.subject||"")===String(ctx.subject||"")) out.push({
          classId:String(x.classId||id),level:String(x.level||""),section:String(x.section||""),
          schoolId:String(x.schoolId||x.registrationNumber||ctx.schoolId||""),regionId:String(x.regionId||x.region||ctx.regionId||"")
        });
      });
    }catch(e){}
    if(!out.some(function(x){return x.classId===ctx.classId;})) out.unshift({classId:ctx.classId,level:ctx.level,schoolId:ctx.schoolId,regionId:ctx.regionId});
    return out;
  }
  function differentiatedPlan(base,x){
    var level=String(x.level||base.level||"Class 1");
    return {
      classId:x.classId,level:level,section:x.section||"",
      sharedConcept:base.teachingConcept,
      activity:"Teacher-guided "+level+" activity applying the shared curriculum concept to an age-appropriate real-world context.",
      performanceTask:"Learner demonstrates understanding at the appropriate level and submits text or audio evidence.",
      assessment:"Teacher checks the same curriculum concept/indicator using differentiated difficulty and method.",
      status:"PENDING_TEACHER_REVIEW"
    };
  }
  function coordinate(item){
    var classes=applicableClasses(item);
    var key=[item.countryCode,item.schoolId||item.regionId,item.subject,item.term,item.day,item.teachingConcept].join("|");
    var all=read(COORD_KEY,[]),group=all.filter(function(x){return x.key===key;})[0];
    if(!group){group={key:key,countryCode:item.countryCode,country:item.country,schoolId:item.schoolId,school:item.school,regionId:item.regionId,region:item.region,subject:item.subject,term:item.term,day:item.day,teachingConcept:item.teachingConcept,classIds:[],classPlans:[],requests:[],updatedAt:new Date().toISOString()};all.push(group);}
    classes.forEach(function(x){
      if(group.classIds.indexOf(x.classId)<0)group.classIds.push(x.classId);
      var plan=differentiatedPlan(item,x);
      var existing=group.classPlans.filter(function(p){return p.classId===x.classId;})[0];
      if(existing)Object.assign(existing,plan);else group.classPlans.push(plan);
      try{
        var cfg=window.PacificEducationCountryConfig;
        if(cfg&&typeof cfg.upsertDailyActivity==="function")cfg.upsertDailyActivity({
          id:"TDA-"+item.id+"-"+x.classId,countryCode:item.countryCode,country:item.country,
          classReference:x.classId,level:x.level,subject:item.subject,term:item.term,day:item.day,
          teachingConcept:item.teachingConcept,sourceType:item.sourceType,currentAffairsId:item.currentAffairsId,
          activity:plan.activity,performance:plan.performanceTask,assessment:plan.assessment,
          status:"PENDING_TEACHER_REVIEW",coordinationGroup:key,
          verification:"AI Generated → Curriculum Mapped → Pending Teacher/Reviewer Verification"
        });
      }catch(e){}
    });
    group.requests.push(item.id);group.updatedAt=new Date().toISOString();write(COORD_KEY,all);
    item.coordinationGroup=key;item.applicableClassCount=group.classIds.length;item.applicableClassIds=group.classIds.slice();item.classPlans=group.classPlans.slice();return item;
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


  /* Teacher approval gate: students cannot view or attempt today's activity until release. */
  var APPROVAL_KEY="pacificEducationTeacherDailyApprovalsV1";
  function approvalRead(){try{return JSON.parse(localStorage.getItem(APPROVAL_KEY)||"{}")||{};}catch(e){return {};}}
  function approvalContext(){
    var c=context();
    c.day=String(localStorage.getItem("currentDayNumber")||c.day||"1");
    return c;
  }
  function approvalKey(c){return [c.classId||"unassigned",c.subject||"subject-not-set",c.term||"term-not-set",c.day||"1"].join("|");}
  function isTeacherApproved(c){return !!approvalRead()[approvalKey(c||approvalContext())];}
  function approvalRole(){
    try{
      var r=sessionStorage.getItem("pacificEducationActiveRole");
      if(r)return String(r).toLowerCase();
      var s=JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration")||"null");
      return String(s&&s.role||"").toLowerCase();
    }catch(e){return "";}
  }
  function announceApproval(text){
    var s=document.getElementById("pacificEducationDailyApprovalStatus");
    if(s)s.textContent=text;
    if(window.PacificEducationAccessibilityRuntime&&typeof window.PacificEducationAccessibilityRuntime.announce==="function"){try{window.PacificEducationAccessibilityRuntime.announce(text);}catch(e){}}
    else if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function"){try{window.PacificEducationSpeech.speakText(text);}catch(e){}}
  }
  function applyStudentApprovalGate(){
    if(approvalRole()!=="student")return;
    var daily=document.getElementById("dailyLesson"); if(!daily)return;
    var c=approvalContext(), ok=isTeacherApproved(c), activity=document.getElementById("dailyLessonActivity");
    var start=document.getElementById("dailyActivitiesStartButton"), practice=document.getElementById("dailyActivitiesContinuePracticeButton");
    var prev=document.getElementById("previousLessonButton"), next=document.getElementById("nextLessonButton");
    var complete=daily.querySelectorAll("button[onclick*='completeLesson']");
    var gate=document.getElementById("pacificEducationStudentDailyApprovalGate");
    if(!gate){
      gate=document.createElement("div");gate.id="pacificEducationStudentDailyApprovalGate";gate.setAttribute("role","status");gate.setAttribute("aria-live","polite");
      gate.style.cssText="margin:12px 0;padding:16px;border:3px solid #15803d;border-radius:8px;background:#f0fdf4;";
      daily.insertBefore(gate,daily.firstChild);
    }
    gate.innerHTML=ok?"<strong>✓ Teacher approved today's activity.</strong><br>You may now start and attempt the Daily Activity.":"<strong>🔒 Waiting for teacher approval.</strong><br>Your teacher must approve and release today's activity before you can view or attempt it.";
    if(start){start.disabled=!ok;start.textContent=ok?"▶️ Start Teacher-Approved Daily Activity":"🔒 Waiting for Teacher Approval";}
    if(activity){activity.hidden=!ok;if(!ok)activity.innerHTML="<p><strong>Activity locked.</strong> Your teacher has not released today's activity yet.</p>";}
    if(practice)practice.disabled=!ok;
    if(prev)prev.disabled=!ok;if(next)next.disabled=!ok;
    Array.prototype.forEach.call(complete,function(b){b.disabled=!ok;});
  }
  function bindTeacherApproval(){
    if(approvalRole()!=="teacher")return;
    var host=document.getElementById("teacherDashboard");if(!host)return;
    var section=document.getElementById("pacificEducationTeacherDailyApproval");
    if(!section){
      section=document.createElement("section");section.id="pacificEducationTeacherDailyApproval";
      section.style.cssText="margin:12px 0;padding:14px;border:3px solid #15803d;border-radius:8px;background:#f0fdf4;";
      section.innerHTML="<h3>Teacher Approval — Daily Activity Release</h3><p><strong>Students cannot start today's Daily Activity until you approve and release it.</strong></p><button type=\"button\" id=\"pacificEducationApproveDailyActivity\" style=\"background:#15803d;color:#fff;border:2px solid #15803d;border-radius:6px;min-height:56px;padding:12px 16px;font-weight:800;\">✓ Approve & Release Today's Activity</button><button type=\"button\" id=\"pacificEducationRevokeDailyActivity\" style=\"margin-left:8px;min-height:48px;padding:10px 14px;\">Revoke Student Access</button><p id=\"pacificEducationDailyApprovalStatus\" role=\"status\" aria-live=\"polite\"></p>";
      host.insertBefore(section,host.firstChild);
    }
    var approve=document.getElementById("pacificEducationApproveDailyActivity"),revoke=document.getElementById("pacificEducationRevokeDailyActivity");
    if(approve&&approve.getAttribute("data-bound")!=="true"){approve.setAttribute("data-bound","true");approve.onclick=function(){
      var c=approvalContext(),all=approvalRead();all[approvalKey(c)]={approved:true,approvedAt:new Date().toISOString(),approvedBy:"pilot-teacher",context:c};write(APPROVAL_KEY,all);
      refreshApprovalUI();announceApproval("Today's Daily Activity has been approved and released. Students may now attempt it.");
    };}
    if(revoke&&revoke.getAttribute("data-bound")!=="true"){revoke.setAttribute("data-bound","true");revoke.onclick=function(){
      var c=approvalContext(),all=approvalRead();delete all[approvalKey(c)];write(APPROVAL_KEY,all);
      refreshApprovalUI();announceApproval("Student access to today's Daily Activity has been revoked.");
    };}
    function refreshApprovalUI(){var ok=isTeacherApproved(),s=document.getElementById("pacificEducationDailyApprovalStatus");if(s)s.textContent=ok?"Approved and released for students.":"Waiting for teacher approval. Students remain locked.";if(approve)approve.disabled=ok;if(revoke)revoke.disabled=!ok;}
    refreshApprovalUI();
  }
  function protectActivityRenderer(){
    if(!window.PacificEducationActivity||typeof window.PacificEducationActivity.render!=="function")return;if(window.PacificEducationActivity.__teacherApprovalGate)return;
    var original=window.PacificEducationActivity.render;
    window.PacificEducationActivity.render=function(type,day,lesson){
      if(approvalRole()==="student"){
        var c=approvalContext();c.day=String(Number(day)||Number(c.day)||1);
        if(!isTeacherApproved(c)){applyStudentApprovalGate();announceApproval("This Daily Activity is locked. Your teacher must approve and release it before you can attempt it.");return false;}
      }
      return original.apply(this,arguments);
    };
    window.PacificEducationActivity.__teacherApprovalGate=true;
  }
  function refreshApprovalUI(){bindTeacherApproval();applyStudentApprovalGate();protectActivityRenderer();}

  window.PacificEducationTeacherDailyActivityCoordinator={
    request:request, context:context, render:render, version:"2.0.0-school-region-coordination"
  };
  function init(){ render(); refreshApprovalUI(); [300,1000,2500].forEach(function(ms){setTimeout(refreshApprovalUI,ms);}); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  window.addEventListener("load",init);
  document.addEventListener("pacificEducationSelectionChanged",init);
})(window,document);
