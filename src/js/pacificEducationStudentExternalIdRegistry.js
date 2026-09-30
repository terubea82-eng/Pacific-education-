/* Pacific Education — Authorised External Student ID Link Registry
 * Pilot/prototype: links FEMIS or other institution/ministry identifiers to one PacEdu identity.
 * It does not scrape protected systems, collect passwords, or auto-merge uncertain matches.
 */
(function(window,document){"use strict";
var KEY="pacificEducationStudentExternalIdLinksV1";
var state={version:1,links:[],lastUpdated:null};

function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||"{}");if(v&&Array.isArray(v.links))state=v;}catch(e){}return state;}
function save(){state.lastUpdated=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}return state;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
function normal(v){return String(v||"").trim().toUpperCase().replace(/\\s+/g,"");}

function link(input,authorized){
 input=input||{};
 if(authorized!==true)throw new Error("Authorised institution/ministry action is required.");
 var sourceType=String(input.sourceType||"").trim();
 var sourceName=String(input.sourceName||"").trim();
 var externalId=normal(input.externalId);
 var paceduId=String(input.paceduId||"").trim();
 if(!sourceType||!sourceName||!externalId||!paceduId)throw new Error("Source, source name, external ID and PacEdu ID are required.");
 var duplicate=state.links.filter(function(x){return x.sourceType===sourceType&&normal(x.externalId)===externalId;})[0];
 if(duplicate&&duplicate.paceduId!==paceduId)throw new Error("This external student ID is already linked to another PacEdu ID. Verify the institutional record before changing it.");
 var row={sourceType:sourceType,sourceName:sourceName,externalId:externalId,paceduId:paceduId,institutionId:String(input.institutionId||""),verifiedBy:String(input.verifiedBy||""),verifiedAt:new Date().toISOString(),status:"verified-link",readOnlySource:true};
 state.links=state.links.filter(function(x){return !(x.sourceType===sourceType&&normal(x.externalId)===externalId);});
 state.links.push(row);save();render();return row;
}

function identify(sourceType,externalId,institutionId){
 load();var id=normal(externalId);
 var matches=state.links.filter(function(x){return x.sourceType===sourceType&&normal(x.externalId)===id&&(!institutionId||!x.institutionId||x.institutionId===institutionId);});
 if(matches.length===1)return {status:"identified",pacificEducationId:matches[0].paceduId,link:matches[0]};
 if(matches.length>1)return {status:"conflict-review-required",matches:matches};
 return {status:"not-linked"};
}

function importDirectory(records,authorized){
 if(authorized!==true)throw new Error("Authorised institution/ministry action is required.");
 if(!Array.isArray(records))throw new Error("An authorised exported directory is required.");
 var added=0,conflicts=0;
 records.forEach(function(r){
   try{link(r,true);added++;}catch(e){conflicts++;}
 });
 return {added:added,conflicts:conflicts};
}

function render(){
 var el=document.getElementById("pacificEducationStudentExternalIdRegistry");if(!el)return;load();
 el.innerHTML="<h2>Student ID Link & Recognition</h2>"+
 "<p><strong>Automatic recognition rule:</strong> once an authorised institution or Ministry links a verified FEMIS or other student identifier to a PacEdu ID, PacEdu can recognise that student within the authorised institution context.</p>"+
 "<p><strong>Sources:</strong> FEMIS, Ministry/education authority exports, and approved institutional student-information systems may be linked through an authorised export/data-sharing process.</p>"+
 "<p><strong>Safety:</strong> PacEdu does not request source-system passwords, scrape protected systems, or automatically merge uncertain student records. Conflicts require authorised review.</p>"+
 "<p><strong>Privacy:</strong> the external identifier is used as a linkage key and must be restricted to authorised roles; the student-facing interface should use the PacEdu ID rather than exposing external identifiers.</p>"+
 "<p><strong>Linked records:</strong> "+state.links.length+" verified link(s).</p>";
}

load();
window.PacificEducationStudentExternalIdRegistry=Object.freeze({version:"1.0.0",prototype:true,productionEligible:false,load:load,save:save,getState:function(){return load();},link:link,identify:identify,importDirectory:importDirectory,render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})(window,document);
