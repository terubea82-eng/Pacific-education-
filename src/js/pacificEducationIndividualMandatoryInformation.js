/* Pacific Education — Individual User Mandatory Information Registry
 * Prototype/pilot: jurisdiction-aware, data-minimising.
 * This module does not itself declare a field legally mandatory.
 */
(function(window,document){"use strict";
var KEY="pacificEducationIndividualMandatoryInfoV1";
var BASE=[
{id:"preferred-name",label:"Preferred/display name",category:"identity",defaultRequired:true,reason:"Needed for the user's interface identity."},
{id:"preferred-language",label:"Preferred language",category:"language",defaultRequired:true,reason:"Supports communication and accessibility."},
{id:"role",label:"User role / responsibility",category:"access",defaultRequired:true,reason:"Determines the authorised workspace."},
{id:"country-region",label:"Country / region",category:"jurisdiction",defaultRequired:true,reason:"Determines applicable configuration."},
{id:"contact-method",label:"Contact method",category:"contact",defaultRequired:false,reason:"Only when communication, recovery, safeguarding or another verified need requires it."},
{id:"age-band",label:"Age band",category:"eligibility",defaultRequired:false,reason:"Use the least-specific age information needed for eligibility or child protections."},
{id:"guardian-link",label:"Parent/caregiver or guardian relationship",category:"child-safeguarding",defaultRequired:false,reason:"Only for applicable child workflows or verified requirements."},
{id:"institution-affiliation",label:"Institution affiliation",category:"education",defaultRequired:false,reason:"Only when the user participates through an institution."},
{id:"accessibility-needs",label:"Accessibility preferences/support needs",category:"accessibility",defaultRequired:false,reason:"Collect only what is needed to provide requested support."},
{id:"consent-or-notice-record",label:"Required notice/consent record",category:"privacy",defaultRequired:false,reason:"Only where a verified legal, regulatory or service requirement requires it."}
];
var NOT_DEFAULT=["exact-location","government-id-number","passport-number","biometric-data","full-date-of-birth","health-diagnosis","religion","political-opinion","sexual-orientation","criminal-history","payment-details"];
var state={version:1,requirements:[],lastUpdated:null};
function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||"{}");if(v&&Array.isArray(v.requirements))state=v;}catch(e){}return state;}
function save(){state.lastUpdated=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}return state;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
function find(id){var custom=state.requirements.filter(function(x){return x.id===id;})[0];if(custom)return custom;return BASE.filter(function(x){return x.id===id;})[0]||null;}
function isMandatory(id){var x=find(id);return !!(x&&(x.required===true||x.defaultRequired===true));}
function register(v,authorized){v=v||{};if(authorized!==true)throw new Error("Authorised configuration is required.");if(!v.id||!v.source)throw new Error("Field ID and verified requirement source are required.");var row={id:String(v.id),label:String(v.label||v.id),category:String(v.category||"custom"),required:v.required===true,source:String(v.source),sourceType:String(v.sourceType||"verified-requirement"),jurisdiction:String(v.jurisdiction||""),effectiveDate:String(v.effectiveDate||""),reviewDate:String(v.reviewDate||""),authorisedBy:String(v.authorisedBy||""),timestamp:new Date().toISOString()};state.requirements=state.requirements.filter(function(x){return x.id!==row.id;});state.requirements.push(row);save();render();return row;}
function remove(id,authorized){if(authorized!==true)throw new Error("Authorised configuration is required.");state.requirements=state.requirements.filter(function(x){return x.id!==id;});save();render();}
function render(){var h=document.getElementById("pacificEducationIndividualMandatoryInformation");if(!h)return;load();h.innerHTML="<h2>Individual User — Mandatory Information</h2><p><strong>Data-minimisation rule:</strong> Pacedu asks only for information necessary for the user's lawful role, service, safeguarding need or a verified legal/regulatory requirement.</p><p><strong>Legal-status rule:</strong> A field is not legally mandatory merely because Pacedu lists it. Additional mandatory fields require an authorised configuration with jurisdiction, source and effective/review information.</p><h3>Core pilot information</h3><ul>"+BASE.map(function(x){return "<li><strong>"+esc(x.label)+"</strong> — "+(x.defaultRequired?"required for pilot configuration":"conditional only")+" — "+esc(x.reason)+"</li>";}).join("")+"</ul><h3>Not requested by default</h3><p>"+NOT_DEFAULT.map(esc).join(", ")+" — each requires a specific lawful and necessary basis before collection.</p><h3>Verified additional requirements</h3><div>"+(state.requirements.length?state.requirements.map(function(x){return "<p><strong>"+esc(x.label)+"</strong> — "+(x.required?"MANDATORY":"optional")+" — "+esc(x.jurisdiction)+" — source: "+esc(x.source)+"</p>";}).join(""):"<p>No additional verified requirements configured.</p>")+"</div>";}
load();window.PacificEducationIndividualMandatoryInformation=Object.freeze({version:"1.0.0",prototype:true,baseFields:BASE.slice(),notRequestedByDefault:NOT_DEFAULT.slice(),load:load,save:save,getState:function(){return load();},isMandatory:isMandatory,register:register,remove:remove,render:render});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})(window,document);