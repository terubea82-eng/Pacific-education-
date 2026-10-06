/* Pacific Education — Future-safe feature/link repair layer
 * Additive only: creates missing pilot UI targets and links; never enables payments,
 * production entitlement, or replaces the protected #856 voice controller.
 * Future adjustments should extend FEATURE_TARGETS rather than rewriting core flow.
 */
(function(window, document){
  "use strict";
  var VERSION="1.0.0-future-safe-links";
  var PROTECTED={
    buyPlans:true,
    pacificEducationPaymentLinksAlways:true,
    pacificEducationInstitutionFees:true,
    pacificEducationUniversityFeeWorkflow:true,
    pacificEducationAccessEntitlement:true
  };
  var FEATURE_TARGETS=[
    {id:"pacificEducationCurrentAffairs",title:"📰 Educational Current Affairs",text:"Educational current affairs are loaded from the pilot curriculum feed. Items remain pending teacher/reviewer verification before they are treated as approved learning content."},
    {id:"pacificEducationExternalReviewerPortal",title:"🔎 External Professional Review Portal",text:"Independent professional review is evidence only. Reviewer activity does not authorize production release."}
  ];

  function el(id){return document.getElementById(id);}
  function speak(text){
    try{
      if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function"){
        window.PacificEducationSpeech.speakText(text); return;
      }
    }catch(_){}
  }
  function ensureFeatureTargets(){
    var app=el("app"); if(!app)return;
    FEATURE_TARGETS.forEach(function(item){
      if(PROTECTED[item.id])return;
      var section=el(item.id);
      if(!section){
        section=document.createElement("section");
        section.id=item.id;
        section.setAttribute("data-pe-future-safe","true");
        section.setAttribute("aria-label",item.title.replace(/^\S+\s*/,""));
        section.innerHTML="<h2>"+item.title+"</h2><p>"+item.text+"</p><div id=\""+item.id+"Status\" role=\"status\" aria-live=\"polite\">Ready for the pilot.</div>";
        app.appendChild(section);
      }
    });
    bindCurrentAffairs();
  }

  function bindCurrentAffairs(){
    var box=el("pacificEducationCurrentAffairs"), status=el("pacificEducationCurrentAffairsStatus");
    if(!box||box.getAttribute("data-pe-current-affairs-bound")==="true")return;
    box.setAttribute("data-pe-current-affairs-bound","true");
    function refresh(){
      var cfg=window.PacificEducationCountryConfig;
      var count=0;
      try{
        if(cfg&&typeof cfg.getEducationalCurrentAffairs==="function"){
          var data=cfg.getEducationalCurrentAffairs();
          count=Array.isArray(data)?data.length:(data&&Array.isArray(data.items)?data.items.length:0);
        }
      }catch(_){}
      if(status)status.textContent=count
        ?"Current Affairs is linked to the registered curriculum space. "+count+" item(s) are available; teacher/reviewer verification remains required."
        :"Current Affairs box is active. Waiting for the curriculum feed.";
    }
    document.addEventListener("pacificEducationCurrentAffairsLoaded",refresh);
    refresh();
  }

  function ensureReviewerScript(){
    /* The reviewer module is loaded explicitly by index.html; this is only a
       recovery hook if a future page removes that script accidentally. */
    if(window.PacificEducationExternalReviewerPortal&&typeof window.PacificEducationExternalReviewerPortal.render==="function"){
      window.PacificEducationExternalReviewerPortal.render();
    }
  }

  function ensureWorkspaceSignOut(){
    var ws=el("pacificEducationPilotUserWorkspaces");
    if(!ws||el("pacificEducationWorkspaceSignOut"))return;
    var section=document.createElement("section");
    section.id="pacificEducationWorkspaceSignOut";
    section.setAttribute("aria-label","Sign out");
    section.setAttribute("data-pe-future-safe","true");
    section.style.cssText="margin-top:24px;padding:16px;border-top:2px solid currentColor;";
    section.innerHTML="<h4>Finish this workspace session</h4>"+
      "<button type=\"button\" id=\"pacificEducationSignOutButton\" style=\"display:block;width:100%;max-width:520px;padding:14px 16px;font-size:1.05em;font-weight:700;border:2px solid currentColor;border-radius:8px;\">🔴 Sign Out</button>"+
      "<div id=\"pacificEducationSignOutConfirm\" hidden style=\"margin-top:12px;padding:12px;border:2px solid currentColor;border-radius:8px;\"><p><strong>Are you sure you want to sign out?</strong> Saved pilot learning and evidence records will not be deleted.</p>"+
      "<button type=\"button\" id=\"pacificEducationSignOutYes\" style=\"margin-right:8px;padding:10px 14px;\">✓ Confirm Sign Out</button>"+
      "<button type=\"button\" id=\"pacificEducationSignOutNo\" style=\"padding:10px 14px;\">Cancel</button></div>"+
      "<p id=\"pacificEducationSignOutStatus\" role=\"status\" aria-live=\"polite\">Sign Out is available at the bottom of this workspace.</p>";
    ws.appendChild(section);
    var open=el("pacificEducationSignOutButton"), confirm=el("pacificEducationSignOutConfirm");
    var yes=el("pacificEducationSignOutYes"), no=el("pacificEducationSignOutNo"), status=el("pacificEducationSignOutStatus");
    if(open)open.onclick=function(){if(confirm)confirm.hidden=false;speak("Sign Out. Please confirm if you want to finish this workspace session.");};
    if(no)no.onclick=function(){if(confirm)confirm.hidden=true;if(status)status.textContent="Sign Out cancelled.";};
    if(yes)yes.onclick=function(){
      ["pacificEducationPilotRegistration","pacificEducationPilotRole","pacificEducationActiveRole","pacificEducationPilotRegistered"].forEach(function(k){
        try{sessionStorage.removeItem(k);}catch(_){}
        try{localStorage.removeItem(k);}catch(_){}
      });
      if(status)status.textContent="You are signed out. User Registration is ready for the next user.";
      speak("You are signed out. User Registration is ready for the next user.");
      var registration=el("pacificEducationIdentityRegistration");
      ws.hidden=true;
      if(registration){registration.hidden=false;try{registration.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){registration.scrollIntoView();}}
    };
  }

  function addLauncherLinks(){
    var menu=el("pacificEducationAppMenu");
    if(!menu||el("peFutureSafeFeatureLauncher"))return;
    var host=menu.querySelector("details")||menu;
    var details=document.createElement("details");
    details.id="peFutureSafeFeatureLauncher";
    details.style.marginTop="10px";
    details.innerHTML="<summary><strong>Future-safe pilot features</strong></summary><div id=\"peFutureSafeFeatureLinks\" style=\"display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;\"></div>";
    host.appendChild(details);
    var links=el("peFutureSafeFeatureLinks");
    FEATURE_TARGETS.forEach(function(item){
      if(PROTECTED[item.id]||!el(item.id))return;
      var b=document.createElement("button");
      b.type="button"; b.textContent=item.title;
      b.setAttribute("data-pe-future-target",item.id);
      b.onclick=function(){
        var target=el(item.id); if(!target)return;
        document.body.classList.remove("pe-guided-flow");
        document.body.removeAttribute("data-pe-flow-step");
        try{target.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){target.scrollIntoView();}
        speak("Opening "+item.title.replace(/^\S+\s*/,"")+".");
      };
      links.appendChild(b);
    });
  }

  function run(){
    ensureFeatureTargets();
    ensureReviewerScript();
    ensureWorkspaceSignOut();
    addLauncherLinks();
    document.body.setAttribute("data-pe-future-safe-repair",VERSION);
  }

  function observe(){
    run();
    var observer=new MutationObserver(function(){run();});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",observe);else observe();
})(window,document);
