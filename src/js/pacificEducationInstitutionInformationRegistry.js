/* Pacific Education — Institution Information Registry.
 * Controlled pilot prototype. Central advisory registry for institution-defined
 * information. It never auto-deletes, merges, or overrides an institution decision.
 */
(function(window,document){
"use strict";
var KEY="pacificEducationInstitutionInformationRegistryV1";
var TYPES=["academicUnit","level","programme","course","attendanceRule","assessment","grading","credit","examination","academicIntegrity"];
var state={entries:[],decisions:[]};
function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
function norm(v){return clean(v).toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ");}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&typeof x==="object"){state=x;state.entries=Array.isArray(x.entries)?x.entries:[];state.decisions=Array.isArray(x.decisions)?x.decisions:[];}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}document.dispatchEvent(new CustomEvent("pacificEducationInstitutionRegistryChanged",{detail:state}));}
function similarity(a,b){a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;var A=a.split(" "),B=b.split(" "),hit=A.filter(function(x){return B.indexOf(x)>=0;}).length;return hit/Math.max(A.length,B.length);}
function check(type,value){value=clean(value);if(!value)return{status:"empty",matches:[]};var matches=state.entries.filter(function(e){return e.type===type||similarity(e.value,value)>=.5;}).map(function(e){return{id:e.id,type:e.type,value:e.value,context:e.context||"",score:similarity(e.value,value),kind:norm(e.value)===norm(value)?"exact":"similar"};}).filter(function(e){return e.score>=.5;}).sort(function(a,b){return b.score-a.score;});return{status:matches.length?(matches[0].kind==="exact"?"duplicate":"similar"):"new",matches:matches};}
function register(type,value,context,decision){if(TYPES.indexOf(type)<0)throw new Error("Unsupported registry type");var advice=check(type,value);var entry={id:"IR-"+Date.now(),type:type,value:clean(value),context:clean(context),createdAt:new Date().toISOString()};if(advice.status!=="new"&&!decision)return{saved:false,advice:advice,entry:entry};state.entries.push(entry);if(decision)state.decisions.push({at:new Date().toISOString(),decision:clean(decision),entry:entry,advice:advice});save();return{saved:true,advice:advice,entry:entry};}
function decide(advice,decision){state.decisions.push({at:new Date().toISOString(),decision:clean(decision),advice:advice});save();}
function render(){var app=document.getElementById("app");if(!app)return;var s=document.getElementById("pacificEducationInstitutionInformationRegistry");if(!s){s=document.createElement("section");s.id="pacificEducationInstitutionInformationRegistry";s.setAttribute("aria-label","Institution Information Registry");s.innerHTML="<h2>Institution Information Registry</h2><p><strong>Central advisory registry:</strong> Institution-defined information is checked before registration. Exact duplicates and potentially similar entries are flagged for administrator review. The institution decides whether to use existing information, edit it, keep entries separate, or create a new entry.</p><div id=\"pacificEducationRegistrySummary\"></div>";app.appendChild(s);}document.getElementById("pacificEducationRegistrySummary").innerHTML="<p><strong>Registered information:</strong> "+state.entries.length+" • <strong>Administrator decisions:</strong> "+state.decisions.length+"</p><p>Categories: "+TYPES.join(", ")+"</p>";}
load();
window.PacificEducationInstitutionInformationRegistry={load:load,save:save,check:check,register:register,decide:decide,getState:function(){return JSON.parse(JSON.stringify(state));},render:render};
document.addEventListener("DOMContentLoaded",render);
})(window,document);
