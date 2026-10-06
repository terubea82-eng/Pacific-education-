/* Pacific Education — Deaf Learner registration and accessibility guide. */
(function(window,document){
  "use strict";
  function init(){
    var app=document.getElementById("app");
    if(!app||document.getElementById("deafLearnerRegistrationGuide")) return;

    var guide=document.createElement("section");
    guide.id="deafLearnerRegistrationGuide";
    guide.setAttribute("aria-label","Deaf Learner Registration Guide");
    guide.style.cssText="margin:12px 0;padding:16px;border:3px solid #15803d;border-radius:10px;";
    guide.innerHTML='<h2>🤟 Deaf Learner Registration Guide</h2><p><strong>Visual-first access is active.</strong> No speaking is required to register, navigate, complete Daily Activities or submit formal assessments.</p><ol><li><strong>Choose Country</strong> — select your country.</li><li><strong>Choose Language</strong> — select your preferred language or available Sign Language option.</li><li><strong>Open User Registration</strong> — choose <strong>Deaf Learner</strong>.</li><li><strong>Enter Registration Details</strong> — use text fields.</li><li><strong>Choose Accessibility Preferences</strong> — captions, visual instructions, sign language and visual notifications.</li><li><strong>Complete Registration &amp; Open My Workspace</strong> — the learner is transferred automatically.</li></ol><p id="deafLearnerGuideStatus" role="status" aria-live="polite">Registration guide ready.</p>';
    app.insertBefore(guide,document.getElementById("pacificEducationPilotUserWorkspaces")||null);

    var pref=document.createElement("section");
    pref.id="deafLearnerAccessibility";
    pref.setAttribute("aria-label","Deaf Learner Accessibility Preferences");
    pref.style.cssText="margin:12px 0;padding:16px;border:2px solid #15803d;border-radius:10px;";
    pref.innerHTML='<h3>🤟 Deaf Learner Accessibility Preferences</h3><label><input type="checkbox" id="deafCaptions" checked> 📝 Captions</label><br><label><input type="checkbox" id="deafVisualInstructions" checked> 👁️ Visual instructions</label><br><label><input type="checkbox" id="deafVisualNotifications" checked> 🔔 Visual notifications</label><br><label for="deafSignLanguage"><strong>Preferred Sign Language</strong></label><select id="deafSignLanguage" style="width:100%;margin-top:8px;padding:10px;"><option value="">Select Sign Language</option><option value="Auslan">Auslan</option><option value="Fiji Sign Language">Fiji Sign Language</option><option value="NZSL">New Zealand Sign Language</option><option value="ASL">American Sign Language</option><option value="Other">Other / Not listed</option></select><p id="deafAccessibilityStatus" role="status" aria-live="polite">Visual accessibility preferences are ready.</p>';

    app.insertBefore(pref,document.getElementById("pacificEducationPilotUserWorkspaces")||null);

    ["deafCaptions","deafVisualInstructions","deafVisualNotifications","deafSignLanguage"].forEach(function(id){
      var el=document.getElementById(id);
      if(!el)return;
      el.addEventListener("change",function(){
        try{
          localStorage.setItem("pacificEducationDeafAccessibilityV1",JSON.stringify({
            captions:document.getElementById("deafCaptions").checked,
            visualInstructions:document.getElementById("deafVisualInstructions").checked,
            visualNotifications:document.getElementById("deafVisualNotifications").checked,
            signLanguage:document.getElementById("deafSignLanguage").value
          }));
        }catch(e){}
        var st=document.getElementById("deafAccessibilityStatus");
        if(st)st.textContent="Accessibility preference saved for this pilot browser.";
      });
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
