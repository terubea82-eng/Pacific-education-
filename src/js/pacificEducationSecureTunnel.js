/* PACIFIC EDUCATION — SECURE TUNNEL / OFFLINE-FIRST BRIDGE
 * Web/PWA coordination layer. The actual Android VPN is implemented by
 * the native VpnService and requires an approved carrier/tunnel endpoint.
 * This client never attempts to bypass carrier billing or access controls.
 */
(function(window, document){
"use strict";
var KEY="pacificEducationSecureTunnelState";
function read(){try{var v=JSON.parse(localStorage.getItem(KEY)||"{}");return v&&typeof v==="object"?v:{};}catch(e){return{};}}
function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
function detect(){
 var online=navigator.onLine,native=window.AndroidPacificEducationTunnel;
 var state=online?(native&&native.state==="secure-tunnel"?"secure-tunnel":"online"):"offline";
 var current=read(); current.state=state; current.updatedAt=new Date().toISOString();
 current.appScoped=true; current.carrierApprovedZeroRatingRequired=true;
 current.offlineFirst=true; current.serverOnlyWorkQueued=!online; write(current); render(current); return current;
}
function render(s){
 var host=document.getElementById("pacificEducationConnectivityStatus");
 if(!host){host=document.createElement("section");host.id="pacificEducationConnectivityStatus";host.setAttribute("aria-label","Pacific Education connectivity");host.style.cssText="margin:12px 0;padding:12px;border:1px solid #ccc;border-radius:8px";
  var anchor=document.getElementById("pacificEducationAppMenu")||document.body.firstElementChild;
  if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(host,anchor.nextSibling);else document.body.prepend(host);
 }
 var labels={"online":"Online","secure-tunnel":"Secure Tunnel","offline":"Offline learning","syncing":"Syncing","recovered":"Connection recovered"};
 host.innerHTML="<strong>Pacific Education connection:</strong> "+(labels[s.state]||"Checking")+"<br><small>App-scoped tunnel: "+(s.appScoped?"Yes":"No")+" · Offline-first: "+(s.offlineFirst?"Yes":"No")+"</small>";
}
function on(){var s=detect();window.dispatchEvent(new CustomEvent("pacific:connectivity-changed",{detail:s}));}
window.addEventListener("online",on);window.addEventListener("offline",on);
window.PacificEducationSecureTunnel=Object.freeze({
 name:"PacificEducationSecureTunnel",version:"1.0.0-pilot",detect:detect,state:function(){return read();},
 requestNativeStart:function(){var n=window.AndroidPacificEducationTunnel;if(n&&typeof n.requestStart==="function")return n.requestStart();return {started:false,reason:"NATIVE_TUNNEL_ENDPOINT_REQUIRED",prototype:true};}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",detect);else detect();
})(window, document);
