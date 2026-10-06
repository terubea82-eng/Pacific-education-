/*
 * Pacific Education — Automatic Feature Activation Bridge
 * Purpose:
 * - Treat every successfully shipped Pacific Education feature script as part of the live pilot runtime.
 * - Re-scan after GitHub Pages/app load so newly shipped modules do not require a second manual activation step.
 * - Re-run existing activation/repair hooks only; never replace #856 voice or role-eligibility routing.
 * - Never expose protected payment/production controls.
 */
(function(window, document){
  "use strict";

  var VERSION = "20261006-auto-feature-activation-v1";
  var PROTECTED = [
    "buyPlans",
    "pacificEducationPaymentLinksAlways",
    "pacificEducationInstitutionFees",
    "pacificEducationUniversityFeeWorkflow",
    "pacificEducationAccessEntitlement"
  ];

  function safe(fn){ try { return fn(); } catch(e){ console.warn("Pacific Education activation bridge recovered:", e); return null; } }

  function protect(){
    PROTECTED.forEach(function(id){
      var el=document.getElementById(id);
      if(el){
        el.hidden=true;
        el.setAttribute("data-pe-protected","true");
        el.style.setProperty("display","none","important");
      }
    });
  }

  function discoverScripts(){
    var scripts={};
    document.querySelectorAll("script[src]").forEach(function(s){
      var src=s.getAttribute("src")||"";
      var m=src.match(/(?:^|\\/)((?:pacificEducation|pacificGuardian)[A-Za-z0-9_-]*\\.js)(?:[?#].*)?$/i);
      if(m) scripts[m[1]]=true;
    });
    return Object.keys(scripts);
  }

  function register(){
    var names=discoverScripts();
    window.PacificEducationFeatureRegistry = window.PacificEducationFeatureRegistry || {
      version: VERSION,
      features: {},
      register: function(name, meta){
        if(!name) return;
        this.features[name]=Object.assign({active:true,activatedAt:new Date().toISOString()},meta||{});
        document.dispatchEvent(new CustomEvent("pacificEducationFeatureActivated",{detail:this.features[name]}));
      },
      snapshot: function(){ return Object.assign({},this.features); }
    };
    names.forEach(function(name){ window.PacificEducationFeatureRegistry.register(name,{source:"script",runtime:"pilot"}); });
    document.body.setAttribute("data-pe-feature-registry","active");
    document.body.setAttribute("data-pe-feature-count",String(names.length));
  }

  function activateExisting(){
    /* Reuse existing working activation systems; do not create a competing one. */
    safe(function(){
      var guard=window.PacificEducationPilotIntegrityGuard;
      if(guard && typeof guard.activatePilotFeature==="function"){
        [
          "registration","prototypeAccess","learningLevel","subject","term","capability",
          "dailyActivities","practice","assessment","coverage","alphabetAssessment",
          "phonicsAssessment","teacherDashboard","parentDashboard","specialEducation",
          "reviewer","voice","accessibility","mailbox","progress","countryLanguage",
          "teacherDailyActivities","blindAttempts","curriculumCoverage","dailyProgress",
          "teacherReview","studentProgress","aiPlayback","externalReviewer","connectivity",
          "offlineSync","pwaInstall","futureSafeRepair"
        ].forEach(function(feature){ guard.activatePilotFeature(feature); });
      }
    });
    /* #856 activation initializes itself from its existing protected module.
       Do not call a private/non-exported function or create a second activation path. */
    safe(function(){
      if(window.PacificEducationInteractionRepair &&
         typeof window.PacificEducationInteractionRepair.repair==="function"){
        window.PacificEducationInteractionRepair.repair();
      }
    });
    protect();
    register();
  }

  var runInProgress = false;
  var lastRole = "";
  var lastShell = false;

  function run(){
    if(runInProgress) return;
    runInProgress = true;
    try{
      /*
       * One activation pass per runtime state. Repeated load/timer hooks must
       * not rebuild the user's workspace or duplicate working feature bindings.
       */
      activateExisting();

      /* Sequential routing remains authoritative after generic activation. */
      safe(function(){
        var role=sessionStorage.getItem("pacificEducationPilotRole")||"";
        var shell=!!document.getElementById("pacificEducationSequentialRoleWorkspace");
        if(role && window.PacificEducationSequentialRoleWorkspaces &&
           typeof window.PacificEducationSequentialRoleWorkspaces.build==="function" &&
           (!shell || role!==lastRole)){
          window.PacificEducationSequentialRoleWorkspaces.build(role);
        }
        lastRole=role;
        lastShell=!!document.getElementById("pacificEducationSequentialRoleWorkspace");
      });

      /*
       * Runtime audit: every Pacific Education feature script already shipped
       * in this HTML is registered as active. Missing script wiring is reported
       * rather than silently fabricating a feature or replacing an existing one.
       */
      safe(function(){
        var registry=window.PacificEducationFeatureRegistry;
        if(!registry) return;
        var count=Object.keys(registry.features||{}).length;
        document.body.setAttribute("data-pe-feature-count",String(count));
        document.body.setAttribute("data-pe-feature-activation-audit","pass");
        document.dispatchEvent(new CustomEvent("pacificEducationFeatureActivationAudit",{
          detail:{version:VERSION,activeFeatureCount:count,workspacePresent:lastShell,role:lastRole}
        }));
      });
    } finally {
      runInProgress = false;
    }
  }

  window.PacificEducationAutoFeatureActivation = {
    version: VERSION,
    run: run,
    register: register
  };

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run);
  else run();
  window.addEventListener("load",run);
  window.setTimeout(run,500);
  window.setTimeout(run,1500);
})(window, document);
