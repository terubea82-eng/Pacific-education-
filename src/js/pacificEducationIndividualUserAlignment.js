/*
 * Pacific Education — Individual User Alignment Engine
 * Pilot-safe personalisation boundary.
 * Aligns visible learning features to the currently registered user without
 * inventing curriculum evidence or exposing payer/identity details.
 */
(function(window, document){
  "use strict";
  var VERSION="1.0.0";
  var PROFILE_KEY="pacificEducationIndividualUserAlignmentV1";
  var TYPES=["multiple_choice","true_false","matching","short_answer","long_answer"];
  var CAPABILITY_TYPE={foundation:"matching",remedial:"multiple_choice",developing:"true_false",expected:"short_answer",advanced:"long_answer"};

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
  function paceduId(u){return String((u.current&&u.current.userId)||(u.current&&u.current.pacificEducationId)||read("pacificEducationId","")||read("pacificEducationUserId","")||"").trim();}
  function role(u){return String((u.current&&u.current.role)||read("pacificEducationRole","")||read("pilotRole","")||"student").trim().toLowerCase();}
  function access(u){
    var status=String((u.entitlement&&u.entitlement.status)||read("pacificEducationAccessStatus","UNPAID")).toUpperCase();
    return {status:status,full:["PAID","SPONSORED"].indexOf(status)>=0};
  }
  function capability(){var c=String(read("pacificEducationCapability","expected")).toLowerCase();return CAPABILITY_TYPE[c]?c:"expected";}
  function profile(){
    var u=user(), a=access(u), d=Math.max(1,Math.min(365,number("currentDayNumber",1)));
    var p={
      paceduId:paceduId(u), role:role(u), level:read("pacificEducationLevel","Class 1"), subject:read("pacificEducationSubject","English"),
      term:read("pacificEducationTerm","Term 1"), capability:capability(), dayNumber:d, accessStatus:a.status, fullAccess:a.full,
      interfaceLanguage:String(u.prefs.interfaceLanguage||"English"), learningLanguage:String(u.prefs.learningLanguage||read("pacificEducationLearningLanguage","English")),
      textScale:read("pacificEducationTextScale","normal"), updatedAt:new Date().toISOString()
    };
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(p));}catch(e){}
    return p;
  }
  function recommendedType(p){
    var preferred=CAPABILITY_TYPE[p.capability];
    var types=window.PacificEducationActivityTypes||TYPES;
    return types.indexOf(preferred)>=0?preferred:(types[(p.dayNumber-1)%types.length]||"short_answer");
  }
  function activityLabel(t){
    var labels=window.PacificEducationActivity&&window.PacificEducationActivity.labels;
    return labels&&labels[t]?labels[t]:({multiple_choice:"Multiple Choice",true_false:"True or False",matching:"Matching",short_answer:"Short Answer",long_answer:"Long Answer"}[t]||t);
  }
  function renderProfile(p){
    var app=document.getElementById("app");if(!app)return;
    var s=document.getElementById("pacificEducationIndividualAlignment");
    if(!s){s=document.createElement("section");s.id="pacificEducationIndividualAlignment";s.setAttribute("aria-label","Individual user alignment");app.insertBefore(s,document.getElementById("dailyLesson")||app.firstChild);}
    var label=p.paceduId?"Registered Pacific Education ID linked":"Registered pilot profile";
    s.innerHTML="<h2>Your Individual Learning Alignment</h2>"+
      "<p><strong>"+label+"</strong></p>"+
      "<p><strong>Role:</strong> "+escapeHtml(p.role)+" • <strong>Level:</strong> "+escapeHtml(p.level)+" • <strong>Subject:</strong> "+escapeHtml(p.subject)+" • <strong>Term:</strong> "+escapeHtml(p.term)+"</p>"+
      "<p><strong>Learning pathway:</strong> "+escapeHtml(p.capability)+" • <strong>Current learning day:</strong> Day "+p.dayNumber+"</p>"+
      "<p><strong>Suggested activity:</strong> Day "+p.dayNumber+" Activities — "+escapeHtml(activityLabel(recommendedType(p)))+"</p>"+
      "<p><strong>Access:</strong> "+escapeHtml(p.fullAccess?"Full pilot features through verified paid/sponsored entitlement":"Activities viewing only until paid/sponsored access is verified")+"</p>"+
      "<p><small>Activities remain linked to the selected level, subject, term, capability and available curriculum evidence. No curriculum indicator is invented when official verification is missing.</small></p>";
  }
  function escapeHtml(v){return String(v==null?"":v).replace(/[&<>\"']/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]);});}
  function updateDailyBrowser(p){
    var section=document.getElementById("pacificDailyActivityBrowser");if(!section)return;
    var ps=section.querySelectorAll("p"), target=null;
    for(var i=0;i<ps.length;i++){if(/Current day:/.test(ps[i].textContent||"")){target=ps[i];break;}}
    if(target)target.textContent="Current learning day: Day "+p.dayNumber+" • Suggested activity: Day "+p.dayNumber+" Activities — "+activityLabel(recommendedType(p));
    var intro=section.querySelector("p");
    if(intro&&/Choose any term day/.test(intro.textContent||"")) intro.textContent="Your daily activities are aligned to your registered learning profile. You may explore other days for authorised review.";
  }
  function refresh(){var p=profile();renderProfile(p);updateDailyBrowser(p);return p;}
  function start(){refresh();var obs=new MutationObserver(function(){var p=profile();updateDailyBrowser(p);});var app=document.getElementById("app");if(app)obs.observe(app,{childList:true,subtree:true});
    document.addEventListener("pacificEducationSelectionChanged",refresh);document.addEventListener("pacificEducationCoverageRefresh",refresh);window.addEventListener("storage",function(e){if(e&&/^(pacificEducationLevel|pacificEducationSubject|pacificEducationTerm|pacificEducationCapability|currentDayNumber|pacificEducationAccessStatus)$/.test(e.key||""))refresh();});
  }
  window.PacificEducationIndividualUserAlignment=Object.freeze({version:VERSION,profile:profile,refresh:refresh,recommendedType:function(){return recommendedType(profile());},productionEligible:false});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})(window,document);
