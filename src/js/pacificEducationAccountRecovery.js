(function(){
  "use strict";
  var KEY="pacificEducationAccountRecovery";
  var MAX_FACE_ATTEMPTS=3;
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
  function write(v){localStorage.setItem(KEY,JSON.stringify(v));}
  function getIdentity(){
    var core=window.PacificEducationCore;
    var studentId=core&&core.getStudent?core.getStudent().id:null;
    return studentId||localStorage.getItem("pacificEducationUserId")||"pilot-student-demo";
  }
  function speak(text){
    if(typeof window.speakText==="function"){window.speakText(text);return;}
    if(window.speechSynthesis){window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));}
  }
  function render(){
    var target=document.getElementById("pacificEducationAccountRecovery");
    if(!target)return;
    target.innerHTML=""
      +"<h2>Account Recovery</h2>"
      +"<p><strong>One person → one Pacific Education account.</strong> Recovery restores the existing account; it never creates a second account.</p>"
      +"<p>Prototype recovery methods: face/liveness verification, security questions, and authorized ID or parent/guardian/school-assisted recovery. Production biometric verification must be provided by an approved secure identity service.</p>"
      +"<button type=\"button\" id=\"peRecoveryFace\">Use face verification</button>"
      +"<button type=\"button\" id=\"peRecoveryQuestions\">Use security questions</button>"
      +"<button type=\"button\" id=\"peRecoveryAlternative\">Use another recovery method</button>"
      +"<div id=\"peRecoveryStatus\" aria-live=\"polite\"></div>";
    document.getElementById("peRecoveryFace").onclick=function(){faceAttempt();};
    document.getElementById("peRecoveryQuestions").onclick=function(){questionRecovery();};
    document.getElementById("peRecoveryAlternative").onclick=function(){
      status("Use verified identity or authorized parent/guardian/school-assisted recovery. No new account will be created.");
    };
  }
  function status(msg){
    var el=document.getElementById("peRecoveryStatus");
    if(el)el.textContent=msg;
    speak(msg);
  }
  function faceAttempt(){
    var data=read();
    data.faceAttempts=Number(data.faceAttempts||0)+1;
    write(data);
    if(data.faceAttempts>MAX_FACE_ATTEMPTS){
      status("Face recovery is temporarily paused after three unsuccessful attempts. Use another recovery method.");
      return;
    }
    status("Face/liveness verification is a production security service and is not connected in this pilot. Attempt "+data.faceAttempts+" of "+MAX_FACE_ATTEMPTS+".");
  }
  function questionRecovery(){
    var q1=window.prompt("Prototype recovery: answer Security Question 1.");
    if(q1===null)return;
    var q2=window.prompt("Prototype recovery: answer Security Question 2.");
    if(q2===null)return;
    var q3=window.prompt("Prototype recovery: answer Security Question 3.");
    if(q3===null)return;
    status("Prototype answers received. Production recovery must verify protected answers server-side and then require a new passkey or password. The existing account will be recovered, not duplicated.");
  }
  window.PacificEducationAccountRecovery={
    version:"1.0.0",
    prototype:true,
    productionEligible:false,
    maxFaceAttempts:MAX_FACE_ATTEMPTS,
    getIdentity:getIdentity,
    render:render,
    startFaceRecovery:faceAttempt
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})();