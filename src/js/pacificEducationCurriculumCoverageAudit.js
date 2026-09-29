/*
 * Pacific Education — Curriculum Coverage / Audit View
 * Version 1.0.0
 *
 * Prototype audit only. It reports evidence state; it never certifies
 * official curriculum content or production readiness.
 */
(function(window){
  "use strict";
  var VERSION="1.0.0";
  var ROOT_ID="pacificEducationCurriculumVerificationAudit";
  var DETAIL_ID="pacificEducationCurriculumAuditDetail";
  var VERIFIED=["VALIDATED","SOURCE_VERIFIED","VERIFIED"];

  function esc(v){
    return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function registry(){ return window.PacificEducationCurriculumAlignmentRegistry; }
  function coverage(){ return window.PacificEducationCurriculumCoverageEngine; }
  function mapper(){ return window.PacificEducationAchievementIndicatorActivityMapper; }
  function evidence(){ return window.PacificEducationCurriculumEvidenceRegistry; }

  function currentFilters(){
    var f={};
    var level=window.localStorage.getItem("pacificEducationLevel");
    var subject=window.localStorage.getItem("pacificEducationSubject");
    var term=window.localStorage.getItem("pacificEducationTerm");
    if(level) f.level=level;
    if(subject) f.subjectId=subject;
    if(term) f.term=term;
    return f;
  }

  function studentId(){
    try{
      var core=window.PacificEducationCore;
      var s=core&&typeof core.getCurrentStudent==="function"?core.getCurrentStudent():null;
      if(s&&s.userId) return s.userId;
      if(s&&s.id) return s.id;
    }catch(e){}
    return "pilot-student-demo";
  }

  function isVerified(ind){
    var s=String(ind.validationStatus||ind.status||ind.indicatorStatus||"").toUpperCase();
    return VERIFIED.indexOf(s)>=0;
  }

  function build(){
    var reg=registry();
    var cov=coverage();
    var map=mapper();
    var ev=evidence();
    if(!reg||typeof reg.list!=="function") return {rows:[],counts:{total:0,verified:0,pending:0,mapped:0,assessed:0,covered:0}};
    var filters=currentFilters();
    var indicators=reg.list(filters);
    var records=cov&&typeof cov.list==="function"?cov.list({studentId:studentId()}):[];
    var rows=indicators.map(function(ind){
      var verified=isVerified(ind);
      var mapped=false;
      var evidenceRecords=ev&&typeof ev.getForIndicator==="function"?ev.getForIndicator(ind.id):[];
      var verifiedEvidence=evidenceRecords.filter(function(x){return String(x.status||"").toUpperCase()==="VERIFIED"||String(x.status||"").toUpperCase()==="VALIDATED"||String(x.status||"").toUpperCase()==="SOURCE_VERIFIED";});
      try{
        mapped=map&&typeof map.mapIndicator==="function"&&map.mapIndicator(ind).length>0;
      }catch(e){ mapped=false; }
      var rec=records.filter(function(r){return r.indicatorId===ind.id && r.evidenceType!=="indicator-stage";}).sort(function(a,b){return String(b.updatedAt||"").localeCompare(String(a.updatedAt||""));})[0]||null;
      var assessed=!!(rec&&(rec.status==="assessed"||rec.status==="covered"));
      var covered=!!(rec&&rec.status==="covered"&&rec.teacherConfirmed===true);
      return {indicator:ind,verified:verified,mapped:mapped,assessed:assessed,covered:covered,record:rec,evidenceRecords:evidenceRecords,verifiedEvidence:verifiedEvidence};
    });
    return {rows:rows,counts:{
      total:rows.length,
      verified:rows.filter(function(r){return r.verified;}).length,
      pending:rows.filter(function(r){return !r.verified;}).length,
      mapped:rows.filter(function(r){return r.mapped;}).length,
      assessed:rows.filter(function(r){return r.assessed;}).length,
      covered:rows.filter(function(r){return r.covered;}).length
    }};
  }

  function renderDetail(indicatorId){
    var root=document.getElementById(DETAIL_ID); if(!root) return;
    var data=build(), row=data.rows.filter(function(x){return x.indicator.id===indicatorId;})[0];
    if(!row){root.innerHTML="";return;}
    var i=row.indicator, ev=row.verifiedEvidence.length?row.verifiedEvidence:row.evidenceRecords;
    var map=mapper(), activities=[];
    try{activities=map&&typeof map.mapIndicator==="function"?map.mapIndicator(i):[];}catch(e){activities=[];}
    var stages=["teach","guided-practice","independent-practice","application","check-assessment","remedial-extension"];
    var records=coverage()&&typeof coverage().list==="function"?coverage().list({studentId:studentId(),indicatorId:indicatorId}):[];
    var html=["<section class=\"pe-audit-detail\"><h3>Indicator Drill-Down: "+esc(i.id)+"</h3>"]; 
    html.push("<p><strong>Achievement Indicator:</strong> "+esc(i.indicatorText||i.achievementIndicator||"")+"</p>");
    html.push("<p><strong>Class:</strong> "+esc(i.level)+" &nbsp; <strong>Subject:</strong> "+esc(i.subjectId)+" &nbsp; <strong>Term:</strong> "+esc(i.term)+"</p>");
    html.push("<h4>1. Source Evidence</h4>");
    if(!ev.length) html.push("<p>Pending source evidence.</p>");
    ev.forEach(function(x){html.push("<p><strong>"+esc(x.status||"Unverified")+"</strong> — "+esc(x.sourceTitle||x.evidenceReference||"Source reference")+(x.page?" — page "+esc(x.page):"")+(x.section?" — "+esc(x.section):"")+(x.documentLocation?" — "+esc(x.documentLocation):"")+"</p>");});
    html.push("<h4>2. Mapped Activities</h4>");
    if(!activities.length) html.push("<p>No activity mapping is currently available.</p>");
    activities.forEach(function(a,n){html.push("<p><strong>"+(n+1)+". "+esc(a.activityType||"activity")+"</strong> — "+esc(a.title||a.taskFocus||"")+"</p>");});
    html.push("<h4>3. Six-Stage Learning Evidence</h4><ul>");
    stages.forEach(function(s){var hit=records.some(function(r){return r.evidenceType==="indicator-stage"&&r.stageType===s;});html.push("<li>"+esc(s)+" — "+(hit?"Recorded":"Not recorded")+"</li>");});
    html.push("</ul><h4>4. Assessment & Coverage</h4>");
    var normal=records.filter(function(r){return r.evidenceType!=="indicator-stage";}).sort(function(a,b){return String(b.updatedAt||"").localeCompare(String(a.updatedAt||""));})[0];
    html.push("<p><strong>Assessment:</strong> "+(row.assessed?"Assessed":"Not Assessed")+"</p>");
    html.push("<p><strong>Coverage:</strong> "+(row.covered?"Covered — teacher confirmed":"Not Covered")+(normal&&normal.status?" ("+esc(normal.status)+")":"")+"</p>");
    html.push("<button type=\"button\" data-pe-audit-close>Close drill-down</button></section>"); root.innerHTML=html.join("");
    var close=root.querySelector("[data-pe-audit-close]"); if(close) close.addEventListener("click",function(){root.innerHTML="";});
  }

  function render(){
    var root=document.getElementById(ROOT_ID);
    if(!root) return;
    var data=build();
    var c=data.counts;
    var html=[];
    html.push("<section class=\"pe-curriculum-audit\">");
    html.push("<h2>Curriculum Coverage / Audit</h2>");
    html.push("<p><strong>Prototype audit:</strong> shows the evidence state of registered curriculum indicators. It does not certify official Ministry curriculum alignment.</p>");
    html.push("<div class=\"pe-audit-summary\">");
    [["Verified",c.verified,"verified"],["Pending Verification",c.pending,"pending"],["Mapped to Activities",c.mapped,"mapped"],["Assessed",c.assessed,"assessed"],["Covered",c.covered,"covered"]].forEach(function(x){
      html.push("<div class=\"pe-audit-card pe-audit-"+x[2]+"\"><strong>"+x[0]+"</strong><span>"+x[1]+"</span><small>of "+c.total+" indicators</small></div>");
    });
    html.push("</div>");
    html.push("<p><strong>Current selection:</strong> "+esc(currentFilters().level||"All classes")+" • "+esc(currentFilters().subjectId||"All subjects")+" • "+esc(currentFilters().term||"All terms")+"</p>");
    if(!data.rows.length){ html.push("<p>No curriculum indicators are registered for the current selection.</p>"); }
    else {
      html.push("<div style=\"overflow:auto\"><table><thead><tr><th>Indicator</th><th>Level</th><th>Subject</th><th>Term</th><th>Verification</th><th>Activities</th><th>Assessment</th><th>Coverage</th><th>Drill-down</th></tr></thead><tbody>");
      data.rows.forEach(function(r){
        var i=r.indicator, rec=r.record;
        html.push("<tr>");
        html.push("<td><strong>"+esc(i.id)+"</strong><br>"+esc(i.indicatorText||i.achievementIndicator||"")+"</td>");
        html.push("<td>"+esc(i.level)+"</td><td>"+esc(i.subjectId)+"</td><td>"+esc(i.term)+"</td>");
        html.push("<td>"+(r.verified?"Verified":"Pending Verification")+(r.verifiedEvidence.length?"<br><small>"+esc(r.verifiedEvidence[0].sourceTitle||"Source evidence")+(r.verifiedEvidence[0].page?" • p. "+esc(r.verifiedEvidence[0].page):"")+(r.verifiedEvidence[0].section?" • "+esc(r.verifiedEvidence[0].section):"")+"</small>":"")+"</td>");
        html.push("<td>"+(r.mapped?"Mapped to Activities":"Not Mapped")+"</td>");
        html.push("<td>"+(r.assessed?"Assessed":"Not Assessed")+"</td>");
        html.push("<td>"+(r.covered?"Covered":"Not Covered")+(rec&&rec.status?"<br><small>"+esc(rec.status)+"</small>":"")+"</td>");
        html.push("<td><button type=\"button\" data-pe-audit-detail=\""+esc(i.id)+"\">View details</button></td>");
        html.push("</tr>");
      });
      html.push("</tbody></table></div>");
    }
    html.push("<p><small>Coverage is student-specific and remains prototype evidence. Covered requires teacher confirmation.</small></p>");
    html.push("</section>");
    var detail=document.getElementById(DETAIL_ID); if(detail&&data.rows.length===0) detail.innerHTML="";
    var buttons=root.querySelectorAll("[data-pe-audit-detail]"); Array.prototype.forEach.call(buttons,function(b){b.addEventListener("click",function(){renderDetail(b.getAttribute("data-pe-audit-detail"));});});
    renderDetail("");
    root.innerHTML=html.join("");
  }

  function init(){
    render();
    ["change","pacificEducationCoverageRefresh","pacificEducationApprovedHomeAssessment"].forEach(function(name){
      document.addEventListener(name,render);
    });
    window.addEventListener("storage",render);
  }
  window.PacificEducationCurriculumCoverageAudit=Object.freeze({name:"PacificEducationCurriculumCoverageAudit",version:VERSION,build:build,render:render});
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})(window);