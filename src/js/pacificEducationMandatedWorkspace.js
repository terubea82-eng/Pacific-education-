(function(w,d){
"use strict";
var KEY="pacificEducationMandatedWorkspaceV1";
var state={version:1,requirements:[],lastUpdated:null};
var DEFAULTS={
  student:{required:["studentStartLearning","dailyLesson","assessments","pacificEducationStudentProgressDashboard"],protected:["studentAssignedClassContext"]},
  teacher:{required:["teacherDashboard","pacificEducationTeacherClassDashboard","dailyLesson","assessments","pacificEducationCoverageDashboard","pacificEducationTeacherEvidence"],protected:["levelSelection","subjectSelection","termSelection"]},
  parent:{required:["parentDashboard","pacificEducationWeekendHolidaySupplementaryActivities","pacificGuardianCommentSection"]},
  "head-of-school":{required:["pacificEducationSchoolIdentitySection","pacificEducationTeacherClassRoster","pacificEducationExamCalendarSection","pacificEducationCoverageDashboard"]},
  "institution-admin":{required:["pacificEducationInstitutionSetup","pacificEducationInstitutionAdvice","pacificEducationExamCalendarSection"]}
};
function esc(x){return String(x==null?"":x).replace(/[&<>\"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"})[c];});}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY)||"{}");if(x&&Array.isArray(x.requirements))state=x;}catch(e){}}
function save(){state.lastUpdated=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));d.dispatchEvent(new CustomEvent("pacificEducationMandatedWorkspaceChanged"));}
function getProfile(role){return DEFAULTS[role]||{required:[],protected:[]};}
function getRequirements(role){return state.requirements.filter(function(x){return x.role===role;});}
function resolve(role,tools){var p=getProfile(role), custom=getRequirements(role), disabled={};custom.forEach(function(x){if(x.enabled===false&&x.authorized===true&&x.source)disabled[x.target]=x;});return tools.filter(function(t){return !disabled[t[0]]||p.required.indexOf(t[0])!==-1||p.protected.indexOf(t[0])!==-1;});}
function register(role,target,label,enabled,source,authorized){
 if(!role||!target||!source)return {ok:false,reason:"Role, workspace function and policy/requirement source are required."};
 if(authorized!==true)return {ok:false,reason:"A workspace change requires confirmation that the requirement is lawful and authorised."};
 state.requirements=state.requirements.filter(function(x){return !(x.role===role&&x.target===target);});
 state.requirements.push({role:role,target:target,label:label||target,enabled:enabled!==false,source:source,authorized:true,createdAt:new Date().toISOString()});save();return {ok:true};
}
function render(){var app=d.getElementById("app");if(!app)return;var s=d.getElementById("pacificEducationMandatedWorkspace");if(!s){s=d.createElement("section");s.id="pacificEducationMandatedWorkspace";s.hidden=true;app.appendChild(s);}s.innerHTML="<h2>Policy & Mandated Workspace Alignment</h2><p><strong>Core rule:</strong> Pacedu adapts workspace functions to the user's authorised duties and applicable lawful requirements. A role title alone does not grant permission.</p><p>Applicable law, regulation, official requirements and institution policy take precedence over Pacedu defaults. Pacedu may advise on conflicts or duplication but does not silently override them.</p><h3>Safe configuration rule</h3><ul><li>Required functions are retained when they are protected by the role's mandated workflow.</li><li>Authorised administrators may enable or disable configurable functions with a documented policy or requirement source.</li><li>Every custom change records its source, authorisation and time.</li><li>Unverified or potentially unlawful requirements are not activated automatically.</li></ul><p><strong>Production boundary:</strong> pilot configuration is local prototype data only; production requires secure identity, authorisation, audit logging and verified legal/institutional controls.</p>";}
function show(){load();render();var s=d.getElementById("pacificEducationMandatedWorkspace");if(s){s.hidden=false;s.scrollIntoView({behavior:"smooth",block:"start"});}}
w.PacificEducationMandatedWorkspace={load:load,save:save,render:render,show:show,resolve:resolve,register:register,getProfile:getProfile,getState:function(){return JSON.parse(JSON.stringify(state));}};
d.addEventListener("DOMContentLoaded",function(){load();render();});
})(window);
