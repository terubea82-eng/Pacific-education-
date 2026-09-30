(function(window,document){"use strict";
var REQUIRED=[
 ["PacificEducationLanguagePreferences","Multilingual language preferences"],
 ["PacificEducationCountryConfig","Country configuration"],
 ["PacificEducationLegalFramework","Legal/regulatory framework"],
 ["PacificEducationMandatedWorkspace","Lawful mandated workspace"],
 ["PacificEducationInstitutionInformationRegistry","Institution information registry"],
 ["PacificEducationPreviousRecords","Previous records"],
 ["PacificEducationRealWorldSkills","Real-world skills"],
 ["PacificEducationExamCalendar","Examination calendar"],
 ["PacificEducationMinistryExamEngine","Official examination scope engine"]
];
function status(ok,label,detail){return {ok:!!ok,label:label,detail:detail||""};}
function check(){
 var out=[],i;
 for(i=0;i<REQUIRED.length;i++){
  var name=REQUIRED[i][0],label=REQUIRED[i][1];
  out.push(status(!!window[name],label,window[name]?"Loaded":"Missing from current runtime"));
 }
 var productionLocked=true;
 try{
  var text=String(document.body&&document.body.innerText||"");
  productionLocked=/productionEligible\s*false/i.test(text)||/production.*blocked/i.test(text);
 }catch(e){}
 out.push(status(productionLocked,"Production release boundary",productionLocked?"Production remains blocked/locked":"Verify production gate before pilot use"));
 out.push(status(!!document.getElementById("pacificEducationSingleRegistration"),"Single pilot registration","Registration entry is present"));
 out.push(status(!!document.getElementById("pilotBanner"),"Pilot notice","Pilot notice is present"));
 return out;
}
function render(){
 var app=document.getElementById("app");if(!app)return;
 var s=document.getElementById("pacificEducationPilotReadinessSelfCheck");
 if(!s){s=document.createElement("section");s.id="pacificEducationPilotReadinessSelfCheck";s.setAttribute("aria-label","Pilot readiness self check");app.appendChild(s);}
 var results=check(),pass=results.filter(function(x){return x.ok;}).length;
 s.innerHTML="<h2>Pilot Readiness Self-Check</h2><p><strong>"+pass+"/"+results.length+" checks passed.</strong> This is a runtime diagnostic, not production approval.</p>"+
 "<ul>"+results.map(function(x){return "<li><strong>"+(x.ok?"PASS":"CHECK")+"</strong> — "+x.label+" — "+x.detail+"</li>";}).join("")+"</ul>"+
 "<p><small>Any failed check must be investigated before relying on the affected pilot function. This diagnostic never unlocks production.</small></p>";
}
function run(){try{render();}catch(e){console.warn("Pilot readiness self-check recovered from error.",e);}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
window.PacificEducationPilotReadinessSelfCheck={check:check,render:render,version:"1.0.0"};
})(window,document);