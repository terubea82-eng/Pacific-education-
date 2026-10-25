/* PacEdu — evidence-based ability recommendation.
 * Prototype only. Uses only teacher-marked daily responses and teacher-entered term marks.
 * It never diagnoses a learner or treats missing/inaccessible work as low ability.
 */
(function(window, document) {
  "use strict";
  var VERSION = "1.0.0";
  var RESPONSE_KEY = "pacificEducationActivityResponses";
  var EXAM_KEY = "pacificEducationTermExaminationMarksV1";
  var REVIEW_KEY = "pacificEducationAbilityReviewRecordsV1";
  var MIN_MARKED_ACTIVITIES = 5;
  var panelTerm = null, panelSubject = null;
  var LEVELS = [
    {id:"foundation",label:"Foundation"},
    {id:"developing",label:"Developing"},
    {id:"expected",label:"Expected-level"},
    {id:"advanced",label:"Advanced"}
  ];
  /* Legacy intervention values remain readable but are not ability bands. */
  var LEGACY_LEVELS = [
    {id:"remedial",label:"Remedial / re-teaching"},
    {id:"extension",label:"Extension / challenge"}
  ];
  function read(key, fallback) {
    try { var v=JSON.parse(window.localStorage.getItem(key)||"null"); return v==null?fallback:v; }
    catch(e) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key,JSON.stringify(value)); return true; }
    catch(e) { return false; }
  }
  function text(v) { return String(v==null?"":v).trim(); }
  function same(a,b) { return text(a)!=="" && text(a)===text(b); }
  function term() { try{return text(localStorage.getItem("pacificEducationTerm"))||"Term 1";}catch(e){return "Term 1";} }
  function subject() { try{return text(localStorage.getItem("pacificEducationSubject"))||"English";}catch(e){return "English";} }
  function markedActivities(studentId,classId,termValue,subjectValue) {
    var unique={};
    read(RESPONSE_KEY,[]).forEach(function(x) {
      if(!x || !same(x.studentId,studentId) || !same(x.classId,classId)) return;
      if(x.reviewStatus!=="teacher-approved" && x.reviewStatus!=="teacher-needs-practice") return;
      /* Evidence without an explicit matching term/subject cannot be safely attributed. */
      if(!same(x.term,termValue) || !same(x.subject,subjectValue)) return;
      /* Count distinct activities, not repeated attempts on the same activity/day. */
      var activityKey=text(x.activityId) || (Number(x.day)>0 ? "day-"+String(x.day)+"-"+text(x.type||"daily-activity") : "");
      if(!activityKey) return;
      unique[activityKey]=x;
    });
    return Object.keys(unique).map(function(key){return unique[key];});
  }
  function examMarks(studentId,classId,termValue,subjectValue) {
    return read(EXAM_KEY,[]).filter(function(x) {
      return x && same(x.studentId,studentId) && same(x.classId,classId) &&
        same(x.term,termValue) && same(x.subject,subjectValue) &&
        Number.isFinite(Number(x.mark)) && Number(x.maximum)>0;
    });
  }
  function latestReview(studentId,classId,termValue,subjectValue) {
    var items=read(REVIEW_KEY,[]);
    for(var i=items.length-1;i>=0;i--) {
      var x=items[i];
      if(x && same(x.studentId,studentId) && same(x.classId,classId) && same(x.term,termValue) && same(x.subject,subjectValue)) return x;
    }
    return null;
  }
  function evaluate(input) {
    input=input||{};
    var studentId=text(input.studentId), classId=text(input.classId);
    var termValue=text(input.term)||term(), subjectValue=text(input.subject)||subject();
    if(!studentId || !classId) return {status:"identity-required",message:"A verified student reference and Class Reference are required. PacEdu will not match evidence by name alone.",studentId:studentId||null,classId:classId||null,term:termValue,subject:subjectValue,prototype:true};
    var activities=markedActivities(studentId,classId,termValue,subjectValue);
    var exams=examMarks(studentId,classId,termValue,subjectValue);
    var exam=exams.length?exams[exams.length-1]:null;
    var practiceCount=activities.filter(function(x){return x.reviewStatus==="teacher-needs-practice";}).length;
    var approvedCount=activities.length-practiceCount;
    var ratio=activities.length?approvedCount/activities.length:0;
    if(activities.length<MIN_MARKED_ACTIVITIES || !exam) {
      return {status:"awaiting-evidence",message:"Awaiting at least "+MIN_MARKED_ACTIVITIES+" teacher-marked daily activities and a teacher-marked term examination.",studentId:studentId,classId:classId,term:termValue,subject:subjectValue,markedActivities:activities.length,minimumActivities:MIN_MARKED_ACTIVITIES,approvedActivities:approvedCount,needsPractice:practiceCount,examMark:exam?Number(exam.mark):null,examMaximum:exam?Number(exam.maximum):null,examPercentage:exam?Math.round(Number(exam.mark)/Number(exam.maximum)*100):null,recommendation:null,review:latestReview(studentId,classId,termValue,subjectValue),prototype:true};
    }
    var percentage=Math.round(Number(exam.mark)/Number(exam.maximum)*100);
    var activityApprovalRate=Math.round(ratio*100);
    var recommendation, bandRule;
    if(percentage>=80 && ratio>=0.8) {
      recommendation="advanced";
      bandRule="Advanced: term exam at least 80% and teacher-approved daily activity rate at least 80%.";
    } else if(percentage>=60 && ratio>=0.6) {
      recommendation="expected";
      bandRule="Expected-level: term exam at least 60% and teacher-approved daily activity rate at least 60%.";
    } else if(percentage>=40 && ratio>=0.4) {
      recommendation="developing";
      bandRule="Developing: term exam at least 40% and teacher-approved daily activity rate at least 40%, but the higher-band conditions are not both met.";
    } else {
      recommendation="foundation";
      bandRule="Foundation: the term exam or teacher-approved daily activity rate is below 40%; provide targeted teaching support and gather fresh evidence.";
    }
    var review=latestReview(studentId,classId,termValue,subjectValue);
    return {status:"recommendation-ready",message:"Provisional recommendation only; teacher review is required.",studentId:studentId,classId:classId,term:termValue,subject:subjectValue,markedActivities:activities.length,minimumActivities:MIN_MARKED_ACTIVITIES,approvedActivities:approvedCount,needsPractice:practiceCount,activityApprovalRate:activityApprovalRate,examMark:Number(exam.mark),examMaximum:Number(exam.maximum),examPercentage:percentage,recommendation:recommendation,recommendationLabel:labelFor(recommendation),bandRule:bandRule,review:review,finalLevel:review&&review.finalLevel?review.finalLevel:null,reviewStatus:review?review.status:"pending-teacher-review",prototype:true};
  }
  function labelFor(id) { var x=LEVELS.concat(LEGACY_LEVELS).find(function(v){return v.id===id;}); return x?x.label:"Pending evidence"; }
  function recordTermMark(input) {
    input=input||{};
    var studentId=text(input.studentId),classId=text(input.classId),termValue=text(input.term)||term(),subjectValue=text(input.subject)||subject();
    var mark=Number(input.mark),maximum=Number(input.maximum);
    if(!studentId||!classId) return {success:false,error:"Student reference and Class Reference are required."};
    if(!termValue||!subjectValue) return {success:false,error:"Term and subject are required."};
    if(!Number.isFinite(mark)||!Number.isFinite(maximum)||maximum<=0||mark<0||mark>maximum) return {success:false,error:"Enter a valid mark between 0 and the maximum mark."};
    var items=read(EXAM_KEY,[]);
    items.push({id:"term-exam-"+Date.now(),studentId:studentId,classId:classId,term:termValue,subject:subjectValue,examTitle:text(input.examTitle)||"Term examination",mark:mark,maximum:maximum,markedAt:new Date().toISOString(),markedBy:text(input.markedBy)||"teacher",teacherMarked:true,prototype:true});
    if(!write(EXAM_KEY,items.slice(-2000))) return {success:false,error:"Could not save the mark on this device."};
    document.dispatchEvent(new CustomEvent("pacificEducationTermExaminationMarked",{detail:{studentId:studentId,classId:classId,term:termValue,subject:subjectValue}}));
    document.dispatchEvent(new CustomEvent("pacificEducationEvidenceBasedAbilityUpdated"));
    return {success:true,mark:items[items.length-1],prototype:true};
  }
  function reviewRecommendation(input) {
    input=input||{};
    var result=evaluate(input);
    if(result.status!=="recommendation-ready") return {success:false,error:"A recommendation cannot be reviewed until the required evidence is available.",result:result};
    var finalLevel=text(input.finalLevel)||result.recommendation;
    if(!LEVELS.concat(LEGACY_LEVELS).some(function(x){return x.id===finalLevel;})) return {success:false,error:"Choose a valid learning recommendation."};
    var reason=text(input.reason);
    var status=finalLevel===result.recommendation?"confirmed":"adjusted";
    if(status==="adjusted"&&!reason) return {success:false,error:"Record a reason when adjusting PacEdu's recommendation."};
    var items=read(REVIEW_KEY,[]);
    var record={studentId:result.studentId,classId:result.classId,term:result.term,subject:result.subject,recommendedLevel:result.recommendation,finalLevel:finalLevel,status:status,reason:reason,markedActivities:result.markedActivities,examPercentage:result.examPercentage,reviewedAt:new Date().toISOString(),prototype:true};
    items.push(record);
    if(!write(REVIEW_KEY,items.slice(-2000))) return {success:false,error:"Could not save the teacher review."};
    document.dispatchEvent(new CustomEvent("pacificEducationEvidenceBasedAbilityUpdated"));
    return {success:true,review:record,prototype:true};
  }
  function renderTeacherPanel() {
    var dashboard=document.getElementById("teacherDashboard");
    if(!dashboard) return;
    var old=document.getElementById("paceduEvidenceBasedAbilityPanel");
    if(old) old.remove();
    var panel=document.createElement("section");
    panel.id="paceduEvidenceBasedAbilityPanel";
    panel.setAttribute("aria-labelledby","paceduEvidenceBasedAbilityHeading");
    panel.style.cssText="margin:16px 0;padding:14px;border:2px solid #7bb9e8;border-radius:10px;background:#f6fbff;color:#17324d;";
    function node(tag,value,parent) { var n=document.createElement(tag); if(value!==undefined)n.textContent=value; (parent||panel).appendChild(n); return n; }
    node("h3","Evidence-based learning-level recommendations");
    node("p","PacEdu uses teacher-marked daily activities and a teacher-marked term examination. At least "+MIN_MARKED_ACTIVITIES+" marked daily activities plus a term mark are required. Recommendations remain provisional until teacher review.");
    var roster=window.PacificEducationTeacherClassRosterContext;
    var ctx=roster&&typeof roster.getContext==="function"?roster.getContext():null;
    var classId=ctx&&ctx.classId?String(ctx.classId):"";
    if(!classId) { node("p","Select an existing Class Reference and its roster before entering examination marks."); dashboard.insertBefore(panel,dashboard.firstChild); return; }
    var refs=Array.isArray(ctx.studentRefs)?ctx.studentRefs:[];
    if(!refs.length) { node("p","No student references are available in the selected class. PacEdu will not infer student identity from a name."); dashboard.insertBefore(panel,dashboard.firstChild); return; }
    panelTerm=panelTerm||term();
    panelSubject=panelSubject||subject();
    var selected=window.PacificEducationStudentCoverageContext&&typeof window.PacificEducationStudentCoverageContext.getStudentId==="function"?text(window.PacificEducationStudentCoverageContext.getStudentId()):"";
    var form=node("form",undefined);
    form.addEventListener("submit",function(e){
      e.preventDefault();
      panelTerm=termSelect.value; panelSubject=subjectSelect.value;
      var result=recordTermMark({studentId:student.value,classId:classId,term:panelTerm,subject:panelSubject,examTitle:title.value,mark:mark.value,maximum:maximum.value});
      status.textContent=result.success?"Term examination mark saved. PacEdu will evaluate evidence for this student.":result.error;
      renderTeacherPanel();
    });
    var studentLabel=node("label","Student reference",form);
    var student=document.createElement("select"); student.required=true; student.style.cssText="display:block;width:100%;max-width:520px;padding:10px;margin:4px 0 10px;";
    refs.forEach(function(ref){var o=document.createElement("option");o.value=String(ref);o.textContent=String(ref);student.appendChild(o);});
    if(refs.some(function(ref){return String(ref)===selected;})) student.value=selected;
    studentLabel.appendChild(student);
    var title=node("input"); title.type="text"; title.required=true; title.maxLength=120; title.placeholder="e.g. Term 2 English examination"; title.value="Term examination"; title.style.cssText="display:block;width:100%;max-width:520px;padding:10px;margin:4px 0 10px;";
    var titleLabel=node("label","Examination name",form); titleLabel.appendChild(title);
    var termLabel=node("label","Term",form),termSelect=document.createElement("select"); termSelect.style.cssText="display:block;padding:10px;margin:4px 0 10px;";
    ["Term 1","Term 2","Term 3","Term 4"].forEach(function(v){var o=document.createElement("option");o.value=v;o.textContent=v;termSelect.appendChild(o);}); termSelect.value=panelTerm; termSelect.addEventListener("change",function(){panelTerm=termSelect.value;renderTeacherPanel();});
    termLabel.appendChild(termSelect);
    var subjectLabel=node("label","Subject",form),subjectSelect=document.createElement("select"); subjectSelect.style.cssText="display:block;padding:10px;margin:4px 0 10px;";
    ["English","Mathematics","Science","Social Science","Health & Physical Education","Arts","Technology","Other / Integrated Learning"].forEach(function(v){var o=document.createElement("option");o.value=v;o.textContent=v;subjectSelect.appendChild(o);}); subjectSelect.value=panelSubject; subjectSelect.addEventListener("change",function(){panelSubject=subjectSelect.value;renderTeacherPanel();});
    subjectLabel.appendChild(subjectSelect);
    var markLabel=node("label","Mark earned",form),mark=document.createElement("input"); mark.type="number";mark.min="0";mark.step="any";mark.required=true;mark.placeholder="e.g. 35";mark.style.cssText="display:block;padding:10px;margin:4px 0 10px;";markLabel.appendChild(mark);
    var maxLabel=node("label","Maximum mark",form),maximum=document.createElement("input"); maximum.type="number";maximum.min="1";maximum.step="any";maximum.required=true;maximum.value="50";maximum.style.cssText="display:block;padding:10px;margin:4px 0 10px;";maxLabel.appendChild(maximum);
    var save=node("button","Save teacher-marked term examination");save.type="submit";form.appendChild(save);
    var status=node("p","",panel);status.id="paceduAbilityExamMarkStatus";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    panel.appendChild(form);
    var list=node("div",undefined,panel);list.id="paceduAbilityRecommendationList";
    node("h4","Evidence and recommendations",list);
    refs.forEach(function(ref){
      var result=evaluate({studentId:String(ref),classId:classId,term:panelTerm,subject:panelSubject});
      var card=node("article",undefined,list);card.style.cssText="padding:10px;margin:8px 0;border:1px solid #b5c7d5;border-radius:8px;background:white;";
      node("h4","Student reference: "+String(ref),card);
      node("p","Teacher-marked daily activities: "+String(result.markedActivities||0)+" / "+MIN_MARKED_ACTIVITIES+" minimum",card);
      if(result.examPercentage!==undefined&&result.examPercentage!==null) node("p","Term examination: "+result.examPercentage+"%",card);
      node("p",result.recommendation?("PacEdu provisional recommendation: "+result.recommendationLabel):result.message,card);
      if(result.recommendation) {
        var reviewForm=node("div",undefined,card);
        var levelLabel=node("label","Teacher-confirmed level",reviewForm);
        var level=document.createElement("select");level.style.cssText="display:block;padding:8px;margin:4px 0 8px;";
        LEVELS.forEach(function(v){var o=document.createElement("option");o.value=v.id;o.textContent=v.label;level.appendChild(o);});
        level.value=result.recommendation;levelLabel.appendChild(level);
        var reasonLabel=node("label","Reason (required if changed)",reviewForm),reason=document.createElement("input");reason.type="text";reason.maxLength=300;reason.placeholder="Reason for adjustment";reason.style.cssText="display:block;width:100%;max-width:520px;padding:8px;margin:4px 0 8px;";reasonLabel.appendChild(reason);
        var reviewStatus=node("p",result.reviewStatus==="confirmed"?"Teacher confirmed: "+labelFor(result.finalLevel):result.reviewStatus==="adjusted"?"Teacher adjusted to: "+labelFor(result.finalLevel):"Teacher review pending",reviewForm);
        var reviewButton=node("button","Save teacher review",reviewForm);reviewButton.type="button";
        reviewButton.addEventListener("click",function(){var saved=reviewRecommendation({studentId:String(ref),classId:classId,term:panelTerm,subject:panelSubject,finalLevel:level.value,reason:reason.value});reviewStatus.textContent=saved.success?(saved.review.status==="confirmed"?"Teacher confirmed: ":"Teacher adjusted to: ")+labelFor(saved.review.finalLevel):saved.error;if(saved.success)renderTeacherPanel();});
      }
    });
    dashboard.insertBefore(panel,dashboard.firstChild);
  }
  function updateStudentGuidance() {
    var context=null;
    try{context=JSON.parse(window.sessionStorage.getItem("paceduActiveStudentContextV1")||"null");}catch(e){}
    if(!context||context.role!=="student") return;
    var select=document.getElementById("pacificEducationCapability");
    var label=document.querySelector("label[for='pacificEducationCapability']");
    var info=document.getElementById("pacificEducationCapabilityGuidance");
    if(select){select.disabled=true;select.hidden=true;}
    if(label)label.textContent="Learning level — set by PacEdu from marked evidence";
    var textValue="Awaiting verified student reference, at least "+MIN_MARKED_ACTIVITIES+" teacher-marked daily activities, and a teacher-marked term examination. Your teacher reviews the recommendation. This is not a permanent label.";
    if(context.studentId&&context.classId) {
      var result=evaluate({studentId:context.studentId,classId:context.classId,term:term(),subject:subject()});
      textValue=result.recommendation?"PacEdu provisional recommendation for "+context.displayName+" ("+context.classLevel+"): "+result.recommendationLabel+". Teacher review: "+(result.reviewStatus||"pending-teacher-review")+".":result.message;
    }
    if(info)info.textContent=textValue;
  }
  function refresh() { updateStudentGuidance(); renderTeacherPanel(); }
  function observeStudentSessionBanner() {
    if(!window.MutationObserver || !document.body) return;
    var observer=new window.MutationObserver(function(records) {
      var found=false;
      records.forEach(function(record) {
        Array.prototype.forEach.call(record.addedNodes||[],function(node) {
          if(found || !node || node.nodeType!==1) return;
          if((node.matches && node.matches("[data-pe-student-context-banner]")) ||
             (node.querySelector && node.querySelector("[data-pe-student-context-banner]"))) found=true;
        });
      });
      if(found) { observer.disconnect(); updateStudentGuidance(); }
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  window.PacificEducationEvidenceBasedAbility=Object.freeze({version:VERSION,evaluate:evaluate,recordTermMark:recordTermMark,reviewRecommendation:reviewRecommendation,refresh:refresh,minimumMarkedActivities:MIN_MARKED_ACTIVITIES,levels:LEVELS});
  document.addEventListener("DOMContentLoaded",function(){refresh();observeStudentSessionBanner();});
  document.addEventListener("pacificEducationTeacherReviewCompleted",refresh);
  document.addEventListener("pacificEducationDailyProgressRecorded",refresh);
  document.addEventListener("pacificEducationStudentChanged",refresh);
  document.addEventListener("pacificEducationTermExaminationMarked",refresh);
  document.addEventListener("pacificEducationEvidenceBasedAbilityUpdated",refresh);
  window.addEventListener("storage",refresh);
  if(document.readyState!=="loading")refresh();
})(window,document);
