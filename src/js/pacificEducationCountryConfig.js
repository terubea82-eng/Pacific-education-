(function(window,document){"use strict";
var DEFAULT_LEVELS=["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","Class 13"];
var DEFAULT_TERMS=["Term 1","Term 2","Term 3"];
var DEFAULT_SUBJECTS=[
"English","Mathematics","Science","Basic Science","Elementary Science","Biology","Chemistry","Physics",
"Health Science","Health & Physical Education","Geography","History","Social Science","Accounting","Economics",
"Business/Enterprise Studies","Office Technology","Computer Studies","Agricultural Science","Home Economics",
"Basic Technology","Basic Graphics Technology","Applied Technology","Technical Drawing","Arts","Vosa Vakaviti",
"Hindi","Urdu","Other"
];
var defaults={
 country:"Fiji",educationAuthority:"Ministry of Education",language:"English",currency:"FJD",
 institutionType:"School",institutionName:"Pacific Education Pilot",institutionAuthority:"Institution controlled",
 levelSystem:"National system",termSystem:"National system",nationalExamName:"National examinations",legalLanguage:"English",
 academicUnits:["Faculty","School","Department","Programme"],programmes:["General education"],courses:["Course"],
 assessmentSystem:"Institution-defined",gradingSystem:"Institution-defined",creditSystem:"Institution-defined",
 levels:DEFAULT_LEVELS,terms:DEFAULT_TERMS,subjects:DEFAULT_SUBJECTS
};
var state=clone(defaults);
function clone(v){return JSON.parse(JSON.stringify(v));}
function clean(v){return String(v||"").replace(/\s+/g," ").trim();}
function cleanList(value,fallback){
 if(!Array.isArray(value)) return fallback.slice();
 var list=value.map(clean).filter(Boolean);
 return list.length?list:fallback.slice();
}
function load(config){
 config=config||{};
 ["country","educationAuthority","language","currency","institutionType","institutionName","institutionAuthority","levelSystem","termSystem","nationalExamName","legalLanguage","assessmentSystem","gradingSystem","creditSystem"].forEach(function(k){
   if(config[k]!==undefined&&clean(config[k])) state[k]=clean(config[k]);
 });
 if(config.levels!==undefined) state.levels=cleanList(config.levels,DEFAULT_LEVELS);
 if(config.terms!==undefined) state.terms=cleanList(config.terms,DEFAULT_TERMS);
 if(config.subjects!==undefined) state.subjects=cleanList(config.subjects,DEFAULT_SUBJECTS);
 if(config.academicUnits!==undefined) state.academicUnits=cleanList(config.academicUnits,defaults.academicUnits);
 if(config.programmes!==undefined) state.programmes=cleanList(config.programmes,defaults.programmes);
 if(config.courses!==undefined) state.courses=cleanList(config.courses,defaults.courses);
 render();
 document.dispatchEvent(new CustomEvent("pacificEducationCountryConfigChanged",{detail:clone(state)}));
 return getState();
}
function getState(){return clone(state);}
function getLevels(){return state.levels.slice();}
function getTerms(){return state.terms.slice();}
function getSubjects(){return state.subjects.slice();}
function getAcademicUnits(){return state.academicUnits.slice();}
function getProgrammes(){return state.programmes.slice();}
function getCourses(){return state.courses.slice();}
function reset(){state=clone(defaults);render();document.dispatchEvent(new CustomEvent("pacificEducationCountryConfigChanged",{detail:clone(state)}));return getState();}
function ensureUI(){
 var app=document.getElementById("app");if(!app||document.getElementById("pacificEducationCountrySettings"))return;
 var s=document.createElement("section");s.id="pacificEducationCountrySettings";s.hidden=true;
 s.innerHTML='<h2>Institution & Education System</h2><p>Pacific Education can be configured for schools, colleges, universities, training providers and other education organisations. Each institution can define its own structure, programmes, courses, academic calendar, assessment, grading and credit rules.</p><p><strong>International mapping:</strong> Optional UNESCO ISCED mapping can support cross-country comparison without replacing national terminology, institutional autonomy or national authority.</p><div id="pacificEducationCountrySettingsSummary"></div>';
 app.appendChild(s);
}
function render(){
 ensureUI();var e=document.getElementById("pacificEducationCountrySettingsSummary");if(!e)return;
 e.innerHTML="<p><strong>Country:</strong> "+esc(state.country)+"</p><p><strong>Institution:</strong> "+esc(state.institutionName)+" • <strong>Type:</strong> "+esc(state.institutionType)+"</p><p><strong>Education authority:</strong> "+esc(state.educationAuthority)+"</p><p><strong>Language:</strong> "+esc(state.language)+"</p><p><strong>Currency:</strong> "+esc(state.currency)+"</p><p><strong>Level system:</strong> "+esc(state.levelSystem)+"</p><p><strong>Term system:</strong> "+esc(state.termSystem)+"</p><p><strong>National examination name:</strong> "+esc(state.nationalExamName)+"</p><p><strong>Academic units:</strong> "+state.academicUnits.length+" • <strong>Programmes:</strong> "+state.programmes.length+" • <strong>Courses:</strong> "+state.courses.length+"</p><p><strong>Assessment:</strong> "+esc(state.assessmentSystem)+" • <strong>Grading:</strong> "+esc(state.gradingSystem)+" • <strong>Credits:</strong> "+esc(state.creditSystem)+"</p><p><strong>Configured levels:</strong> "+state.levels.length+" • <strong>Terms:</strong> "+state.terms.length+" • <strong>Subjects:</strong> "+state.subjects.length+"</p>";
}
function esc(v){return String(v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
var CURRICULUM_SPACE_VERSION="1.0.0";
var curriculumSpaces={};
var CURRICULUM_SPACE_STORAGE_KEY="pacificEducationCountryCurriculumSpacesV1";
function restoreCurriculumSpaces(){try{var raw=localStorage.getItem(CURRICULUM_SPACE_STORAGE_KEY);var parsed=raw?JSON.parse(raw):{};if(parsed&&typeof parsed==="object")curriculumSpaces=parsed;}catch(e){}}
function persistCurriculumSpaces(){try{localStorage.setItem(CURRICULUM_SPACE_STORAGE_KEY,JSON.stringify(curriculumSpaces));}catch(e){}}
function ensureCurriculumSpace(code,name){
  code=String(code||"").trim().toUpperCase();
  if(!code)return null;
  if(!curriculumSpaces[code]) curriculumSpaces[code]={
    countryCode:code,country:name||code,levels:[],subjects:[],terms:[],
    dailyActivities:{},practice:{},assessments:{},status:"NOT_CONFIGURED",
    sourceAuthority:"Requires country education authority validation",
    sourceStatus:"NOT_VALIDATED"
  };
  return curriculumSpaces[code];
}
function curriculumCountryCode(){
  try{return String(localStorage.getItem("pacificEducationCurriculumCountryCode")||"").trim().toUpperCase();}catch(e){return "";}
}
function getCurriculumSpace(code){
  var c=String(code||curriculumCountryCode()||"FJ").trim().toUpperCase();
  var space=ensureCurriculumSpace(c,c===String(state.country||"").toUpperCase()?"":c);
  if(c==="FJ" && space.status==="NOT_CONFIGURED"){
    space.country="Fiji"; space.levels=state.levels.slice(); space.subjects=state.subjects.slice(); space.terms=state.terms.slice();
    space.status="PILOT_REFERENCE_ONLY"; space.sourceAuthority="Fiji Ministry of Education";
    space.sourceStatus="CURRENT_OFFICIAL_CURRICULUM_VALIDATION_REQUIRED";
  }
  return clone(space);
}
function setCurriculumSpace(config){
  config=config||{};
  var c=String(config.countryCode||config.code||"").trim().toUpperCase();
  if(!c)return null;
  var space=ensureCurriculumSpace(c,config.country||c);
  ["country","status","sourceAuthority","sourceStatus"].forEach(function(k){if(config[k]!==undefined&&clean(config[k]))space[k]=clean(config[k]);});
  if(Array.isArray(config.levels))space.levels=cleanList(config.levels,[]);
  if(Array.isArray(config.subjects))space.subjects=cleanList(config.subjects,[]);
  if(Array.isArray(config.terms))space.terms=cleanList(config.terms,[]);
  if(config.dailyActivities && typeof config.dailyActivities==="object")space.dailyActivities=clone(config.dailyActivities);
  if(config.practice && typeof config.practice==="object")space.practice=clone(config.practice);
  if(config.assessments && typeof config.assessments==="object")space.assessments=clone(config.assessments);
  return clone(space);
}
function linkRegisteredUserToCurriculum(user){
  user=user||{};
  var code=String(user.countryCode||user.country||curriculumCountryCode()||"").trim().toUpperCase();
  if(!code)return {linked:false,reason:"Country required"};
  var space=getCurriculumSpace(code);
  try{
    localStorage.setItem("pacificEducationLinkedCurriculumCountryCode",code);
    localStorage.setItem("pacificEducationLinkedCurriculumCountry",space.country);
    localStorage.setItem("pacificEducationLinkedCurriculumSpaceVersion",CURRICULUM_SPACE_VERSION);
  }catch(e){}
  return {linked:true,countryCode:code,country:space.country,space:space};
}
function curriculumSpaceStatus(code){var s=getCurriculumSpace(code);return {countryCode:s.countryCode,country:s.country,status:s.status,sourceStatus:s.sourceStatus,levels:s.levels.length,subjects:s.subjects.length,terms:s.terms.length};}
window.PacificEducationCountryConfig={
 load:load,getState:getState,getLevels:getLevels,getTerms:getTerms,getSubjects:getSubjects,getAcademicUnits:getAcademicUnits,getProgrammes:getProgrammes,getCourses:getCourses,getLegalLanguage:function(){return state.legalLanguage;},reset:reset,render:render,curriculumSpaceVersion:CURRICULUM_SPACE_VERSION,getCurriculumSpace:getCurriculumSpace,setCurriculumSpace:setCurriculumSpace,linkRegisteredUserToCurriculum:linkRegisteredUserToCurriculum,curriculumSpaceStatus:curriculumSpaceStatus,upsertDailyActivity:upsertDailyActivity,getDailyActivity:getDailyActivity,setRegisteredCurriculumLink:setRegisteredCurriculumLink,
 defaults:function(){return clone(defaults);}
};
restoreCurriculumSpaces();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUI);else ensureUI();
})(window,document);