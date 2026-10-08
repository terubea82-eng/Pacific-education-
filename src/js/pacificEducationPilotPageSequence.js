(function(){
  "use strict";

  var AGREEMENT_KEY="paceduRulesAgreementV1";

  function byId(id){
    return document.getElementById(id);
  }

  function announce(text){
    try{
      if(window.PacificEducationSpeech &&
         typeof window.PacificEducationSpeech.speakText==="function"){
        window.PacificEducationSpeech.speakText(text,{priority:"navigation"});
      }
    }catch(_){}
  }

  function show(page){
    document.body.setAttribute(
      "data-pac-edu-entry-page",
      String(page)
    );

    var body= document.body;
    var welcome=byId("pacificEducationWelcome");
    var welcomeNext=byId("welcomeNextWrapper");
    var pilot=byId("pacificEducationPilotPages");
    var reg=byId("pacificEducationIdentityRegistration");

    body.classList.remove("pe-guided-flow");

    if(page===2){
      body.classList.remove("pe-guided-flow");
      body.classList.add(
        "pacedu-entry-mode",
        "pacedu-registration-mode"
      );

      if(pilot){
        pilot.hidden=true;
        pilot.style.display="none";
      }

      if(welcome){
        welcome.hidden=true;
        welcome.style.display="none";
      }

      if(welcomeNext){
        welcomeNext.hidden=true;
        welcomeNext.style.display="none";
      }

      if(reg){
        reg.hidden=false;
        reg.style.display="";
        reg.scrollIntoView({
          behavior:"smooth",
          block:"start"
        });
      }

      announce(
        "Welcome to User Registration. Choose your country, language, and user role."
      );
      return;
    }

    body.classList.remove("pacedu-registration-mode");
    body.classList.add("pacedu-entry-mode");

    if(welcome){
      welcome.hidden=false;
      welcome.style.display="";
    }

    if(welcomeNext){
      welcomeNext.hidden=false;
      welcomeNext.style.display="";
    }

    if(pilot){
      pilot.hidden=true;
      pilot.style.display="none";
    }

    if(reg){
      reg.hidden=true;
      reg.style.display="none";
    }
  }

  function bindWelcomeNext(){
    var button=byId("welcomeNextButton");

    if(!button ||
       button.getAttribute("data-pe-page-next-bound")==="true"){
      return;
    }

    button.setAttribute(
      "data-pe-page-next-bound",
      "true"
    );

    button.addEventListener(
      "click",
      function(e){
        if(e)e.preventDefault();
        show(2);
      },
      false
    );
  }

  function init(){
    document.body.classList.add("pacedu-entry-mode");

    bindWelcomeNext();

    show(1);

    window.setTimeout(
      bindWelcomeNext,
      300
    );

    window.setTimeout(
      bindWelcomeNext,
      1000
    );
  }

  window.PacificEducationPilotPages={
    version:"2.0.0",
    goTo:show,
    agreementKey:AGREEMENT_KEY
  };

  if(document.readyState==="loading"){
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  }else{
    init();
  }

})();
