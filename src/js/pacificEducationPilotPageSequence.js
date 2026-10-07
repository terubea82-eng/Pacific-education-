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
    if(page===4){
      body.classList.remove("pacedu-entry-mode");
      body.classList.add("pe-guided-flow");
      body.setAttribute("data-pe-flow-step","1");
      var reg=byId("pacificEducationIdentityRegistration");
      if(reg)reg.scrollIntoView({behavior:"smooth",block:"start"});
      announce("Rules confirmed. Welcome to registration. Choose your country, language, then your user role.");
      return;
    }
    body.classList.add("pacedu-entry-mode");
    body.classList.remove("pe-guided-flow");
    Object.keys(pages).forEach(function(k){
      var el=byId(pages[k]);
      if(el)el.hidden=(Number(k)!==page);
    });
    var welcome=byId("pacificEducationWelcome");
    if(welcome)welcome.style.display="";
    var pilot=byId("pacificEducationPilotPages");
    if(pilot)pilot.hidden=false;
    if(page===1)announce("Welcome to Pacific Education. Continue to learn about our vision, mission and purpose.");
    if(page===2)announce("Vision, mission and purpose. Continue to the mandatory Pacedu rules and conditions.");
    if(page===3)announce("Pacedu Rules and Conditions. Read and confirm the required agreement before registration.");
  }
  function init(){
    document.body.classList.add("pacedu-entry-mode");
    var pilot=byId("pacificEducationPilotPages"); if(pilot)pilot.hidden=false;
    var v=byId("paceduVisionNext"),vb=byId("paceduVisionBack");
    var r=byId("paceduRulesContinue"),rb=byId("paceduRulesBack"),check=byId("paceduRulesAgreement"),status=byId("paceduRulesStatus");
    if(v)v.onclick=function(){show(3);};
    if(vb)vb.onclick=function(){show(1);};
    if(rb)rb.onclick=function(){show(2);};
    function sync(){
      var ok=!!(check&&check.checked);
      if(r)r.disabled=!ok;
      if(status)status.textContent=ok?"Agreement confirmed. You may continue to registration.":"Agreement required before registration can continue.";
    }
    if(check)check.addEventListener("change",sync);
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