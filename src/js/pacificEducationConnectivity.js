/* PACIFIC EDUCATION — CONNECTIVITY / OFFLINE-FIRST COORDINATION
 * Pilot web/PWA layer. It never bypasses carrier billing or access controls.
 * A carrier-approved tunnel remains an external/native integration boundary.
 */
(function(window, document){
"use strict";
var KEY="pacificEducationConnectivityState";
function read(){try{var v=JSON.parse(localStorage.getItem(KEY)||"{}");return v&&typeof v==="object"?v:{};}catch(e){return{};}}
function save(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
function render(v){
 var host=document.getElementById("pacificEducationConnectivityStatus");
 if(!host){host=document.createElement("section");host.id="pacificEducationConnectivityStatus";host.setAttribute("aria-label","Pacific Education connectivity");host.style.cssText="margin:12px 0;padding:12px;border:1px solid #ccc;border-radius:8px";
  var anchor=document.getElementById("pacificEducationAppMenu")||document.body.firstElementChild;
  if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(host,anchor.nextSibling);else document.body.prepend(host);}
 var label=v.state==="offline"?"Offline learning":(v.state==="online"?"Online":"Connecting");
 host.innerHTML="<strong>Pacific Education connection:</strong> "+label+"<br><small>Offline-first: Yes · Learning continues: Yes · App-scoped tunnel design: Yes</small>";
}
function detect(){var v=read();v.state=navigator.onLine?"online":"offline";v.updatedAt=new Date().toISOString();v.offlineFirst=true;v.learningShouldContinue=true;v.appScopedTunnel=true;v.zeroRatingRequiresCarrierApproval=true;v.serverOnlyWorkQueued=!navigator.onLine;save(v);render(v);return v;}
function refresh(){var v=detect();try{window.dispatchEvent(new CustomEvent("pacific:connectivity-changed",{detail:v}));}catch(e){}}
window.addEventListener("online",refresh);window.addEventListener("offline",refresh);
window.PacificEducationConnectivity=Object.freeze({name:"PacificEducationConnectivity",version:"1.0.1-pilot",detect:detect,state:function(){return read();}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",detect);else detect();
})(window,document);
