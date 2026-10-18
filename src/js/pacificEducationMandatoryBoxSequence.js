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
      if(status) status.textContent=value+" selected. Enter a display name, press Save Pilot Registration, wait for the saved confirmation, then press the green Next button to open your workspace.";
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

        /* End guided-registration isolation before creating the workspace.
           Otherwise the page-isolation observers can keep enforcing Page 4
           after the workspace is built, hiding its shell and Back/Next controls. */
        /* Release the direct-Registration first-paint guard only after the user
           completes registration and opens the workspace. Otherwise its html
           selector can keep hiding #app after guided body classes are removed. */
        var root=document.documentElement;
        if(root){
          root.setAttribute("data-pacedu-navigation-ready","true");
          root.removeAttribute("data-pacedu-registration-entry");
        }
        var body=document.body;
        if(body){
          body.setAttribute("data-pe-guided-complete","true");
          /* Mark the guided flow complete as well as removing its active classes.
             index.html deliberately keeps Learning Tools hidden until this marker
             exists; omitting it leaves the learner without the existing activity UI. */
          body.classList.add("pe-guided-flow-ended");
          body.classList.remove("pe-guided-flow","pacedu-entry-mode","pacedu-registration-mode");
          body.removeAttribute("data-pe-flow-step");
          body.removeAttribute("data-pe-active-guided-page");
        }
        var entryPages=get("pacificEducationPilotPages");
        if(entryPages){
          entryPages.hidden=true;
          entryPages.style.setProperty("display","none","important");
        }
        ["pacificEducationWelcome","paceduPageVision","paceduPageRules"].forEach(function(id){
          var entryPage=get(id);
          if(entryPage){
            entryPage.hidden=true;
            entryPage.setAttribute("aria-hidden","true");
            entryPage.style.setProperty("display","none","important");
          }
        });
        ["welcomeNextWrapper","paceduVisionNext","paceduRulesContinue","registrationNextWrapper",
         "prototypeNextWrapper","levelNextWrapper","subjectNextWrapper","termNextWrapper",
         "capabilityNextWrapper","dailyNextWrapper","practiceNextWrapper","assessmentNextWrapper",
         "coverageNextWrapper","teacherCalendarNextWrapper"].forEach(function(id){
          var wrapper=get(id);
          if(wrapper) wrapper.style.setProperty("display","none","important");
        });
        var menu=get("pacificEducationAppMenu");
        if(menu){ menu.hidden=false; menu.style.removeProperty("display"); }

        try{
          workspace.build(roleName);
          var openedWorkspace=get("pacificEducationSequentialRoleWorkspace");
          if(!openedWorkspace){
            throw new Error("Sequential role workspace was not created.");
          }
          openedWorkspace.hidden=false;
          openedWorkspace.style.setProperty("display","block","important");
          openedWorkspace.style.setProperty("visibility","visible","important");
          /* A prior failed attempt may have left its recovery panel behind. Once
             the real workspace is present, remove that stale handoff screen. */
          var staleRecovery=get("paceduWorkspaceHandoffRecovery");
          if(staleRecovery) staleRecovery.remove();
          return;
        }catch(workspaceError){
          /* Do not strand the learner on an empty screen if a legacy runtime
             throws during workspace construction. Keep an explicit recovery
             panel with a real retry action; never silently claim success. */
          var app=get("app");
          var recovery=get("paceduWorkspaceHandoffRecovery");
          if(!recovery && app){
            recovery=document.createElement("section");
            recovery.id="paceduWorkspaceHandoffRecovery";
            recovery.setAttribute("role","alert");
            recovery.style.cssText="display:block!important;visibility:visible!important;padding:20px;border:3px solid #b45309;border-radius:10px;margin:16px 0;";
            var heading=document.createElement("h2");
            heading.textContent="User Type Completed — Workspace Recovery";
            var message=document.createElement("p");
            message.textContent="Your selected user type and registration are saved. The role workspace did not finish opening. Use Retry or Sign In / Reopen Workspace to try again, or choose Sign Out to open the existing final Sign Out page.";
            var retry=document.createElement("button");
            retry.type="button";
            retry.id="paceduWorkspaceHandoffRetry";
            retry.textContent="Retry Open Workspace";
            retry.style.cssText="display:inline-block!important;padding:14px 18px;background:#15803d;color:#fff;font-weight:700;border-radius:8px;";
            retry.addEventListener("click",function(){
              try{
                var prior=get("pacificEducationSequentialRoleWorkspace");
                if(prior) prior.remove();
                workspace.build(roleName);
                var rebuilt=get("pacificEducationSequentialRoleWorkspace");
                if(!rebuilt) throw new Error("Workspace shell was not created.");
                rebuilt.hidden=false;
                rebuilt.style.setProperty("display","block","important");
                rebuilt.style.setProperty("visibility","visible","important");
                recovery.remove();
              }catch(retryError){
                var retryStatus=recovery.querySelector("p");
                if(retryStatus) retryStatus.textContent="The workspace still could not open. Reload the pilot and retry; your saved registration has not been deleted.";
              }
            });
            var reopen=document.createElement("button");
            reopen.type="button";
            reopen.id="paceduWorkspaceHandoffSignIn";
            reopen.textContent="Sign In / Reopen Workspace";
            reopen.setAttribute("aria-label","Sign in again and reopen the selected role workspace");
            reopen.style.cssText="display:inline-block!important;margin:8px;padding:14px 18px;background:#15803d;color:#fff;font-weight:700;border-radius:8px;";
            reopen.addEventListener("click",function(){ retry.click(); });
            var signOut=document.createElement("button");
            signOut.type="button";
            signOut.id="paceduWorkspaceHandoffSignOut";
            signOut.textContent="Sign Out";
            signOut.setAttribute("aria-label","Open the existing final Sign Out page");
            signOut.style.cssText="display:inline-block!important;margin:8px;padding:14px 18px;background:#a62e35;color:#fff;font-weight:700;border-radius:8px;";
            signOut.addEventListener("click",function(){
              try{
                var current=get("pacificEducationSequentialRoleWorkspace");
                if(!current){ workspace.build(roleName); current=get("pacificEducationSequentialRoleWorkspace"); }
                if(current && typeof current.__paceduOpenFinalSignOut==="function" && current.__paceduOpenFinalSignOut()){
                  if(recovery.querySelector("p")) recovery.querySelector("p").textContent="The existing final Sign Out page is open. Confirm Sign Out there only if you want to end this session.";
                }else if(recovery.querySelector("p")){
                  recovery.querySelector("p").textContent="The Sign Out page could not open because the workspace is still recovering. Your registration and saved activity progress have not been deleted. Try Sign In / Reopen Workspace again.";
                }
              }catch(signOutError){
                if(recovery.querySelector("p")) recovery.querySelector("p").textContent="The Sign Out page could not open yet. Your registration and saved activity progress have not been deleted.";
              }
            });
            recovery.appendChild(heading);
            recovery.appendChild(message);
            recovery.appendChild(retry);
            recovery.appendChild(reopen);
            recovery.appendChild(signOut);
            document.body.appendChild(recovery);
          }
          if(recovery){
            recovery.hidden=false;
            recovery.style.setProperty("display","block","important");
            recovery.style.setProperty("visibility","visible","important");
          }
          if(progress) progress.textContent="Registration is saved. The workspace needs recovery; use the visible Retry Open Workspace control.";
          speak("Your registration is saved. The workspace needs recovery. Press Retry Open Workspace.");
          return;
        }
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
      /* Country is the first registration sub-step. Return directly to Rules
         through the single navigation controller; clicking Rules' own Back
         would incorrectly send the user to Vision. */
      var navigation=window.PacificEducationSingleNavigation;
      if(navigation && typeof navigation.gateway==="function"){
        navigation.gateway(3);
        return;
      }
      progress.textContent="Rules & Conditions could not be opened. Please reload the pilot page.";
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
        /* Enable Next synchronously after the capture handler records the selected role.
           Otherwise a fast second tap can race the deferred UI refresh and hit a stale
           disabled button even though the role has already been selected. */
        if(state===2) next.disabled=!selectedRole();
        /* Let the existing registration listener finish, then refresh the remaining UI. */
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
