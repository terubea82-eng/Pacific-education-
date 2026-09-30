(function(window,document){"use strict";
function item(ok,label,detail,severity){return {ok:!!ok,label:label,detail:detail||"",severity:severity||"PASS"};}
function safe(fn,fallback){try{return fn();}catch(e){return fallback;}}
function check(){
 var out=[];
 var gate=safe(function(){return window.PacificEducationProductionFinalGate&&window.PacificEducationProductionFinalGate.check();},null);
 out.push(item(!!gate&&!gate.ready&&!gate.productionApproved&&!gate.productionEligible&&gate.failClosed,"Production final gate","Fail-closed: production remains blocked","PASS"));
 var guard=safe(function(){return window.PacificEducationPilotIntegrityGuard&&window.PacificEducationPilotIntegrityGuard.isProductionAuthorized();},true);
 out.push(item(guard===false,"Pilot integrity boundary","Production authorization is false","PASS"));
 out.push(item(!!document.getElementById("pilotBanner"),"Controlled pilot notice","Pilot notice is present","PASS"));
 out.push(item(!!document.getElementById("pacificEducationSingleRegistration"),"Pilot registration","Registration entry is present","PASS"));
 out.push(item(!!document.getElementById("pacificEducationAccessibilityControls"),"Accessibility controls","Accessibility controls are present","PASS"));
 out.push(item(!!window.PacificEducationAccessibilityRuntime,"Accessibility runtime","Accessibility runtime is loaded","PASS"));
 out.push(item(!!window.PacificEducationOfflineRuntime,"Offline runtime","Offline runtime is loaded","PASS"));
 out.push(item(!!window.PacificEducationDailyLessons&&typeof window.getDailyLesson==="function","Daily lessons","Daily lesson engine is loaded","PASS"));
 var dayRange=safe(function(){
   if(typeof window.getDailyLesson!=="function")return false;
   return !!window.getDailyLesson(1)&&!!window.getDailyLesson(365);
 },false);
 out.push(item(dayRange,"Daily range","Day 1 and Day 365 are addressable","PASS"));
 out.push(item(!!window.PacificEducationAssessments,"Assessment runtime","Assessment module is loaded","PASS"));
 out.push(item(!!window.PacificEducationInstitutionSetup,"Institution configuration","Institution setup and attendance configuration are loaded","PASS"));
 out.push(item(!!window.PacificEducationInstitutionInformationRegistry,"Institution registry","Central information registry is loaded","PASS"));
 out.push(item(!!window.PacificEducationPreviousRecords,"Previous records","Authorised records module is loaded","PASS"));
 out.push(item(!!window.PacificEducationMandatedWorkspace,"Lawful workspace alignment","Mandated workspace engine is loaded","PASS"));
 out.push(item(!!window.PacificEducationLanguagePreferences,"Language preferences","User language preferences are loaded","PASS"));
 out.push(item(!!window.PacificEducationLegalFramework,"Legal framework","Legal/regulatory framework boundary is loaded","PASS"));
 var roles=["student","teacher","special-education","parent","professional","ngo","education","community","head-of-school","institution-admin","owner"];
 var sel=document.getElementById("pilotRoleSelector");
 out.push(item(!!sel&&roles.every(function(r){return Array.prototype.some.call(sel.options,function(o){return o.value===r;});}),"Pilot role coverage","All configured pilot roles are selectable","PASS"));
 var text=String(document.body&&document.body.innerText||"");
 out.push(item(/synthetic|test\/demo data/i.test(text),"Synthetic-data warning","Pilot page warns against entering real sensitive data","PASS"));
 return out;
}
function render(){
 var app=document.getElementById("app");if(!app)return;
 var s=document.getElementById("pacificEducationPilotReadinessSelfCheck");
 if(!s){s=document.createElement("section");s.id="pacificEducationPilotReadinessSelfCheck";s.setAttribute("aria-label","Pilot readiness self check");app.appendChild(s);}
 var results=check(),pass=results.filter(function(x){return x.ok;}).length;
 s.innerHTML="<h2>Pilot Readiness Self-Check</h2><p><strong>"+pass+"/"+results.length+" automated checks passed.</strong> These checks support pilot testing; they do not constitute production approval.</p><ul>"+results.map(function(x){return "<li><strong>"+(x.ok?"PASS":"CHECK")+"</strong> — "+x.label+" — "+x.detail+"</li>";}).join("")+"</ul><p><small>Manual evidence is still required for curriculum verification, real-user testing, accessibility/device testing, privacy, safeguarding, cybersecurity, authorised data integrations and other release-gate items. A failed check must be investigated.</small></p>";
}
function run(){try{render();}catch(e){console.warn("Pilot readiness self-check recovered from error.",e);}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
window.PacificEducationPilotReadinessSelfCheck={check:check,render:render,version:"1.1.0"};
})(window,document);