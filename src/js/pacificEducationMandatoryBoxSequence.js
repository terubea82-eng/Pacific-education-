/* Pacific Education — mandatory box-by-box registration sequence.
 * Additive UI controller. Hides registration complexity one box at a time.
 * Preserves the protected #856 speech controller and existing registration logic.
 */
(function(window, document){
  "use strict";

  /* Role choices and their fields are descendants of the single User Registration box.
     Do not treat the role cards as a separate page or move them outside that box. */
  var BOXES = [
    {id:"pacificEducationCountriesBox", label:"Country"},
    {id:"pacificEducationLanguageBox", label:"Language"},
    {id:"pacificEducationRegistrationBox", label:"User Registration"},
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

    /* Keep a visible Back control beside the Page 4 Next button. It reverses
       the inner registration steps; from Country it returns to the Rules page. */
    var back = get("registrationBackButton");
    if(!back){
      back = document.createElement("button");
      back.type = "button";
      back.id = "registrationBackButton";
      back.textContent = "⬅️ Back";
      back.setAttribute("aria-label","Back to the previous registration step");
      back.style.cssText = "background:#168a3a;color:#fff;border:2px solid #0f642a;border-radius:10px;min-height:52px;min-width:120px;padding:10px 18px;font-weight:800;margin:6px 8px 6px 0;";
      var nav = get("registrationNextWrapper");
      if(nav) nav.insertBefore(back, next);
      else next.parentNode.insertBefore(back,next);
    }
    if(registration.getAttribute("data-pe-box-sequence-ready")==="true") return;
    registration.setAttribute("data-pe-box-sequence-ready","true");

    var state = 0;
    var sequenceStarted = false;
    var registrationSaved = false;

    var controller = document.createElement("section");
    controller.id = "pacificEducationMandatoryBoxSequence";
    controller.setAttribute("aria-label","Mandatory registration sequence");
    controller.style.cssText =
      "margin:0 0 16px;padding:16px;border:3px solid #15803d;border-radius:12px;" +
      "background:inherit;";

    controller.innerHTML =
      "<strong id=\"peBoxSequenceTitle\">Registration progress — Country</strong>" +
      "<p id=\"peBoxSequenceProgress\" role=\"status\" aria-live=\"polite\">Complete this box, then press Next.</p>";

    registration.insertBefore(controller, registration.firstChild);

    var title = get("peBoxSequenceTitle");
    var progress = get("peBoxSequenceProgress");

    function hideAll(){
      BOXES.forEach(function(item){
        var el=get(item.id);
        if(el) el.hidden=true;
      });
      form.hidden=true;
      var cards=get("pilotUserRoleCards");
      if(cards) cards.hidden=true;
      var fields=get("pilotRoleRegistrationFields");
      if(fields) fields.hidden=true;
    }

    function selectedRole(){
      var role=get("pilotRegistrationRole");
      var value=role ? String(role.value||"").trim() : "";
      var cards=document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card[aria-pressed=\"true\"]");
      return !!value || cards.length>0;
    }
    function selectedRoleName(){
      var role=get("pilotRegistrationRole");
      var value=role ? String(role.value||"").trim() : "";
      if(value) return value;
      var card=document.querySelector("#pilotUserRoleCards .pe-user-role-card[aria-pressed=\"true\"]");
      return card ? String(card.getAttribute("data-role")||"").trim() : "";
    }

    /* Some older interaction-repair passes marked role cards as intentionally
       disabled while their parent form was hidden. Re-enable only the visible
       role-picker controls when the registration sequence reaches role choice;
       this does not unlock payment, production, or privileged workspace controls. */
    function enableRoleCards(){
      var cards=document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card");
      cards.forEach(function(card){
        card.disabled=false;
        card.removeAttribute("aria-disabled");
        card.removeAttribute("data-pacific-disabled-intentional");
        card.style.pointerEvents="auto";
        card.style.touchAction="manipulation";
        card.style.position="relative";
        card.style.zIndex="2";
      });
    }

    /* Other legacy repair modules can re-apply a stale disabled marker after the
       role picker opens. Observe only the role-card disabled attributes and repair
       them while this sequence owns role selection; do not touch privileged controls. */
    var roleCardObserver=null;
    function watchRoleCardAvailability(){
      var cards=get("pilotUserRoleCards");
      if(!cards || roleCardObserver) return;
      roleCardObserver=new MutationObserver(function(){
        if(state===2 || state===3) enableRoleCards();
      });
      roleCardObserver.observe(cards,{
        subtree:true,
        attributes:true,
        attributeFilter:["disabled","aria-disabled","data-pacific-disabled-intentional"]
      });
    }
    watchRoleCardAvailability();

    /* Make role-card taps self-sufficient on mobile browsers. The normal registration
       script still owns its status/voice behaviour; this synchronous capture handler
       guarantees the selected value and visible fields are set before Next is re-evaluated. */
    function activateRoleCard(card){
      if(!card) return;
      var value=card.getAttribute("data-role")||"";
      if(!value) return;
      var cards=document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card");
      cards.forEach(function(item){
        item.setAttribute("aria-pressed",String(item===card));
        item.disabled=false;
        item.style.pointerEvents="auto";
        item.style.touchAction="manipulation";
        item.style.position="relative";
        item.style.zIndex="2";
      });
      var role=get("pilotRegistrationRole");
      if(role) role.value=value;
      var fields=get("pilotRoleRegistrationFields");
      if(fields) fields.hidden=false;
      var selected=get("pilotSelectedRole");
      if(selected) selected.textContent="Selected role: "+value;
      var status=get("pilotRegistrationStatus");
      if(status) status.textContent=value+" selected. Complete your name, then press Next to save registration.";
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

      if(state===2){
        /* Keep the role picker and any selected-role fields inside the visible
           User Registration box. Selecting a role opens its fields immediately. */
        form.hidden=false;
        var cards=get("pilotUserRoleCards");
        if(cards) cards.hidden=false;
        enableRoleCards();
        var fields=get("pilotRoleRegistrationFields");
        if(fields) fields.hidden=!selectedRole();
        title.textContent="Registration progress — Choose your role";
        progress.textContent=selectedRole()
          ? "Your role-specific registration fields are open inside this User Registration box. Complete them, then press Next."
          : "Choose one user role below. The role-specific registration fields will open inside this same box.";
      }else if(state===3){
        /* The fields are nested in the registration form, so keep their parent
           box visible rather than displaying a detached role-fields panel. */
        var registrationBox=get("pacificEducationRegistrationBox");
        if(registrationBox) registrationBox.hidden=false;
        form.hidden=false;
        var cards2=get("pilotUserRoleCards");
        if(cards2) cards2.hidden=false;
        enableRoleCards();
        var fields2=get("pilotRoleRegistrationFields");
        if(fields2) fields2.hidden=false;
        title.textContent="Registration progress — Your name";
        progress.textContent="Complete the registration fields inside this same box, then save.";
      }else{
        title.textContent="Registration progress — "+item.label;
        progress.textContent="Complete the visible box only, then press Next.";
      }

      next.textContent=state===3 ? (registrationSaved ? "➡️ Next — Open "+(selectedRoleName()||"your")+" Workspace" : "➡️ Next (save registration first)") : "➡️ Next";
      next.disabled =
        (state===0 && !(get("pacificEducationCountrySelect")||{}).value) ||
        (state===1 && !(get("pacificEducationLanguageSelect")||{}).value) ||
        (state===2 && !selectedRole()) ||
        (state===3 && !registrationSaved);

      /* Some legacy interaction-repair scripts can leave the Save button disabled
         even after the role and display name are complete. This sequence is the
         owner of this pilot-only form: enable Save only on step 4 when both required
         fields are present. Keep it disabled at every earlier step. */
      var saveButton=get("pilotRegistrationSaveButton");
      if(saveButton){
        saveButton.disabled=!(state===3 && !registrationSaved && selectedRole() && validName());
        if(registrationSaved) saveButton.textContent="✓ Registration Saved";
        saveButton.setAttribute("aria-disabled",String(saveButton.disabled));
      }

      speak(item.label+". Complete this box, then press Next.");
    }

    function nextStep(event){
      /* This button belongs only to the mandatory registration box sequence.
         Prevent legacy page-level click handlers from treating its Next tap as
         a Welcome/entry navigation action. The protected voice engine is untouched. */
      if(event){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      if(state===0){
        if(!(get("pacificEducationCountrySelect")||{}).value) return;
        state=1; update(); return;
      }
      if(state===1){
        if(!(get("pacificEducationLanguageSelect")||{}).value) return;
        state=2; update(); return;
      }
      if(state===2){
        if(!selectedRole()) return;
        state=3; update(); return;
      }
      if(registrationSaved){
        var roleName=selectedRoleName();
        var workspace=window.PacificEducationSequentialRoleWorkspaces;
        if(!roleName || !workspace || typeof workspace.build!=="function"){
          progress.textContent="Registration is saved, but your role-specific workspace is not ready. Reload the pilot page and try Next again.";
          speak("Registration is saved, but your role-specific workspace is not ready. Reload the pilot page and try Next again.");
          return;
        }
        progress.textContent="Registration saved. Opening the "+roleName+" Workspace because you pressed Next.";
        speak("Registration saved. Opening the "+roleName+" Workspace.");
        workspace.build(roleName);
        return;
      }
      progress.textContent="Save Pilot Registration first. After the saved confirmation appears, press the green Next button to open your selected role workspace.";
      speak("Save Pilot Registration first. After the saved confirmation appears, press Next to open your selected role workspace.");
      return;
    }

    /* Saving confirms the pilot profile only. Navigation is deliberately deferred
       until the user presses the green Next button after seeing the confirmation. */
    var saveButton=get("pilotRegistrationSaveButton");
    if(saveButton && saveButton.getAttribute("data-pe-sequence-save-handoff")!=="true"){
      saveButton.setAttribute("data-pe-sequence-save-handoff","true");
      saveButton.addEventListener("click",function(){
        window.setTimeout(function(){
          var registered=false;
          try{
            var raw=window.sessionStorage.getItem("pacificEducationPilotRegistration");
            var record=raw ? JSON.parse(raw) : null;
            var roleValue=String(record && record.role || "").trim();
            var displayName=String(record && (record.name || record.displayName) || "").trim();
            var roleField=get("pilotRegistrationRole");
            var selectedValue=String(roleField && roleField.value || "").trim();
            var roleCard=document.querySelector("#pilotUserRoleCards .pe-user-role-card[aria-pressed='true']");
            if(!selectedValue && roleCard) selectedValue=String(roleCard.getAttribute("data-role")||"").trim();
            registered=!!(displayName && roleValue && selectedValue && roleValue.toLowerCase()===selectedValue.toLowerCase());
            if(registered){
              window.sessionStorage.setItem("pacificEducationPilotRegistered","true");
              window.sessionStorage.setItem("pacificEducationPilotRole",roleValue);
            }
          }catch(e){ registered=false; }
          if(!registered){
            progress.textContent="Registration has not been confirmed. Check the required fields and try Save Pilot Registration again.";
            speak("Registration has not been confirmed. Check the required fields and try again.");
            return;
          }
          registrationSaved=true;
          progress.textContent="Registration confirmed and saved. Press the green Next button when you are ready to continue.";
          var registrationStatus=get("pilotRegistrationStatus");
          if(registrationStatus) registrationStatus.textContent="Pilot registration saved for "+roleValue+". Press Next when ready to continue.";
          next.textContent="➡️ Next — Open "+(selectedRoleName()||"your")+" Workspace";
          next.disabled=false;
          if(saveButton){
            saveButton.disabled=true;
            saveButton.setAttribute("aria-disabled","true");
            saveButton.textContent="✓ Registration Saved";
          }
          speak("Registration confirmed and saved. Press Next when you are ready to continue.");
        },350);
      },false);
    }

    back.addEventListener("click",function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(state>0){
        if(state===3) registrationSaved=false;
        state=state-1;
        update();
        return;
      }
      var rulesBack=get("paceduRulesBack");
      if(rulesBack){ rulesBack.click(); return; }
      progress.textContent="Use the previous page navigation to return to Rules & Conditions.";
    },true);

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
        activateRoleCard(card);
        /* Let the existing registration listener finish, then refresh Next eligibility. */
        window.setTimeout(update,0);
      }
    },true);

    /* Touch browsers dispatch click after a tap; explicitly remove any stale disabled
       state and keep cards hit-testable whenever the role picker is revealed. */
    document.addEventListener("touchend",function(event){
      var card=event.target && event.target.closest ? event.target.closest("#pilotUserRoleCards .pe-user-role-card") : null;
      if(card && !card.disabled){
        card.style.pointerEvents="auto";
        card.style.touchAction="manipulation";
      }
    },{capture:true,passive:true});

    /* Registration save is intentionally not allowed to open a role workspace here.
       SingleNavigation remains the only guided-flow owner. */

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
