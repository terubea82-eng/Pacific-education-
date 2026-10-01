/*
 * Pacific Education — Individual User Alignment Engine
 * Pilot-safe personalisation boundary.
 * One simple registration creates/uses one individual pilot workspace.
 * Only the registered user's role-relevant dashboard is shown.
 */
(function(window, document){
  "use strict";
  var VERSION="1.2.1";
  var PROFILE_KEY="pacificEducationIndividualUserAlignmentV1";
  var TYPES=["multiple_choice","true_false","matching","short_answer","long_answer"];
  var CAPABILITY_TYPE={foundation:"matching",remedial:"multiple_choice",developing:"true_false",expected:"short_answer",advanced:"long_answer"};
  var DASHBOARD_TARGET={student:"learningPlatform",teacher:"teacherDashboard","special-education":"specialEducationDashboard",parent:"parentDashboard",professional:"pacificEducationExternalReviewerPortal",ngo:"pacificEducationCoverageDashboard",education:"pacificEducationCoverageDashboard",community:"pacificEducationCoverageDashboard",owner:"systemStatus","head-of-school":"pacificEducationSchoolIdentitySection","institution-admin":"pacificEducationInstitutionSetup"};

  function read(key,fallback){try{var v=localStorage.getItem(key);return v===null?fallback:v;}catch(e){return fallback;}}
  function json(key,fallback){try{return JSON.parse(read(key,""))||fallback;}catch(e){return fallback;}}
  function number(key,fallback){var n=Number(read(key,String(fallback)));return isFinite(n)?n:fallback;}
  function user(){
    var core=window.PacificEducationCore;
    var current=core&&typeof core.getCurrentUser==="function"?core.getCurrentUser():null;
    var identity=json("pacificEducationAccountIdentity",{});
    var prefs=json("pacificEducationLanguagePreferencesV1",{});
    var ent=json("pacificEducationAccessEntitlementV1",{});
    return {current:current||{},identity:identity||{},prefs:prefs||{},entitlement:ent||{}};
  }
  function paceduId(u){return String(read("pacificEducationUserId","")||read("pacificEducationId","")||(u.current&&u.current.userId)||(u.current&&u.current.pacificEducationId)||"").trim();}
  function role(u){return String((u.current&&u.current.role)||read("pacificEducationRole","")||read("pilotRole","")||"student").trim().toLowerCase();}
  function access(u){var status=String((u.entitlement&&u.entitlement.status)||read("pacificEducationAccessStatus","UNPAID")).toUpperCase();return {status:status,full:["PAID","SPONSORED"].indexOf(status)>=0};}
  function capability(){var c=String(read("pacificEducationCapability","expected")).toLowerCase();return CAPABILITY_TYPE[c]?c:"expected";}
  function profile(){
    var u=user(),a=access(u),d=Math.max(1,Math.min(365,number("currentDayNumber",1)));
    var p={paceduId:paceduId(u),role:role(u),level:read("pacificEducationLevel","Class 1"),subject:read("pacificEducationSubject","English"),term:read("pacificEducationTerm","Term 1"),capability:capability(),dayNumber:d,accessStatus:a.status,fullAccess:a.full,interfaceLanguage:String(u.prefs.interfaceLanguage||"English"),learningLanguage:String(u.prefs.learningLanguage||read("pacificEducationLearningLanguage","English")),textScale:read("pacificEducationTextScale","normal"),updatedAt:new Date().toISOString()};
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(p));}catch(e){}
    return p;
  }
  function recommendedType(p){var preferred=CAPABILITY_TYPE[p.capability],types=window.PacificEducationActivityTypes||TYPES;return types.indexOf(preferred)>=0?preferred:(types[(p.dayNumber-1)%types.length]||"short_answer");}
  function renderProfile(p){
    var old=document.getElementById("pacificEducationIndividualAlignment");if(old)old.remove();
    var target=document.getElementById(DASHBOARD_TARGET[p.role]||"");if(!target)return;
    var s=document.createElement("section");s.id="pacificEducationIndividualAlignment";s.setAttribute("aria-label","Your dashboard summary");s.style.cssText="margin:10px 0;padding:12px;border:1px solid currentColor;border-radius:8px";
    s.innerHTML="<h3 style=\"margin-top:0\">Your Dashboard</h3>"+
      "<p><strong>Role:</strong> "+escapeHtml(p.role)+"</p>"+
      (p.level?"<p><strong>Class / Level:</strong> "+escapeHtml(p.level)+"</p>":"")+ 
      (p.subject?"<p><strong>Subject:</strong> "+escapeHtml(p.subject)+"</p>":"")+ 
      (p.term?"<p><strong>Term:</strong> "+escapeHtml(p.term)+"</p>":"")+ 
      "<p><strong>Current learning day:</strong> Day "+p.dayNumber+" of 365</p>"+
      "<p><strong>Suggested activity:</strong> Day "+p.dayNumber+" Activities</p>";
    target.insertBefore(s,target.firstChild||null);
  }
  function escapeHtml(v){return String(v==null?"":v).replace(/[&<>\"']/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c);});}
  function updateDailyBrowser(p){
    var section=document.getElementById("pacificDailyActivityBrowser");if(!section)return;
    var ps=section.querySelectorAll("p"),target=null;
    for(var i=0;i<ps.length;i++){if(/Current day:|Recommended:|Suggested activity:/.test(ps[i].textContent||"")){target=ps[i];break;}}
    if(target)target.textContent="Current learning day: Day "+p.dayNumber+" • Suggested activity: Day "+p.dayNumber+" Activities";
    var intro=section.querySelector("p");if(intro&&/Choose any term day/.test(intro.textContent||""))intro.textContent="Daily activities follow your registered learning profile. Other days are available for authorised review.";
  }
  function refresh(){var p=profile();renderProfile(p);updateDailyBrowser(p);return p;}
  function start(){
    refresh();
    var scheduled=false;
    var obs=new MutationObserver(function(){if(scheduled)return;scheduled=true;setTimeout(function(){scheduled=false;var p=profile();updateDailyBrowser(p);},80);});
    var app=document.getElementById("app");if(app)obs.observe(app,{childList:true,subtree:true});
    document.addEventListener("pacificEducationSelectionChanged",refresh);
    document.addEventListener("pacificEducationCoverageRefresh",refresh);
    window.addEventListener("storage",function(e){if(e&&/^(pacificEducationLevel|pacificEducationSubject|pacificEducationTerm|pacificEducationCapability|currentDayNumber|pacificEducationAccessStatus|pacificEducationUserId)$/.test(e.key||""))refresh();});
  }
  window.PacificEducationIndividualUserAlignment=Object.freeze({version:VERSION,profile:profile,refresh:refresh,recommendedType:function(){return recommendedType(profile());},productionEligible:false});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})(window,document);
