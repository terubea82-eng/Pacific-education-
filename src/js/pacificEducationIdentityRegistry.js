(function(){
  "use strict";
  var KEY="pacificEducationAccountIdentity";
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
  function write(v){localStorage.setItem(KEY,JSON.stringify(v));}
  function create(input){
    input=input||{};
    var role=String(input.role||"user").trim();
    var fingerprint=String(input.verifiedIdentityFingerprint||"").trim();
    if(!fingerprint)throw new Error("Verified identity is required.");
    var data=read();
    if(data[fingerprint])return {status:"existing-account",pacificEducationId:data[fingerprint].pacificEducationId};
    var id="PE-USER-"+Date.now().toString(36).toUpperCase();
    data[fingerprint]={pacificEducationId:id,role:role,status:"pending-verification",oneAccountOnly:true,serverVerificationRequired:true};
    write(data);
    return {status:"created",pacificEducationId:id};
  }
  function render(){
    var el=document.getElementById("pacificEducationIdentityRegistration");
    if(!el)return;
    /* Preserve the pilot registration form rendered by src/index.html. This registry
       is the identity boundary; it must not replace the usable pilot form. */
    if(document.getElementById("pilotRegistrationName") && document.getElementById("pilotRegistrationRole") && document.getElementById("pilotRegistrationSaveButton"))return;
    el.innerHTML="<h2>Identity Registration</h2><p><strong>One person → one Pacific Education ID → one account.</strong></p><p>Production identity verification must be completed by the secure server. The browser must not store or expose the underlying identification number.</p><p id=\"peIdentityStatus\" aria-live=\"polite\">Identity registration boundary ready.</p>";
  }
  window.PacificEducationIdentityRegistry={version:"1.0.0",prototype:true,productionEligible:false,createIdentity:create,render:render};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})();