/* PACIFIC EDUCATION — OFFLINE SYNC CONTROLLER
 * v1.7.0 — mobile-accessible manual conflict review controls
 * A real server must authenticate the session, validate ownership,
 * deduplicate events and acknowledge durable persistence.
 */
(function(window){
"use strict";
var VERSION="1.7.0";
var MAX_RETRIES=5;
var BASE_DELAY_MS=2000;
var REVIEW_KEY="pacificEducationOfflineSyncConflictReviews";
var STYLE_ID="pacificEducationConflictReviewStyles";
var connectionState=navigator.onLine?"online":"offline";
var lastTransitionAt=Date.now();
var lastTransition=null;
function runtime(){return window.PacificEducationOfflineRuntime||null;}
function eventId(item){
 var s=[item&&item.type||"",item&&item.lessonId||"",item&&item.dayNumber||"",item&&item.completed?"1":"0"].join("|"),h=2166136261;
 for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
 return "pe-"+(h>>>0).toString(16);
}
function retryPlan(attempt){var n=Number.isInteger(attempt)&&attempt>=0?attempt:0;n=Math.min(n,MAX_RETRIES);return{attempt:n,maxAttempts:MAX_RETRIES,delayMs:BASE_DELAY_MS*Math.pow(2,n),nextAction:n>=MAX_RETRIES?"manual-review":"retry-after-delay"};}
function reviewKey(conflict){return String(conflict&&conflict.key||"");}
function readReviews(){try{var v=JSON.parse(localStorage.getItem(REVIEW_KEY)||"{}");return v&&typeof v==="object"&&!Array.isArray(v)?v:{};}catch(e){return{};}}
function saveReviews(v){try{return localStorage.setItem(REVIEW_KEY,JSON.stringify(v)),true;}catch(e){return false;}}
function isConflictReviewed(conflict){var key=reviewKey(conflict);if(!key)return false;return !!readReviews()[key];}
function conflictKey(item){item=item||{};return[item.type||"",item.lessonId||"",item.dayNumber==null?"":item.dayNumber].join("|");}
function detectConflicts(items){
 var seen={},conflicts=[];
 (items||[]).forEach(function(item){var key=conflictKey(item);if(!key)return;
  if(seen[key]&&seen[key].completed!==item.completed){var c={key:key,first:seen[key],second:item,requiresReview:true,reviewed:false};c.reviewed=isConflictReviewed(c);conflicts.push(c);}
  else if(!seen[key])seen[key]=item;
 });
 return conflicts;
}
function conflictSummary(){
 var queue=[];
 try{var r=runtime();if(r&&typeof r.getQueueStatus==="function"){var result=r.getQueueStatus();queue=result&&result.items||[];}else if(r&&typeof r.getQueue==="function"){var result2=r.getQueue();queue=result2&&result2.items||[];}}catch(e){}
 var conflicts=detectConflicts(queue),pending=conflicts.filter(function(c){return !c.reviewed;});
 return{count:conflicts.length,reviewedCount:conflicts.length-pending.length,pendingCount:pending.length,requiresManualReview:pending.length>0,conflicts:conflicts};
}
function inspect(){
 connectionState=navigator.onLine?"online":"offline";
 var r=runtime();if(!r||typeof r.getQueue!=="function")return{ready:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 var q=r.getQueue(),conflicts=conflictSummary();
 return{ready:true,queuedProgressCount:q.count||0,serverSyncConfigured:false,syncStatus:"SERVER_ENDPOINT_REQUIRED",retryPolicy:{maxAttempts:MAX_RETRIES,baseDelayMs:BASE_DELAY_MS},conflictCount:conflicts.count||0,reviewedConflictCount:conflicts.reviewedCount||0,pendingConflictCount:conflicts.pendingCount||0,requiresManualReview:Boolean(conflicts.requiresManualReview),connectionState:connectionState,lastTransitionAt:lastTransitionAt,lastTransition:lastTransition,productionApproved:false,prototype:true};
}
function hasConflictFor(item,items){var key=conflictKey(item);return(items||[]).some(function(x){return conflictKey(x)===key&&x&&item&&x.completed!==item.completed;});}
function buildSyncBatch(){
 var r=runtime();if(!r||typeof r.getQueue!=="function")return{success:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 var q=r.getQueue(),raw=q.items||[],conflicts=detectConflicts(raw),pending=conflicts.filter(function(c){return !c.reviewed;});
 var items=raw.map(function(item){var conflicted=hasConflictFor(item,raw),reviewed=false;if(conflicted){var key=conflictKey(item);reviewed=conflicts.some(function(c){return c.key===key&&c.reviewed;});}
  return{eventId:eventId(item),type:item.type,lessonId:item.lessonId,dayNumber:item.dayNumber,completed:Boolean(item.completed),queuedAt:item.queuedAt||null,retry:retryPlan(0),requiresManualReview:conflicted&&!reviewed,reviewedConflict:conflicted&&reviewed};
 });
 return{success:true,items:items,count:items.length,conflictCount:conflicts.length,pendingConflictCount:pending.length,requiresManualReview:pending.length>0,containsSensitiveFields:false,idempotencyKeysIncluded:true,retryPolicy:{maxAttempts:MAX_RETRIES,baseDelayMs:BASE_DELAY_MS},prototype:true};
}
function markConflictReviewed(key){if(typeof key!=="string"||!key)return{success:false,reason:"INVALID_CONFLICT_KEY",prototype:true};var reviews=readReviews();reviews[key]={reviewedAt:new Date().toISOString()};var result={success:saveReviews(reviews),key:key,reviewed:true,prototype:true};announce("manual-conflict-reviewed");return result;}
function clearConflictReview(key){if(typeof key!=="string"||!key)return{success:false,reason:"INVALID_CONFLICT_KEY",prototype:true};var reviews=readReviews();delete reviews[key];var result={success:saveReviews(reviews),key:key,reviewed:false,prototype:true};announce("manual-conflict-unreviewed");return result;}
function canRetrySync(attempt){var s=inspect(),n=Number.isInteger(attempt)&&attempt>=0?attempt:0;if(!s.ready)return{allowed:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};if(s.connectionState!=="online")return{allowed:false,reason:"OFFLINE",retry:retryPlan(n),prototype:true};if(s.requiresManualReview)return{allowed:false,reason:"MANUAL_CONFLICT_REVIEW_REQUIRED",conflictCount:s.pendingConflictCount,retry:null,prototype:true};if(n>=MAX_RETRIES)return{allowed:false,reason:"RETRY_LIMIT_REACHED",retry:retryPlan(n),prototype:true};return{allowed:true,reason:"RETRY_ELIGIBLE",retry:retryPlan(n),prototype:true};}
function attemptSync(){var s=inspect();if(!s.ready)return s;var gate=canRetrySync(0);if(!gate.allowed)return{success:false,reason:gate.reason,queuedProgressCount:s.queuedProgressCount,queuePreserved:true,conflictCount:s.conflictCount,pendingConflictCount:s.pendingConflictCount,retryPlan:gate.retry||null,productionApproved:false,prototype:true};return{success:false,reason:"SERVER_SYNC_NOT_CONFIGURED",queuedProgressCount:s.queuedProgressCount,queuePreserved:true,retryPlan:retryPlan(0),productionApproved:false,prototype:true};}
function clearAfterServerAcknowledgement(ack){if(ack!==true)return{success:false,reason:"SERVER_ACKNOWLEDGEMENT_REQUIRED",queuePreserved:true,productionApproved:false,prototype:true};var r=runtime();if(!r||typeof r.clearQueue!=="function")return{success:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};return{success:r.clearQueue().success,cleared:true,productionApproved:false,prototype:true};}
function connectionSummary(){var s=inspect();return{state:connectionState,online:connectionState==="online",queuedProgressCount:s.queuedProgressCount||0,conflictCount:s.conflictCount||0,pendingConflictCount:s.pendingConflictCount||0,requiresManualReview:Boolean(s.requiresManualReview),lastTransitionAt:lastTransitionAt,lastTransition:lastTransition,serverSyncConfigured:false,prototype:true};}
function ensureStyles(){
 if(document.getElementById(STYLE_ID))return;
 var style=document.createElement("style");style.id=STYLE_ID;
 style.textContent="[data-pacific-conflict-review]{width:100%;box-sizing:border-box;margin:.75rem 0;padding:1rem;border:1px solid currentColor;border-radius:.75rem;overflow-wrap:anywhere}[data-pacific-conflict-review] [data-pacific-conflict-summary]{margin:.5rem 0 1rem}[data-pacific-conflict-review] [data-pacific-conflict-list]{list-style:none;margin:0;padding:0;display:grid;gap:.75rem}[data-pacific-conflict-review] [data-pacific-conflict-row]{box-sizing:border-box;width:100%;padding:.875rem;border:1px solid currentColor;border-radius:.65rem;display:flex;flex-wrap:wrap;align-items:center;gap:.75rem}[data-pacific-conflict-review] [data-pacific-conflict-label]{flex:1 1 16rem;min-width:0}[data-pacific-conflict-review] [data-pacific-conflict-status]{font-weight:700;white-space:nowrap}[data-pacific-conflict-review] button{min-width:44px;min-height:44px;padding:.7rem .9rem;touch-action:manipulation;cursor:pointer}[data-pacific-conflict-review] button:focus-visible{outline:3px solid currentColor;outline-offset:3px}@media(max-width:600px){[data-pacific-conflict-review] [data-pacific-conflict-row]{align-items:stretch;flex-direction:column}[data-pacific-conflict-review] [data-pacific-conflict-label],[data-pacific-conflict-review] [data-pacific-conflict-status],[data-pacific-conflict-review] button{width:100%;box-sizing:border-box;white-space:normal}}@media(prefers-reduced-motion:reduce){[data-pacific-conflict-review] *{scroll-behavior:auto!important;transition:none!important}}";
 document.head.appendChild(style);
}
function announce(reason){var detail=connectionSummary();detail.reason=reason||null;try{window.dispatchEvent(new CustomEvent("pacific:offline-sync-status",{detail:detail}));}catch(e){}renderUserStatus(detail);}
function renderConflictControls(){
 var host=document.getElementById("systemStatus");if(!host)return;ensureStyles();
 var box=host.querySelector("[data-pacific-conflict-review]");
 if(!box){box=document.createElement("div");box.setAttribute("data-pacific-conflict-review","");box.setAttribute("role","region");box.setAttribute("aria-label","Offline sync conflict review");host.appendChild(box);}
 box.innerHTML="";
 var summary=conflictSummary();if(!summary.count){box.hidden=true;return;}box.hidden=false;
 var heading=document.createElement("h3");heading.textContent="Sync conflict review";box.appendChild(heading);
 var note=document.createElement("div");note.setAttribute("data-pacific-conflict-summary","");note.setAttribute("role","status");note.setAttribute("aria-live","polite");note.textContent=summary.pendingCount?summary.pendingCount+" conflict(s) need review before sync retry. Reviewing does not delete or change queued data.":"All queued conflicts have been reviewed. Queued data remains preserved.";box.appendChild(note);
 var list=document.createElement("ul");list.setAttribute("data-pacific-conflict-list","");list.setAttribute("aria-label","Queued sync conflicts");box.appendChild(list);
 summary.conflicts.forEach(function(conflict){
  var row=document.createElement("li");row.setAttribute("data-pacific-conflict-row",conflict.key);row.setAttribute("data-reviewed",conflict.reviewed?"true":"false");
  var label=document.createElement("div");label.setAttribute("data-pacific-conflict-label","");
  var lesson=conflict.first&&conflict.first.lessonId||"unknown",day=conflict.first&&conflict.first.dayNumber||"unknown";
  label.textContent="Lesson "+lesson+", day "+day+": "+(conflict.first&&conflict.first.completed?"completed":"not completed")+" vs "+(conflict.second&&conflict.second.completed?"completed":"not completed");row.appendChild(label);
  var status=document.createElement("span");status.setAttribute("data-pacific-conflict-status","");status.textContent=conflict.reviewed?"Reviewed — data preserved":"Needs review";row.appendChild(status);
  var button=document.createElement("button");button.type="button";
  if(conflict.reviewed){button.textContent="Require review again";button.setAttribute("aria-label","Require manual review again for lesson "+lesson+", day "+day);button.addEventListener("click",function(){clearConflictReview(conflict.key);});}
  else{button.textContent="Mark reviewed";button.setAttribute("aria-label","Mark sync conflict reviewed for lesson "+lesson+", day "+day);button.addEventListener("click",function(){markConflictReviewed(conflict.key);});}
  row.appendChild(button);list.appendChild(row);
 });
}
function renderUserStatus(detail){
 function render(){
  var host=document.getElementById("systemStatus");if(!host)return;
  var el=host.querySelector("[data-pacific-reconnect-status]");
  if(!el){el=document.createElement("div");el.setAttribute("data-pacific-reconnect-status","");el.setAttribute("role","status");el.setAttribute("aria-live","polite");host.appendChild(el);}
  var queued=detail.queuedProgressCount||0;
  if(detail.requiresManualReview)el.textContent=detail.online?"Connection restored. "+detail.pendingConflictCount+" queued sync conflict(s) require manual review; data remains preserved.":"Offline. "+detail.pendingConflictCount+" queued sync conflict(s) require manual review; data remains preserved.";
  else if(detail.conflictCount)el.textContent="All queued sync conflicts have been manually reviewed; data remains preserved. Automatic server sync is not configured.";
  else if(detail.online)el.textContent=queued?"Connection restored. "+queued+" queued learning item(s) remain pending; automatic server sync is not configured.":"Connection restored. No queued learning sync items are pending.";
  else el.textContent=queued?"Offline. Learning progress is queued locally for later review/sync.":"Offline. The learning shell can continue using available offline support.";
  renderConflictControls();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
}
function transition(next,reason){var changed=connectionState!==next;connectionState=next;if(changed){lastTransitionAt=Date.now();lastTransition=reason||next;}announce(reason||next);}
function status(){return inspect();}
window.addEventListener("offline",function(){transition("offline","network-offline");});
window.addEventListener("online",function(){transition("online","network-reconnected");});
window.PacificEducationOfflineSyncController=Object.freeze({name:"PacificEducationOfflineSyncController",version:VERSION,inspect:inspect,buildSyncBatch:buildSyncBatch,detectConflicts:detectConflicts,hasConflictFor:hasConflictFor,conflictSummary:conflictSummary,markConflictReviewed:markConflictReviewed,clearConflictReview:clearConflictReview,canRetrySync:canRetrySync,attemptSync:attemptSync,clearAfterServerAcknowledgement:clearAfterServerAcknowledgement,retryPlan:retryPlan,status:status,connectionSummary:connectionSummary,announceStatus:announce});
announce("initial-state");
})(window);
