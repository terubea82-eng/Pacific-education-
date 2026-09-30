/* Pacific Education — Institution Setup & Customisation Centre.
 * Controlled pilot prototype. Institution administrators define their own
 * structure; Pacedu advises on duplicates/conflicts without auto-merging.
 */
(function(window, document) {
  "use strict";

  var STORAGE_KEY = "pacificEducationInstitutionProfileV1";
  var FIELDS = [
    ["institutionName","Institution name"],
    ["institutionType","Institution type"],
    ["country","Country"],
    ["authority","Institution authority / regulator"],
    ["language","Primary language"],
    ["currency","Currency"],
    ["levelLabels","Level / award labels"],
    ["calendarModel","Academic calendar model"],
    ["academicUnits","Academic units"],
    ["programmes","Programmes"],
    ["courses","Courses / modules"],
    ["assessmentModel","Assessment model"],
    ["gradingModel","Grading model"],
    ["creditModel","Credit model"],
    ["examModel","Examination system"],
    ["attendanceModel","Attendance model"],
    ["attendanceRules","Attendance rules"],
    ["academicIntegrity","Academic integrity / plagiarism rules"]
  ];

  var defaults = {
    institutionName:"",
    institutionType:"School",
    country:"Fiji",
    authority:"Institution controlled",
    language:"English",
    currency:"FJD",
    levelLabels:[],
    calendarModel:"Term",
    academicUnits:["Faculty","School","Department"],
    programmes:[],
    courses:[],
    assessmentModel:"Institution-defined",
    gradingModel:"Institution-defined",
    creditModel:"Institution-defined",
    examModel:"Institution-defined",
    attendanceModel:"Daily / class-by-class",
    attendanceRules:"",
    academicIntegrity:"Institution-defined"
  };

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function clean(v){ return String(v == null ? "" : v).replace(/\s+/g," ").trim(); }
  function list(v){ return String(v || "").split(/[\n,;]+/).map(clean).filter(Boolean); }
  function unique(a){ var seen={}; return a.filter(function(x){var k=x.toLowerCase();if(seen[k])return false;seen[k]=true;return true;}); }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];}); }

  function load(){
    var state=clone(defaults);
    try {
      var saved=JSON.parse(window.localStorage.getItem(STORAGE_KEY)||"null");
      if(saved && typeof saved==="object") Object.keys(state).forEach(function(k){ if(saved[k]!==undefined) state[k]=saved[k]; });
    } catch(e){}
    return state;
  }
  var state=load();

  function save(){
    try { window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch(e){}
    document.dispatchEvent(new CustomEvent("pacificEducationInstitutionConfigChanged",{detail:clone(state)}));
    if(window.PacificEducationCountryConfig && typeof window.PacificEducationCountryConfig.load==="function"){
      window.PacificEducationCountryConfig.load({
        country:state.country, language:state.language, currency:state.currency,
        institutionType:state.institutionType, institutionName:state.institutionName,
        institutionAuthority:state.authority, termSystem:state.calendarModel,
        levels:state.levelLabels.length?state.levelLabels:undefined,
        academicUnits:state.academicUnits.length?state.academicUnits:undefined,
        programmes:state.programmes.length?state.programmes:undefined,
        courses:state.courses.length?state.courses:undefined,
        assessmentSystem:state.assessmentModel, gradingSystem:state.gradingModel,
        creditSystem:state.creditModel
      });
    }
    renderSummary();
  }

  function normaliseForMatch(s){
    return clean(s).toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ");
  }

  function duplicateAdvice(){
    var entries=[];
    ["academicUnits","levelLabels","programmes","courses"].forEach(function(k){
      (state[k]||[]).forEach(function(v){ entries.push({field:k,value:clean(v)}); });
    });
    var duplicates=[];
    var seen={};
    entries.forEach(function(e){
      var key=normaliseForMatch(e.value);
      if(!key)return;
      if(seen[key]) duplicates.push({value:e.value,first:seen[key],second:e.field});
      else seen[key]=e.field;
    });
    return duplicates;
  }

  function renderAdvice(){
    var host=document.getElementById("pacificEducationInstitutionAdvice");
    if(!host)return;
    var d=duplicateAdvice();
    var messages=[];
    if(d.length){
      messages.push("<strong>Similar information detected:</strong> "+d.map(function(x){
        return esc(x.value)+" ("+esc(x.first)+" / "+esc(x.second)+")";
      }).join("; ")+". Review it before creating another entry.");
    } else {
      messages.push("<strong>No exact duplicate detected in the current prototype configuration.</strong> Similarity checking is advisory and does not replace institutional review.");
    }
    if(clean(state.attendanceRules)){
      messages.push("<strong>Attendance:</strong> Your institution has defined attendance rules. Confirm whether programme/course-specific rules override the institution-wide rule.");
    }
    if(clean(state.academicIntegrity)){
      messages.push("<strong>Academic integrity:</strong> Configure plagiarism/similarity review, citation expectations, review responsibility and appeal/correction processes. Automated similarity or AI signals must remain advisory.");
    }
    host.innerHTML=messages.map(function(m){return "<p>"+m+"</p>";}).join("");
  }

  function renderSummary(){
    var s=document.getElementById("pacificEducationInstitutionSetupSummary");
    if(!s)return;
    s.innerHTML="<p><strong>Institution:</strong> "+esc(state.institutionName||"Not entered")+" • <strong>Type:</strong> "+esc(state.institutionType)+"</p>"+
      "<p><strong>Country:</strong> "+esc(state.country)+" • <strong>Authority:</strong> "+esc(state.authority)+" • <strong>Language:</strong> "+esc(state.language)+" • <strong>Currency:</strong> "+esc(state.currency)+"</p>"+
      "<p><strong>Calendar:</strong> "+esc(state.calendarModel)+" • <strong>Academic units:</strong> "+state.academicUnits.length+" • <strong>Programmes:</strong> "+state.programmes.length+" • <strong>Courses:</strong> "+state.courses.length+"</p>"+
      "<p><strong>Assessment:</strong> "+esc(state.assessmentModel)+" • <strong>Grading:</strong> "+esc(state.gradingModel)+" • <strong>Credits:</strong> "+esc(state.creditModel)+" • <strong>Exams:</strong> "+esc(state.examModel)+"</p>"+
      "<p><strong>Attendance:</strong> "+esc(state.attendanceModel)+" • <strong>Academic integrity:</strong> "+esc(state.academicIntegrity)+"</p>";
    renderAdvice();
  }

  function inputRow(key,label,value,textarea){
    return "<label style=\"display:block;margin:10px 0\"><strong>"+esc(label)+"</strong><br>"+
      (textarea?"<textarea data-inst-key=\""+key+"\" rows=\"3\" style=\"width:100%;max-width:760px\">"+esc(value)+"</textarea>":
      "<input data-inst-key=\""+key+"\" value=\""+esc(value)+"\" style=\"width:100%;max-width:760px\">")+
      "<small>Separate multiple entries with commas or new lines where applicable.</small></label>";
  }

  function render(){
    var app=document.getElementById("app");
    if(!app)return;
    var section=document.getElementById("pacificEducationInstitutionSetup");
    if(!section){
      section=document.createElement("section");
      section.id="pacificEducationInstitutionSetup";
      section.setAttribute("aria-label","Institution Setup and Customisation Centre");
      section.innerHTML="<h2>Institution Setup & Customisation Centre</h2>"+
        "<p><strong>Administrator controlled:</strong> Each institution enters only the information and rules it needs. Pacedu advises when information appears duplicated or conflicting; it does not automatically delete, merge or override institutional decisions.</p>"+
        "<p><strong>Professional boundary:</strong> Institution policies, regulator requirements, attendance rules, assessment rules and academic-integrity procedures remain controlled and approved by the institution or applicable authority.</p>"+
        "<div id=\"pacificEducationInstitutionSetupForm\"></div>"+
        "<div id=\"pacificEducationInstitutionAdvice\" role=\"status\" aria-live=\"polite\" style=\"padding:10px;border:1px solid currentColor;margin-top:12px\"></div>"+
        "<div id=\"pacificEducationInstitutionSetupSummary\"></div>";
      app.appendChild(section);
    }
    var form=document.getElementById("pacificEducationInstitutionSetupForm");
    form.innerHTML=
      "<label><strong>Institution type</strong><br><select data-inst-key=\"institutionType\">"+
      ["School","College","University","TVET / Training","Other"].map(function(x){return "<option "+(x===state.institutionType?"selected":"")+">"+esc(x)+"</option>";}).join("")+
      "</select></label>"+
      inputRow("institutionName","Institution name",state.institutionName,false)+
      inputRow("country","Country",state.country,false)+
      inputRow("authority","Institution authority / regulator",state.authority,false)+
      inputRow("language","Primary language",state.language,false)+
      inputRow("currency","Currency",state.currency,false)+
      inputRow("levelLabels","Level / award labels",state.levelLabels.join("\n"),true)+
      "<label style=\"display:block;margin:10px 0\"><strong>Academic calendar model</strong><br><select data-inst-key=\"calendarModel\">"+
      ["Term","Semester","Trimester","Quarter","Custom"].map(function(x){return "<option "+(x===state.calendarModel?"selected":"")+">"+x+"</option>";}).join("")+
      "</select></label>"+
      inputRow("academicUnits","Academic units",state.academicUnits.join("\n"),true)+
      inputRow("programmes","Programmes",state.programmes.join("\n"),true)+
      inputRow("courses","Courses / modules",state.courses.join("\n"),true)+
      inputRow("assessmentModel","Assessment model",state.assessmentModel,false)+
      inputRow("gradingModel","Grading model",state.gradingModel,false)+
      inputRow("creditModel","Credit model",state.creditModel,false)+
      inputRow("examModel","Examination system",state.examModel,false)+
      inputRow("attendanceModel","Attendance model",state.attendanceModel,false)+
      inputRow("attendanceRules","Attendance rules",state.attendanceRules,true)+
      inputRow("academicIntegrity","Academic integrity / plagiarism rules",state.academicIntegrity,false)+
      "<button type=\"button\" id=\"pacificEducationInstitutionSave\">Save institution configuration</button>"+
      "<button type=\"button\" id=\"pacificEducationInstitutionReset\">Reset this prototype configuration</button>"+
      "<span id=\"pacificEducationInstitutionSetupStatus\" role=\"status\" aria-live=\"polite\"></span>";

    Array.prototype.forEach.call(form.querySelectorAll("[data-inst-key]"),function(el){
      el.addEventListener("change",function(){
        var k=el.getAttribute("data-inst-key"), v=el.value;
        if(["levelLabels","academicUnits","programmes","courses"].indexOf(k)>=0) state[k]=unique(list(v));
        else state[k]=clean(v);
        renderAdvice();
      });
    });
    document.getElementById("pacificEducationInstitutionSave").onclick=function(){
      ["levelLabels","academicUnits","programmes","courses"].forEach(function(k){ if(!Array.isArray(state[k])) state[k]=[]; });
      save();
      var status=document.getElementById("pacificEducationInstitutionSetupStatus");
      if(status)status.textContent="Institution configuration saved. Similarity/conflict advice has been refreshed.";
    };
    document.getElementById("pacificEducationInstitutionReset").onclick=function(){
      state=clone(defaults);
      try{window.localStorage.removeItem(STORAGE_KEY);}catch(e){}
      save();
      render();
      var status=document.getElementById("pacificEducationInstitutionSetupStatus");
      if(status)status.textContent="Prototype institution configuration reset.";
    };
    renderSummary();
  }

  function setVisible(visible){
    var section=document.getElementById("pacificEducationInstitutionSetup");
    if(section) section.hidden=!visible;
  }

  window.PacificEducationInstitutionSetup={
    render:render,setVisible:setVisible,getState:function(){return clone(state);},
    save:save,reset:function(){state=clone(defaults);try{window.localStorage.removeItem(STORAGE_KEY);}catch(e){}save();render();},
    getDuplicateAdvice:duplicateAdvice
  };

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})(window,document);
