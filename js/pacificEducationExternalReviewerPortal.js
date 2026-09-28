/* Pacific Education — External Reviewer Portal
 * Authenticated in-app channel for independent professionals to register,
 * sign in, request reviewer verification, and submit review comments.
 * Comments are evidence candidates only; they never authorize production.
 */
(function(window, document){
  "use strict";
  var VERSION="1.0.0";
  var ROLE="external_reviewer";

  function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");}
  function getFirebase(){return window.PacificEducationFirebase||null;}
  function getReviewRegistry(){return window.PacificEducationExternalSpecialistReviewEvidenceRegistry||null;}
  function getRequestRegistry(){return window.PacificEducationProductionIndependentReviewRequest||null;}

  function render(){
    var app=document.getElementById("app");
    if(!app||document.getElementById("pacificEducationExternalReviewerPortal"))return;
    var section=document.createElement("section");
    section.id="pacificEducationExternalReviewerPortal";
    section.setAttribute("aria-label","External professional review portal");
    section.innerHTML=
      "<h2>External Professional Review Portal</h2>"+
      "<p>Independent professionals can use their Pacific Education account to register, sign in and submit assessment comments. A reviewer account does not grant production approval.</p>"+
      "<div id=\"externalReviewerAuthState\" aria-live=\"polite\">Checking account...</div>"+
      "<label for=\"externalReviewerName\">Professional name/reference</label><br>"+
      "<input id=\"externalReviewerName\" type=\"text\" autocomplete=\"name\" style=\"width:100%;max-width:520px;\"><br>"+
      "<label for=\"externalReviewerScope\">Review area</label><br>"+
      "<select id=\"externalReviewerScope\"><option value=\"curriculum\">Curriculum</option><option value=\"assessment\">Assessment</option><option value=\"cybersecurity\">Cybersecurity</option><option value=\"privacy\">Privacy</option><option value=\"safeguarding\">Child safeguarding</option><option value=\"accessibility\">Accessibility</option><option value=\"general-production\">General production review</option></select><br>"+
      "<button type=\"button\" id=\"externalReviewerRequest\">Request reviewer verification</button>"+
      "<div id=\"externalReviewerRequestStatus\" aria-live=\"polite\"></div>"+
      "<hr>"+
      "<label for=\"externalReviewerComment\">Professional assessment comment</label><br>"+
      "<textarea id=\"externalReviewerComment\" rows=\"6\" style=\"width:100%;max-width:760px;\" placeholder=\"Record a factual finding, recommendation, test result or correction required...\"></textarea><br>"+
      "<button type=\"button\" id=\"externalReviewerSubmit\">Submit assessment comment</button>"+
      "<div id=\"externalReviewerCommentStatus\" aria-live=\"polite\"></div>"+
      "<p><strong>Review boundary:</strong> submitted comments remain non-authorizing evidence until an independently verified reviewer and authorized release process accept them.</p>";
    app.insertBefore(section,document.getElementById("dailyLesson"));

    var fb=getFirebase();
    var state=document.getElementById("externalReviewerAuthState");
    if(!fb||typeof fb.observeAuthState!=="function"){
      state.textContent="Account service is not available on this build.";
      return;
    }
    fb.observeAuthState(function(user){
      state.textContent=user?"Signed in as "+(user.email||"authenticated account")+". Reviewer verification can be requested below.":"Sign in or create a Pacific Education account first.";
    });

    document.getElementById("externalReviewerRequest").addEventListener("click",requestVerification);
    document.getElementById("externalReviewerSubmit").addEventListener("click",submitComment);
  }

  async function requestVerification(){
    var fb=getFirebase(), req=getRequestRegistry();
    var status=document.getElementById("externalReviewerRequestStatus");
    var user=fb&&fb.auth?fb.auth.currentUser:null;
    var name=(document.getElementById("externalReviewerName").value||"").trim();
    var scope=document.getElementById("externalReviewerScope").value;
    if(!user||!user.uid){status.textContent="Please sign in first.";return;}
    if(!name){status.textContent="Enter your professional name/reference.";return;}
    if(!req||typeof req.request!=="function"){status.textContent="Review request service is unavailable.";return;}
    var result=req.request({scope:scope,requesterReference:user.uid,notes:"Professional reference: "+name+"; role: "+ROLE});
    status.textContent=result.ok?"Reviewer verification request recorded: "+result.request.id:"Request failed: "+result.error;
  }

  async function submitComment(){
    var fb=getFirebase(), registry=getReviewRegistry();
    var status=document.getElementById("externalReviewerCommentStatus");
    var user=fb&&fb.auth?fb.auth.currentUser:null;
    var comment=(document.getElementById("externalReviewerComment").value||"").trim();
    var name=(document.getElementById("externalReviewerName").value||"").trim();
    var scope=document.getElementById("externalReviewerScope").value;
    if(!user||!user.uid){status.textContent="Please sign in first.";return;}
    if(!comment){status.textContent="Enter an assessment comment.";return;}
    try{
      if(fb&&typeof fb.submitPilotFeedback==="function"){
        await fb.submitPilotFeedback({message:comment,category:"external-specialist-review:"+scope});
      }
      var result=null;
      if(registry&&typeof registry.register==="function"){
        result=registry.register({reviewRequestId:"ACCOUNT-"+user.uid,reviewerReference:name||user.uid,evidenceReference:"FIREBASE-FEEDBACK",type:"finding",finding:comment,notes:"Submitted by authenticated account; independent reviewer verification still required."});
      }
      document.getElementById("externalReviewerComment").value="";
      status.textContent=result&&result.ok?"Assessment comment submitted for review evidence. It does not authorize production.":"Assessment comment submitted to the authenticated review channel.";
    }catch(error){status.textContent="Submission failed: "+(error.code||error.message);}
  }

  window.PacificEducationExternalReviewerPortal={version:VERSION,role:ROLE,render:render};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})(window,document);
