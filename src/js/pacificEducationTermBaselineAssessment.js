/* Pacific Education — Term Baseline Diagnostic */
(function(window,document){
  "use strict";
  var VERSION="1.0.0", KEY="pacificEducationTermBaselineAssessments";
  function core(){return window.PacificEducationCore||null;}
  function studentId(){var c=core(),s=c&&typeof c.getState==="function"?c.getState().student:null;return s&&(s.studentId||s.id)||"pilot-student-demo";}
  function context(){return {studentId:studentId(),level:localStorage.getItem("pacificEducationLevel")||"Class 1",subjectId:localStorage.getItem("pacificEducationSubject")||"English",term:localStorage.getItem("pacificEducationTerm")||"Term 1"};}
  function records(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}}
  function save(x){var a=records().filter(function(r){return !(r.studentId===x.studentId&&r.level===x.level&&r.term===x.term);});a.push(x);localStorage.setItem(KEY,JSON.stringify(a.slice(-500)));}
  function current(){var c=context();return records().find(function(r){return r.studentId===c.studentId&&r.level===c.level&&r.term===c.term;})||null;}
  function questions(){return [
    {skill:"Reading / language",q:"Read or listen to this instruction and explain what you understand.",mode:"open"},
    {skill:"Communication",q:"Tell us one thing you can explain clearly about something you learned.",mode:"open"},
    {skill:"Numeracy",q:"Solve a simple number problem suitable for your selected class and explain how you solved it.",mode:"open"},
    {skill:"Problem solving",q:"Describe or say how you would solve a new problem when you are not sure of the answer.",mode:"open"},
    {skill:"Learning independence",q:"Show or explain how you normally complete a learning activity.",mode:"open"}
  ];}
  function speak(text){if(typeof window.speakText==="function")window.speakText(text);else if(window.speechSynthesis){window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));}}
  function start(){var c=context(), qs=questions(), answers=[],i=0; var target=document.getElementById("pacificEducationTermBaseline");if(!target)return false;
    function render(){var q=qs[i];target.innerHTML="<h3>Mandatory Term Baseline Assessment</h3><p>Term: "+c.term+" • "+c.level+"</p><p><strong>Question "+(i+1)+" of "+qs.length+" — "+q.skill+"</strong></p><p>"+q.q+"</p><button type='button" id='peBaselineListen">🔊 Listen</button><label> Answer by voice <input id='peBaselineAudio" type='file" accept='audio/*" capture></label><br><textarea id='peBaselineAnswer" rows='4" style='width:100%' placeholder='Written answer (optional when using audio)"></textarea><br><button type='button" id='peBaselineNext">Save and continue</button><div id='peBaselineStatus" aria-live='polite"></div>";
      document.getElementById("peBaselineListen").onclick=function(){speak(q.q);};
      document.getElementById("peBaselineNext").onclick=function(){var a=document.getElementById("peBaselineAnswer").value.trim(),f=document.getElementById("peBaselineAudio").files[0],reader=new FileReader();function done(audio){answers.push({skill:q.skill,question:q.q,answer:a,audioDataUrl:audio||""});i++;if(i<qs.length)render();else finish();}if(f){reader.onload=function(){done(String(reader.result||""));};reader.readAsDataURL(f);}else done("");};
    }
    function finish(){var answered=answers.filter(function(a){return !!(String(a.answer||"").trim()||String(a.audioDataUrl||""));}).length;var percentage=Math.round((answered/qs.length)*100);var r={id:"baseline-"+c.studentId+"-"+c.term+"-"+Date.now(),studentId:c.studentId,level:c.level,subjectId:c.subjectId,term:c.term,schoolId:localStorage.getItem("pacificEducationSchoolId")||"",answers:answers,percentage:percentage,scorePercentage:percentage,assessmentType:"term-baseline",completedAt:new Date().toISOString(),status:"completed",teacherReviewRequired:true,prototype:true};save(r);target.innerHTML="<h3>Baseline assessment completed</h3><p>Your starting skills evidence has been recorded for the selected term. Teacher review is required.</p>";document.dispatchEvent(new CustomEvent("pacificEducationBaselineCompleted",{detail:r}));}
    render();return true;
  }
  function isComplete(){return !!current();}
  function gate(day){if(day<1||day>5)return false;return !isComplete();}
  window.PacificEducationTermBaselineAssessment=Object.freeze({version:VERSION,start:start,isComplete:isComplete,gate:gate,current:current});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){var t=document.getElementById("pacificEducationTermBaseline");if(t)t.innerHTML="<p>Every learner must complete a baseline skills assessment during Week 1 of every term.</p><button type='button" id='peStartBaseline">Start mandatory baseline assessment</button>";var b=document.getElementById("peStartBaseline");if(b)b.onclick=start;});
})(window,document);