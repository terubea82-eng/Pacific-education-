/* Pacific Education — Daily Educational Current Affairs Loader */
(function(window,document){
  "use strict";
  var VERSION="1.0.0";
  function load(){
    var cfg=window.PacificEducationCountryConfig;
    if(!cfg||typeof cfg.upsertEducationalCurrentAffair!=="function")return Promise.resolve({loaded:0,reason:"Curriculum store unavailable"});
    return fetch("../docs/data/current-affairs.json?v="+Date.now(),{cache:"no-store"}).catch(function(){return fetch("./data/current-affairs.json?v="+Date.now(),{cache:"no-store"});}).then(function(r){if(!r.ok)throw new Error("feed unavailable");return r.json();}).then(function(data){
      var items=Array.isArray(data&&data.items)?data.items:[], count=0;
      items.forEach(function(item){
        if(!item||!item.id||!item.title||!item.url)return;
        var copy=Object.assign({},item);
        // The public feed is an editorial review queue, not publication approval.
        // Never trust legacy approval markers in generated JSON at load time.
        copy.verificationStatus="PENDING_TEACHER_REVIEW";
        copy.levelRecommendationBasis="AUTOMATED_TOPIC_SCREENING_PENDING_TEACHER_REVIEW";
        copy.approved=false;
        copy.sourceType="EDUCATIONAL_CURRENT_AFFAIRS";
        try{cfg.upsertEducationalCurrentAffair(copy);count++;}catch(e){}
      });
      try{localStorage.setItem("pacificEducationCurrentAffairsLastLoaded",new Date().toISOString());}catch(e){}
      document.dispatchEvent(new CustomEvent("pacificEducationCurrentAffairsLoaded",{detail:{count:count,generatedAt:data&&data.generatedAt||null}}));
      return {loaded:count,generatedAt:data&&data.generatedAt||null};
    }).catch(function(e){return {loaded:0,reason:String(e&&e.message||e)};});
  }
  window.PacificEducationCurrentAffairsLoader={version:VERSION,load:load};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load);else load();
})(window,document);
