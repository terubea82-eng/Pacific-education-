/* Pacific Education — mandatory box-by-box registration sequence.
 * Additive UI controller. Hides registration complexity one box at a time.
 * Preserves the protected #856 speech controller and existing registration logic.
 */
(function(window, document){
  "use strict";

  var BOXES = [
    {id:"pacificEducationCountriesBox", label:"Country"},
    {id:"pacificEducationLanguageBox", label:"Language"},
    {id:"pacificEducationRegistrationBox", label:"Open User Registration"},
    {id:"pilotUserRoleCards", label:"User Role"},
    {id:"pilotRoleRegistrationFields", label:"Your Registration"}
  ];

  function speak(message){
    try{
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText === "function"){
        window.PacificEducationSpeech.speakText(message);
      }
    }catch(e){}
  }

  function get(id){ return document.getElementById(id); }

  function setup(){
    var registration = get("pacificEducationIdentityRegistration");
    var setupBoxes = get("pacificEducationSetupBoxes");
    var form = get("userRegistrationForm");
    var next = get("registrationNextButton");
    if(!registration || !setupBoxes || !next || !form) return;
    if(registration.getAttribute("data-pe-box-sequence-ready")==="true") return;
    registration.setAttribute("data-pe-box-sequence-ready","true");

    var state = 0;
    var sequenceStarted = false;

    var controller = document.createElement("section");
    controller.id = "pacificEducationMandatoryBoxSequence";
    controller.setAttribute("aria-label","Mandatory registration sequence");
    controller.style.cssText =
      "margin:0 0 16px;padding:16px;border:3px solid #15803d;border-radius:12px;" +
      "background:inherit;";

    controller.innerHTML =
      "<strong id=\"peBoxSequenceTitle\">Mandatory registration — Step 1 of 5</strong>" +
      "<p id=\"peBoxSequenceProgress\" role=\"status\" aria-live=\"polite\">Complete one box, then press Next.</p>";

    registration.insertBefore(controller, registration.firstChild);

    var title = get("peBoxSequenceTitle");
    var progress = get("peBoxSequenceProgress");

    function hideAll(){
      BOXES.forEach(function(item){
        var el=get(item.id);
        if(el) el.hidden=true;
      });
      form.hidden=true;
    }

    function selectedRole(){
      var cards=document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card[aria-pressed=\"true\"]");
      return cards.length>0;
    }

    function validName(){
      var input=get("pilotRegistrationName");
      return !!(input && String(input.value||"").trim());
    }

    function update(){
      hideAll();
      sequenceStarted = true;

      var item=BOXES[state];
      var el=get(item.id);
      if(el) el.hidden=false;

      if(state===3){
        form.hidden=false;
        var fields=get("pilotRoleRegistrationFields");
        if(fields) fields.hidden=true;
        title.textContent="Mandatory registration — Step 4 of 5";
        progress.textContent="Choose exactly one user role. Then press Next.";
      }else if(state===4){
        form.hidden=false;
        var fields2=get("pilotRoleRegistrationFields");
        if(fields2) fields2.hidden=false;
        title.textContent="Mandatory registration — Step 5 of 5";
        progress.textContent="Enter your display name. Then save your registration.";
      }else{
        title.textContent="Mandatory registration — Step "+(state+1)+" of 5";
        progress.textContent="Complete the visible box only, then press Next.";
      }

      next.textContent=state===4 ? "✓ Save Registration" : "➡️ Next";
      next.disabled =
        (state===0 && !(get("pacificEducationCountrySelect")||{}).value) ||
        (state===1 && !(get("pacificEducationLanguageSelect")||{}).value) ||
        (state===2 && false) ||
        (state===3 && !selectedRole()) ||
        (state===4 && !validName());

      if(state===2){
        var open=get("userRegistrationOpenButton");
        if(open) open.hidden=false;
      }

      speak("Registration step "+(state+1)+" of 5. "+item.label+". Complete this box, then press Next.");
    }

    function nextStep(){
      if(state===0){
        if(!(get("pacificEducationCountrySelect")||{}).value) return;
        state=1; update(); return;
      }
      if(state===1){
        if(!(get("pacificEducationLanguageSelect")||{}).value) return;
        state=2; update(); return;
      }
      if(state===2){
        var open=get("userRegistrationOpenButton");
        if(open) open.click();
        state=3; update(); return;
      }
      if(state===3){
        if(!selectedRole()) return;
        state=4; update(); return;
      }
      var save=get("pilotRegistrationSaveButton");
      if(save && !save.disabled){
        save.click();
        progress.textContent="Registration submitted. Opening your individual workspace...";
        speak("Registration submitted. Opening your individual workspace.");
      }
    }

    next.addEventListener("click",nextStep,true);

    ["pacificEducationCountrySelect","pacificEducationLanguageSelect","pilotRegistrationName"].forEach(function(id){
      var el=get(id);
      if(el){
        el.addEventListener("input",function(){ update(); },true);
        el.addEventListener("change",function(){ update(); },true);
      }
    });

    document.addEventListener("click",function(event){
      var card=event.target && event.target.closest ? event.target.closest("#pilotUserRoleCards .pe-user-role-card") : null;
      if(card){
        setTimeout(update,0);
      }
    },true);

    var save=get("pilotRegistrationSaveButton");
    if(save){
      save.addEventListener("click",function(){
        setTimeout(function(){
          var registered=false, role="";
          try{
            registered=sessionStorage.getItem("pacificEducationPilotRegistered")==="true" ||
              !!sessionStorage.getItem("pacificEducationPilotRegistration");
            role=sessionStorage.getItem("pacificEducationPilotRole")||"";
          }catch(e){}
          if(registered && role && window.PacificEducationSequentialRoleWorkspaces &&
             typeof window.PacificEducationSequentialRoleWorkspaces.build==="function"){
            window.PacificEducationSequentialRoleWorkspaces.build(role);
          }
        },150);
      },true);
    }

    hideAll();
    // Registration starts only when Page 4 is entered; never expose all registration boxes at once.
    update();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setup);
  else setup();

  window.PacificEducationMandatoryBoxSequence = {
    version:"1.0.0",
    description:"Mandatory one-box-at-a-time registration sequence preserving protected #856 voice."
  };
})(window,document);
