(function(w,d){
"use strict";
var KEY="pacificEducationRealWorldSkillsV1",state={tracks:[],lastUpdated:null};
var DEFAULT=[
["Communication & teamwork","communication, collaboration, presentation, conflict resolution"],
["Critical thinking & problem solving","research, analysis, decision-making, practical problem solving"],
["Digital & AI literacy","digital safety, information literacy, responsible AI, productivity tools"],
["Entrepreneurship & financial capability","business ideas, budgeting, customer needs, project planning"],
["Workplace readiness","CVs, interviews, professional conduct, time management, workplace communication"],
["Technical & practical skills","institution/programme-specific practical tasks and tools"],
["Green & sustainability skills","resource efficiency, climate action, sustainable practice"],
["Research & innovation","evidence, inquiry, design thinking, innovation and applied research"],
["Leadership & civic/community skills","leadership, service, cultural awareness, community problem solving"],
["Personal & social wellbeing","self-management, resilience, empathy, healthy professional relationships"]];
function load(){try{var x=JSON.parse(localStorage.getItem(KEY)||"{}");if(x&&Array.isArray(x.tracks))state=x;}catch(e){}}
function save(){state.lastUpdated=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));}
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
function render(){var app=d.getElementById("app");if(!app)return;var s=d.getElementById("pacificEducationRealWorldSkills");if(!s){s=d.createElement("section");s.id="pacificEducationRealWorldSkills";s.hidden=true;app.appendChild(s);}
var tracks=state.tracks.length?state.tracks:DEFAULT.map(function(x){return{name:x[0],skills:x[1]};});
s.innerHTML="<h2>Real-World Skills & Applied Learning</h2><p>Institutions can define practical activities connecting academic learning to work, community life, entrepreneurship, digital practice and lifelong learning.</p><p><strong>Mandatory quality rule:</strong> activities supplement the approved curriculum and do not replace accredited curriculum, licensing requirements or official assessments.</p><ul>"+tracks.map(function(t){return "<li><strong>"+esc(t.name)+"</strong> — "+esc(t.skills)+"</li>";}).join("")+"</ul><h3>Activity quality standard</h3><ol><li>Identify the skill and learning outcome.</li><li>Give a realistic task or problem.</li><li>Use appropriate local language, culture, community and industry context.</li><li>Require evidence of the learner's own work.</li><li>Assess with an institution-approved rubric.</li><li>Reflect, improve and document the skill.</li></ol><p>External links must be authorised and reviewed for relevance, accessibility, privacy, copyright, safety and current accuracy before learner use.</p>";}
function show(){load();render();var s=d.getElementById("pacificEducationRealWorldSkills");if(s){s.hidden=false;s.scrollIntoView({behavior:"smooth",block:"start"});}}
w.PacificEducationRealWorldSkills={load:load,save:save,render:render,show:show,getDefaultTracks:function(){return DEFAULT.slice();}};d.addEventListener("DOMContentLoaded",function(){load();render();});
})(window);
