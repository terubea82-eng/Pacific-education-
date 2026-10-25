/* PacEdu automatic current-date helper.
 * Keep the date on the learner's daily activity only. Page-specific spoken
 * instructions are supplied by pacificEducationEveryPageVoiceRepair.js so a
 * second instruction box does not clutter the learner or teacher workspace.
 * Device date never overwrites the teacher's school calendar.
 */
(function(window,document){
 "use strict";
 var dateNode=null;
 function localDate(){
  var d=new Date();
  try{return new Intl.DateTimeFormat(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(d);}
  catch(e){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
 }
 function visible(el){
  if(!el)return false;
  for(var n=el;n&&n.nodeType===1;n=n.parentElement){
   if(n.hidden||n.getAttribute("aria-hidden")==="true")return false;
   var s=window.getComputedStyle?window.getComputedStyle(n):null;
   if(s&&(s.display==="none"||s.visibility==="hidden"||s.visibility==="collapse"))return false;
  }
  return true;
 }
 function ensureDate(){
  var daily=document.getElementById("dailyLesson");
  if(!daily||!visible(daily)){
   if(dateNode){
    dateNode.hidden=true;
    if(dateNode.parentNode)dateNode.parentNode.removeChild(dateNode);
   }
   return;
  }
  if(!dateNode){
   dateNode=document.getElementById("paceduAutomaticToday");
   if(!dateNode){
    dateNode=document.createElement("p");
    dateNode.id="paceduAutomaticToday";
    dateNode.setAttribute("role","status");
    dateNode.style.cssText="margin:8px 0;padding:8px 12px;max-width:960px;border-radius:8px;background:#eef5ff;color:#183153;font-size:1rem;font-weight:600;";
   }
  }
  dateNode.textContent="Today: "+localDate();
  dateNode.title="Date comes from this device. School calendar dates are set separately by your teacher.";
  dateNode.hidden=false;
  if(dateNode.parentNode!==daily)daily.insertBefore(dateNode,daily.firstChild);
 }
 function removeExtraHelpBox(){
  var help=document.getElementById("paceduSimplePageHelp");
  if(help&&help.parentNode)help.parentNode.removeChild(help);
 }
 function init(){
  removeExtraHelpBox();
  ensureDate();
  if(window.MutationObserver&&document.body){
   var observer=new MutationObserver(function(){removeExtraHelpBox();ensureDate();});
   observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","aria-hidden","style","class","data-pe-flow-step"]});
  }
  window.setInterval(ensureDate,60000);
  window.addEventListener("pageshow",ensureDate);
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")ensureDate();});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window,document);
