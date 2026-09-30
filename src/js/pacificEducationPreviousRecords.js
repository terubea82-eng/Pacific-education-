/* Pacific Education — Previous Records Import & Source Link Centre.
 * Controlled pilot prototype. No direct FEMIS login, password capture, scraping or
 * private-data transfer is performed here. Institutions import an authorised
 * export/file and retain source/provenance and verification status.
 */
(function(window,document){
"use strict";
var KEY="pacificEducationPreviousRecordsV1";
var state={records:[],sources:[]};
function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY)||"null");if(x){state.records=Array.isArray(x.records)?x.records:[];state.sources=Array.isArray(x.sources)?x.sources:[];}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}document.dispatchEvent(new CustomEvent("pacificEducationPreviousRecordsChanged",{detail:state}));renderSummary();}
function addSource(name,url,type,verified){
 var s={id:"SRC-"+Date.now(),name:clean(name),url:clean(url),type:clean(type),verified:!!verified,addedAt:new Date().toISOString()};
 state.sources.push(s);save();return s;
}
function importRecords(records,sourceId,mode){
 if(!Array.isArray(records))throw new Error("Records must be an array");
 var source=state.sources.find(function(x){return x.id===sourceId;});
 if(!source)throw new Error("A registered source is required");
 if(!source.verified)throw new Error("Source must be verified by the authorised institution before import");
 var imported=0;
 records.forEach(function(r){
   if(!r||typeof r!=="object")return;
   var copy=JSON.parse(JSON.stringify(r));
   copy.recordId=copy.recordId||"REC-"+Date.now()+"-"+imported;
   copy.sourceId=sourceId;copy.importedAt=new Date().toISOString();copy.importMode=mode||"authorised-import";
   state.records.push(copy);imported++;
 });
 save();return imported;
}
function roleCanView(role){return ["student","teacher","parent","special-education","professional-reviewer","ngo","education-government","community-partner","head-of-school","institution-admin","owner"].indexOf(role)>=0;}
function renderDashboardHistory(){
 var role=sessionStorage.getItem("pacificEducationActiveRole")||"",host=document.getElementById("pacificEducationPreviousRecordsDashboard");if(!host)return;
 if(!roleCanView(role)){host.innerHTML="";return;}
 var rows=state.records.slice(0,20);
 host.innerHTML="<h3>Previous Records — "+esc(role)+" view</h3><p>Historical source-linked records are shown according to the active role.</p>"+(rows.length?"<ul>"+rows.map(function(r){return "<li>"+esc(r.studentName||r.recordId||"Record")+" — "+esc(r.year||"")+" "+esc(r.subject||"")+" "+esc(r.result||"")+" <small>(historical)</small></li>";}).join("")+"</ul>":"<p>No imported previous records available.</p>");
}
function historicalProgress(){
 var totals={},rows=state.records||[];
 rows.forEach(function(r){
  var key=clean(r.studentName||r.recordId||"Unidentified")+"|"+clean(r.year||r.class||"");
  if(!totals[key])totals[key]={student:clean(r.studentName||r.recordId||"Historical record"),level:clean(r.year||r.class||"Not mapped"),subjects:0,attendance:[],results:[]};
  if(r.subject)totals[key].subjects++;
  if(r.attendance!==undefined&&r.attendance!=="")totals[key].attendance.push(r.attendance);
  if(r.result)totals[key].results.push(r.result);
 });
 return Object.keys(totals).map(function(k){return totals[k];});
}
function historicalCoverageAdvice(){
 var rows=state.records||[], covered={}, subjects={};
 rows.forEach(function(r){
  var subject=clean(r.subject||"");if(!subject)return;
  subjects[subject]=true;
  var key=subject+"|"+clean(r.year||r.class||"");
  covered[key]=(covered[key]||0)+1;
 });
 return {records:rows.length,subjects:Object.keys(subjects),coverage:covered};
}
function renderHistoricalCoverage(){
 var role=sessionStorage.getItem("pacificEducationActiveRole")||"",host=document.getElementById("pacificEducationHistoricalCoverage");if(!host)return;
 var allowed=["teacher","head-of-school","institution-admin","special-education","professional-reviewer","education-government","owner"];
 if(allowed.indexOf(role)<0){host.innerHTML="";return;}
 var a=historicalCoverageAdvice();
 host.innerHTML="<h3>Historical Curriculum Coverage Reference</h3><p>Previous records can inform planning, but they are not proof that an achievement indicator was taught or mastered. Teachers/reviewers must verify evidence before marking current coverage.</p>"+(a.subjects.length?"<p><strong>Subjects found in historical records:</strong> "+a.subjects.map(esc).join(", ")+"</p>":"<p>No mapped historical subjects available.</p>")+"<p><strong>Historical records:</strong> "+a.records+"</p>";
}
function renderHistoricalProgress(){
 var role=sessionStorage.getItem("pacificEducationActiveRole")||"",host=document.getElementById("pacificEducationHistoricalProgress");if(!host)return;
 var allowed=["student","teacher","parent","head-of-school","institution-admin","special-education","professional-reviewer","ngo","education-government","community-partner","owner"];
 if(allowed.indexOf(role)<0){host.innerHTML="";return;}
 var rows=historicalProgress();
 host.innerHTML="<h3>Historical Academic Progress</h3><p>Imported history is reference evidence for continuity. It does not automatically change current class placement, grades or curriculum decisions.</p>"+(rows.length?"<ul>"+rows.slice(0,30).map(function(x){return "<li><strong>"+esc(x.student)+"</strong> — "+esc(x.level)+" • "+x.subjects+" subject record(s)"+(x.results.length?" • results recorded: "+x.results.length:"")+"</li>";}).join("")+"</ul>":"<p>No mapped historical progress is available.</p>");
}
function renderSummary(){
 var s=document.getElementById("pacificEducationPreviousRecordsSummary");if(!s)return;
 s.innerHTML="<p><strong>Imported previous records:</strong> "+state.records.length+" • <strong>Registered sources:</strong> "+state.sources.length+"</p>"+
 "<p>Each imported record retains its source, import date and verification state. Production use requires secure authentication, authorised data-sharing arrangements, privacy controls and audit logging.</p>";
}
function render(){
 var app=document.getElementById("app");if(!app)return;
 var s=document.getElementById("pacificEducationPreviousRecords");if(!s){
  s=document.createElement("section");s.id="pacificEducationPreviousRecords";s.setAttribute("aria-label","Previous Records and Data Import");
  s.innerHTML="<h2>Previous Records & Authorised Data Import</h2>"+
   "<p><strong>FEMIS:</strong> Pacific Education can be prepared to receive authorised historical records from Fiji's FEMIS through an approved export or data-sharing process. It must not ask users for FEMIS passwords or scrape protected FEMIS pages.</p>"+
   "<p><strong>Other private institutions:</strong> Each institution can register its own approved source and import authorised previous records. The institution remains responsible for permission, accuracy, privacy and retention requirements.</p>"+
   "<p><strong>Record preservation:</strong> Imported records are kept as historical/source-linked records; they are not silently rewritten to match Pacedu's structure. Mapping and duplicate/conflict advice can be applied before use.</p>"+
   "<div id=\"pacificEducationPreviousRecordsSummary\"></div>"+
   "<label><strong>Source name</strong><br><input id=\"paceduSourceName\" style=\"width:100%;max-width:760px\" placeholder=\"e.g. FEMIS authorised export / Institution SIS\"></label>"+
   "<label><strong>Source link or reference</strong><br><input id=\"paceduSourceUrl\" style=\"width:100%;max-width:760px\" placeholder=\"Official source URL or approved file/reference\"></label>"+
   "<label><strong>Source type</strong><br><select id=\"paceduSourceType\"><option>FEMIS authorised export</option><option>Institution student information system</option><option>Institution academic records</option><option>Other approved source</option></select></label>"+
   "<label><input type=\"checkbox\" id=\"paceduSourceVerified\"> I confirm this source is authorised for this institution and this import.</label><br>"+
   "<button type=\"button\" id=\"paceduRegisterSource\">Register authorised source</button>"+
   "<hr><h3>Import and Mapping Preview</h3><p>Upload an authorised CSV/TSV export. Pacedu previews the mapping before saving.</p><input type=\"file\" id=\"paceduPreviousFile\" accept=\".csv,.tsv,text/csv,text/tab-separated-values\"><div id=\"paceduMappingArea\"></div><div id=\"paceduImportPreview\"></div><button type=\"button\" id=\"paceduApproveImport\" disabled>Approve and save mapped records</button><p id=\"paceduImportStatus\" role=\"status\" aria-live=\"polite\"></p>";
  app.appendChild(s);
 }
 renderSummary();
 renderDashboardHistory();
 renderHistoricalProgress();
 renderHistoricalCoverage();
 var pending={records:[],headers:[],mapping:{},sourceId:""};
 document.getElementById("paceduPreviousFile").onchange=function(ev){
  var file=ev.target.files&&ev.target.files[0];if(!file)return;
  var reader=new FileReader();reader.onload=function(){
   var lines=String(reader.result||"").split(/\r?\n/).filter(function(x){return x.trim();}),sep=lines[0]&&lines[0].indexOf("\t")>=0?"\t":",";
   function row(x){return x.split(sep).map(function(v){return clean(v.replace(/^"(.*)"$/,"$1"));});}
   pending.headers=lines.length?row(lines[0]):[];pending.records=lines.slice(1).map(function(line){var v=row(line),o={};pending.headers.forEach(function(h,i){if(h)o[h]=v[i]||"";});return o;});
   pending.sourceId=state.sources.length?state.sources[state.sources.length-1].id:"";
   var keys=["recordId","studentName","school","class","year","subject","term","attendance","assessment","result"];
   document.getElementById("paceduMappingArea").innerHTML="<p><strong>Step 1 — Map fields</strong></p>"+keys.map(function(k){return "<label style=\"display:block\">"+k+": <select data-map-key=\""+k+"\"><option value=\"\">— Not mapped —</option>"+pending.headers.map(function(h){return "<option value=\""+esc(h)+"\">"+esc(h)+"</option>";}).join("")+"</select></label>";}).join("");
   Array.prototype.forEach.call(document.querySelectorAll("[data-map-key]"),function(el){el.onchange=preview;});preview();
  };reader.readAsText(file);
 };
 function preview(){
  pending.mapping={};Array.prototype.forEach.call(document.querySelectorAll("[data-map-key]"),function(el){if(el.value)pending.mapping[el.getAttribute("data-map-key")]=el.value;});
  var sample=pending.records.slice(0,5).map(function(r){var x={};Object.keys(pending.mapping).forEach(function(k){x[k]=r[pending.mapping[k]]||"";});return x;});
  var dup=pending.records.filter(function(r){var id=pending.mapping.recordId&&r[pending.mapping.recordId];return id&&state.records.some(function(x){return x.recordId===id;});}).length;
  document.getElementById("paceduImportPreview").innerHTML=pending.records.length?"<p><strong>Step 2 — Preview:</strong> "+pending.records.length+" records; existing IDs detected: "+dup+".</p><pre style=\"white-space:pre-wrap\">"+esc(JSON.stringify(sample,null,2))+"</pre>":"";
  document.getElementById("paceduApproveImport").disabled=!pending.records.length||!pending.sourceId||!state.sources.some(function(s){return s.id===pending.sourceId&&s.verified;});
 }
 document.getElementById("paceduApproveImport").onclick=function(){
  var mapped=pending.records.map(function(r){var x={};Object.keys(pending.mapping).forEach(function(k){if(pending.mapping[k])x[k]=r[pending.mapping[k]]||"";});return x;});
  var result=importRecords(mapped,pending.sourceId,"authorised-mapped-import");
  document.getElementById("paceduImportStatus").textContent="Approved import saved: "+result+" records. Source metadata retained."; renderDashboardHistory(); renderHistoricalProgress(); renderHistoricalCoverage();
 };
 document.getElementById("paceduRegisterSource").onclick=function(){
  var verified=document.getElementById("paceduSourceVerified").checked;
  if(!verified){document.getElementById("paceduImportStatus").textContent="Source registration requires explicit authorisation confirmation.";return;}
  var x=addSource(document.getElementById("paceduSourceName").value,document.getElementById("paceduSourceUrl").value,document.getElementById("paceduSourceType").value,true);
  document.getElementById("paceduImportStatus").textContent="Authorised source registered: "+x.name+". Import can be connected to an approved export workflow.";
 };
}
load();
window.PacificEducationPreviousRecords={load:load,save:save,addSource:addSource,importRecords:importRecords,getState:function(){return JSON.parse(JSON.stringify(state));},render:render};
document.addEventListener("DOMContentLoaded",render);
})(window,document);
