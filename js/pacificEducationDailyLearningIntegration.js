/*
 * Pacific Education — Daily Learning Integration
 * Version: 1.1.1
 *
 * Adds a Guardian-controlled current-events learning layer. News is used as
 * educational context, not as unreviewed curriculum. Sensitive stories must
 * remain age-appropriate and teacher-reviewable.
 */
(function () {
  "use strict";

  const VERSION = "1.1.1";
  let contextFeed = [
    { date:"2026-09-28", region:"Fiji", title:"Fiji sets a new long-term education direction", summary:"Fiji's Education Sector Strategic Plan for 2025/2026–2034/2035 has been endorsed, providing a current opportunity to learn about planning, goals, measurement and how education systems are developed.", learningAreas:["civics","social_studies","planning","literacy"], activity:"Read the short summary, identify three education goals a country might measure, and explain why evidence matters.", source:"FBC News", sourceUrl:"https://www.fbcnews.com.fj/section/news/education/", sensitivity:"general" },
    { date:"2026-09-23", region:"Fiji", title:"Fiji Education Commission report handed over", summary:"The Fiji Education Commission completed a comprehensive review and formally handed its 2026 report to the Minister for Education. The Ministry said it would consider the recommendations.", learningAreas:["civics","research","critical_reading","writing"], activity:"Explain the difference between evidence, a recommendation and a decision. Write three questions you would ask when reviewing an education report.", source:"FBC News", sourceUrl:"https://www.fbcnews.com.fj/news/education/education-commission-report-handed-over/", sensitivity:"general" },
    { date:"2026-09-17", region:"Fiji", title:"AI policy for schools is being prepared for consultation", summary:"Fiji's Ministry of Education is preparing an AI policy for consultation as AI use grows in education. This provides a real-world opportunity to learn about responsible technology use, plagiarism and human judgment.", learningAreas:["digital_literacy","ethics","writing","critical_thinking"], activity:"List two useful ways AI could support learning and two reasons a teacher should still review important work.", source:"Fiji Sun", sourceUrl:"https://fijisun.com.fj/news/nation/ministry-drafts-ai-policy-to-guide-usage-in-schools", sensitivity:"general" },
    { date:"2026-09-09", region:"Pacific", title:"New Pacific literacy and numeracy evidence", summary:"The Pacific Islands Literacy and Numeracy Assessment 2025 regional report provides current evidence about literacy and numeracy learning across Pacific countries.", learningAreas:["numeracy","literacy","data_interpretation","geography"], activity:"Ask what a regional assessment measures, how results can be compared fairly, and what additional evidence teachers may need.", source:"Pacific Community reporting", sourceUrl:"https://islandsbusiness.com/partner-news/new-report-shows-learning-gains-across-the-pacific-but-continued-action-needed/", sensitivity:"general" },
    { date:"2026-09-23", region:"World", title:"Education recovery after floods in Nepal", summary:"UNICEF reported efforts to restore education in Nepal after floods. The story can support learning about disaster preparedness, community recovery and continuity of education.", learningAreas:["geography","science","disaster_preparedness","community_service"], activity:"Design a simple school continuity plan for a flood: safe place, learning materials, communication and one way students can help.", source:"UNICEF", sourceUrl:"https://www.unicef.org/education", sensitivity:"general" },
    { date:"2026-09-21", region:"World", title:"Students return to in-person schooling in Gaza", summary:"Reuters reported that students in Gaza returned to in-person schooling amid severe damage to education infrastructure. This can be used only with age-appropriate safeguarding and teacher guidance.", learningAreas:["humanitarian_education","civics","resilience"], activity:"For an age-appropriate lesson, discuss why safe access to education matters and identify practical ways communities can protect learning during disruption.", source:"Reuters", sourceUrl:"https://www.reuters.com/world/middle-east/gaza-students-return-in-person-schooling-first-time-three-years-2026-09-21/", sensitivity:"teacher_review_required" }
  ];

  function getCore(){ return window.PacificEducationCore || null; }
  function isAuthorized(){ const core=getCore(); return !!(core&&core.identity&&typeof core.identity.isAuthorized==="function"&&core.identity.isAuthorized()); }
  function createCheck(check){ const core=getCore(); if(!core||!isAuthorized()||!core.dailyLearningCheck||typeof core.dailyLearningCheck.create!=="function"||!check||typeof check!=="object") return false; return core.dailyLearningCheck.create(check); }
  function recordCheck(result){ const core=getCore(); if(!core||!isAuthorized()||!core.dailyLearningCheck||typeof core.dailyLearningCheck.record!=="function"||!result||typeof result!=="object") return false; return core.dailyLearningCheck.record(result); }
  function start(){ const core=getCore(); if(!core||!isAuthorized()) return {success:false,reason:"authorization_required"}; if(!core.dailyLearningCheck||typeof core.dailyLearningCheck.start!=="function") return {success:false,reason:"daily_learning_check_unavailable"}; return core.dailyLearningCheck.start(); }
  function getCurrentContext(){ return contextFeed[0]||null; }
  function getContextFeed(){ return contextFeed.slice(); }
  function setContextFeed(entries){ if(!Array.isArray(entries)) return {success:false,reason:"invalid_feed"}; contextFeed=entries.filter(function(item){return item&&item.title&&item.summary&&item.activity&&item.date;}).slice(0,30); return {success:true,count:contextFeed.length}; }
  function escapeHtml(value){ return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;"); }
  function renderContext(containerId){
    const container=document.getElementById(containerId||"dailyLesson"); const item=getCurrentContext(); if(!container||!item) return false;
    let old=document.getElementById("pacificDailyCurrentEventsContext"); if(old) old.remove();
    const section=document.createElement("section"); section.id="pacificDailyCurrentEventsContext"; section.setAttribute("aria-label","Current events learning context"); section.style.marginTop="1rem"; section.style.padding="1rem"; section.style.border="1px solid #888";
    section.innerHTML="<h3>Today's Learning from the World</h3><p><strong>"+escapeHtml(item.region)+" — "+escapeHtml(item.title)+"</strong></p><p>"+escapeHtml(item.summary)+"</p><p><strong>Activity:</strong> "+escapeHtml(item.activity)+"</p><p><small>Source: "+escapeHtml(item.source)+" • "+escapeHtml(item.date)+(item.sensitivity==="teacher_review_required"?" • Teacher review required":"")+"</small></p>";
    container.appendChild(section); return true;
  }
  function initialiseContext(){ if(document.getElementById("dailyLesson")) renderContext("dailyLesson"); }

  window.PacificEducationDailyLearningIntegration={version:VERSION,isAuthorized,createCheck,recordCheck,start,getCurrentContext,getContextFeed,setContextFeed,renderContext};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initialiseContext); else initialiseContext();
})();
