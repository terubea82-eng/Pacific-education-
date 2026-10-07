(function(){
  "use strict";
  var AGREEMENT_KEY="paceduRulesAgreementV1";
  var pages={1:"pacificEducationWelcome",2:"paceduPageVision",3:"paceduPageRules"};
  function byId(id){return document.getElementById(id);}
  function announce(text){
    try{
      if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function"){
        window.PacificEducationSpeech.speakText(text,{priority:"navigation"});
      }
    }catch(_){}
  }
  function show(page){
    var body=document.body;
    var welcome=byId("pacificEducationWelcome");
    var welcomeNext=byId("welcomeNextWrapper");
    var pilot=byId("pacificEducationPilotPages");
    if(page===4){
      body.classList.remove("pe-guided-flow");
      body.classList.add("pacedu-entry-mode","pacedu-registration-mode");
      if(pilot)pilot.hidden=true;
      if(welcome)welcome.hidden=true;
      if(welcomeNext)welcomeNext.hidden=true;
      var reg=byId("pacificEducationIdentityRegistration");
      if(reg)reg.style.display="";
      if(reg)reg.scrollIntoView({behavior:"smooth",block:"start"});
      announce("Rules confirmed. Welcome to User Registration. Choose your country, language, then your user role.");
      return;
    }
    body.classList.remove("pacedu-registration-mode");
    body.classList.add("pacedu-entry-mode");
    body.classList.remove("pe-guided-flow");
    Object.keys(pages).forEach(function(k){
      var el=byId(pages[k]);
      if(el)el.hidden=(Number(k)!==page);
    });
    var welcome=byId("pacificEducationWelcome");
    if(welcome)welcome.style.display="";
    if(page===1){
      if(welcome)welcome.hidden=false;
      if(welcomeNext)welcomeNext.hidden=false;
      if(pilot)pilot.hidden=true;
    }else{
      if(welcome)welcome.hidden=true;
      if(welcomeNext)welcomeNext.hidden=true;
      if(pilot)pilot.hidden=false;
    }
    if(page===1)announce("Welcome to Pacific Education. Continue to learn about our vision, mission and purpose.");
    if(page===2)announce("Vision, mission and purpose. Continue to the mandatory Pacedu rules and conditions.");
    if(page===3)announce("Pacedu Rules and Conditions. Read and confirm the required agreement before registration.");
  }
  function init(){
    document.body.classList.add("pacedu-entry-mode");
    var pilot=byId("pacificEducationPilotPages"); if(pilot)pilot.hidden=true;
    var v=byId("paceduVisionNext"),vb=byId("paceduVisionBack"),vv=byId("paceduVisionVoice");
    var r=byId("paceduRulesContinue"),rb=byId("paceduRulesBack"),rv=byId("paceduRulesVoice"),check=byId("paceduRulesAgreement"),status=byId("paceduRulesStatus");
    if(v)v.onclick=function(e){if(e)e.preventDefault();show(3);};
    if(vb)vb.onclick=function(e){if(e)e.preventDefault();show(1);};
    if(vv)vv.onclick=function(){announce("Vision: accessible, inclusive and meaningful education for learners across the Pacific and beyond. Mission: use modern education technology to connect learners, teachers, families and education partners with learning, assessment, evidence and progress. Purpose: support learning step by step, reduce unnecessary teacher workload, identify learner strengths and needs, and keep learning connected when circumstances are difficult.");};
    if(rb)rb.onclick=function(e){if(e)e.preventDefault();show(2);};
    if(rv)rv.onclick=function(){announce("Pacedu Rules and Conditions. Registration requires agreement. Use Pacedu for lawful educational activities. Respect other users. Provide accurate registration information. Protect privacy and workspaces. Do not falsify learning evidence. Payments are inactive during the controlled pilot. Pacedu is a controlled pilot, not a fully approved production service. Use accessibility and voice controls responsibly. Changes are made under documented change control.");};
    function sync(){
      var ok=!!(check&&check.checked);
      if(r)r.disabled=!ok;
      if(status)status.textContent=ok?"Agreement confirmed. You may continue to registration.":"Agreement required before registration can continue.";
    }
    if(check)check.addEventListener("change",sync);
    var welcomeNextButton=byId("welcomeNextButton");
    if(welcomeNextButton)welcomeNextButton.onclick=function(e){if(e)e.preventDefault();show(2);};
    if(r)r.onclick=function(){
      if(!check||!check.checked)return;
      try{localStorage.setItem(AGREEMENT_KEY,JSON.stringify({version:"1",acceptedAt:new Date().toISOString()}));}catch(_){}
      sync(); show(4);
    };
    sync();
    show(1);
  }
  window.PacificEducationPilotPages={version:"1.0.0",goTo:show,agreementKey:AGREEMENT_KEY};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();