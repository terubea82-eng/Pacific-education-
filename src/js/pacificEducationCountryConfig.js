(function(window,document){"use strict";
var defaults={country:"Fiji",educationAuthority:"Ministry of Education",language:"English",currency:"FJD",levelSystem:"National system",termSystem:"National system",nationalExamName:"National examinations"};
var state=Object.assign({},defaults);
function clean(v){return String(v||"").replace(/\s+/g," ").trim();}
function load(config){config=config||{};Object.keys(defaults).forEach(function(k){if(config[k]!==undefined&&clean(config[k]))state[k]=clean(config[k]);});render();return getState();}
function getState(){return JSON.parse(JSON.stringify(state));}
function ensureUI(){
 var app=document.getElementById("app");if(!app||document.getElementById("pacificEducationCountrySettings"))return;
 var s=document.createElement("section");s.id="pacificEducationCountrySettings";s.hidden=true;
 s.innerHTML="<h2>Country & Education System</h2><p>Pacific Education is adaptable by country. Each country uses its own education authority, curriculum, levels, terms, examinations, language and local settings.</p><p><strong>International mapping:</strong> National education structures remain authoritative; optional UNESCO ISCED mapping can provide a common cross-country reference without replacing national terminology.</p><div id="pacificEducationCountrySettingsSummary"></div>";
 app.appendChild(s);
}
function render(){ensureUI();var e=document.getElementById("pacificEducationCountrySettingsSummary");if(e)e.innerHTML="<p><strong>Country:</strong> "+esc(state.country)+"</p><p><strong>Education authority:</strong> "+esc(state.educationAuthority)+"</p><p><strong>Language:</strong> "+esc(state.language)+"</p><p><strong>Currency:</strong> "+esc(state.currency)+"</p><p><strong>Level system:</strong> "+esc(state.levelSystem)+"</p><p><strong>Term system:</strong> "+esc(state.termSystem)+"</p><p><strong>National examination name:</strong> "+esc(state.nationalExamName)+"</p>";}
function esc(v){return String(v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
window.PacificEducationCountryConfig={load:load,getState:getState,render:render,defaults:function(){return JSON.parse(JSON.stringify(defaults));}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUI);else ensureUI();
})(window,document);