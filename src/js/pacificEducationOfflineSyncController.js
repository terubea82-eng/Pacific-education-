/* PACIFIC EDUCATION — OFFLINE SYNC CONTROLLER
 * v1.5.0 — manual conflict-review controls and safer retry gating only
 * A real server must authenticate the session, validate ownership,
 * deduplicate events and acknowledge durable persistence.
 */
(function(window){
"use strict";
var VERSION="1.5.0";
var MAX_RETRIES=5;
var BASE_DELAY_MS=2000;
var connectionState=navigator.onLine?"online":"offline";
var lastTransitionAt=Date.now();
var lastTransition=null;
var reviewState={};
function runtime(){return window.PacificEducationOfflineRuntime||null;}
function eventId(item){
 var s=[item&&item.type||"",item&&item.lessonId||"",item&&item.dayNumber||"",item&&item.completed?"1":"0"].join("|");
 var h=2166136261;
 for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
 return "pe-"+(h>>>0).toString(16);
}
function retryPlan(attempt){
 var n=Number.isInteger(attempt)&&attempt>=0?attempt:0;
 n=Math.min(n,MAX_RETRIES);
 return {attempt:n,maxAttempts:MAX_RETRIES,delayMs:BASE_DELAY_MS*Math.pow(2,n),nextAction:n>=MAX_RETRIES?"manual-review":"retry-after-delay"};
}
function inspect(){
 var r=runtime();
 if(!r||typeof r.getQueue!=="function") return {ready:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 var q=r.getQueue(),conflicts=conflictSummary();
 return {ready:true,queuedProgressCount:q.count||0,serverSyncConfigured:false,syncStatus:"SERVER_ENDPOINT_REQUIRED",retryPolicy:{maxAttempts:MAX_RETRIES,baseDelayMs:BASE_DELAY_MS},conflictCount:conflicts.count||0,requiresManualReview:Boolean(conflicts.requiresManualReview),connectionState:connectionState,lastTransitionAt:lastTransitionAt,lastTransition:lastTransition,productionApproved:false,prototype:true};
}
function conflictKey(item){item=item||{};return[item.type||"",item.lessonId||"",item.dayNumber==null?"":item.dayNumber].join("|");}
function detectConflicts(items){
 var seen={},conflicts=[];
 (items||[]).forEach(function(item){var key=conflictKey(item);if(!key)return;if(seen[key]&&seen[key].completed!==item.completed)conflicts.push({key:key,first:seen[key],second:item,requiresReview:true});else if(!seen[key])seen[key]=item;});
 return conflicts;
}
function hasConflictFor(item,items){var key=conflictKey(item);return(items||[]).some(function(x){return conflictKey(x)===key&&x&&item&&x.completed!==item.completed;});}
function conflictSummary(){
 var queue=[];
 try{
  var r=window.PacificEducationOfflineRuntime;
  if(r&&typeof r.getQueueConflictCandidates==="function")return r.getQueueConflictCandidates()||{count:0,requiresManualReview:false,items:[]};
  if(r&&typeof r.getQueueStatus==="function"){var result=r.getQueueStatus();queue=result&&result.items||[];}
  else if(r&&typeof r.getQueue==="function"){var result2=r.getQueue();queue=result2&&result2.items||[];}
 }catch(e){queue=[];}
 var conflicts=detectConflicts(queue);return{count:conflicts.length,requiresManualReview:conflicts.length>0,conflicts:conflicts};
}
function buildSyncBatch(){
 var r=runtime();if(!r||typeof r.getQueue!=="function")return{success:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 var q=r.getQueue(),raw=q.items||[],conflicts=detectConflicts(raw);
 var items=raw.map(function(item){var conflicted=hasConflictFor(item,raw);return{eventId:eventId(item),type:item.type,lessonId:item.lessonId,dayNumber:item.dayNumber,completed:Boolean(item.completed),queuedAt:item.queuedAt||null,retry:retryPlan(0),requiresManualReview:conflicted};});
 return{success:true,items:items,count:items.length,conflictCount:conflicts.length,requiresManualReview:conflicts.length>0,containsSensitiveFields:false,idempotencyKeysIncluded:true,retryPolicy:{maxAttempts:MAX_RETRIES,baseDelayMs:BASE_DELAY_MS},prototype:true};
}
function reviewConflicts(){
 var s=conflictSummary(),items=s.conflicts||s.items||[];
 return{success:true,count:s.count||0,requiresManualReview:Boolean(s.requiresManualReview),items:items.map(function(item){var key=item.key||conflictKey(item.first||item);return{key:key,first:item.first||null,second:item.second||null,reviewed:Boolean(reviewState[key]),requiresReview:true};}),queuePreserved:true,prototype:true};
}
function markConflictReviewed(key){
 if(typeof key!=="string"||!key)return{success:false,reason:"CONFLICT_KEY_REQUIRED",prototype:true};
 var current=conflictSummary(),items=current.conflicts||current.items||[],exists=items.some(function(item){return(item.key||conflictKey(item.first||item))===key;});
 if(!exists)return{success:false,reason:"CONFLICT_NOT_FOUND",queuePreserved:true,prototype:true};
 reviewState[key]=true;
 return{success:true,key:key,reviewed:true,queuePreserved:true,requiresResolutionBeforeSync:true,prototype:true};
}
function clearReviewedConflictState(){reviewState={};return{success:true,prototype:true};}
function canRetry(attempt){
 var s=inspect(),plan=retryPlan(attempt);
 if(!s.ready)return{allowed:false,reason:s.reason,plan:plan,prototype:true};
 if(!s.connectionState||s.connectionState!=="online")return{allowed:false,reason:"OFFLINE_RETRY_BLOCKED",plan:plan,queuedProgressCount:s.queuedProgressCount,prototype:true};
 if(s.requiresManualReview)return{allowed:false,reason:"MANUAL_CONFLICT_REVIEW_REQUIRED",plan:null,conflictCount:s.conflictCount,prototype:true};
 if(plan.attempt>=MAX_RETRIES)return{allowed:false,reason:"RETRY_LIMIT_REACHED",plan:plan,prototype:true};
 return{allowed:true,reason:"RETRY_ALLOWED_AFTER_DELAY",plan:plan,prototype:true};
}
function attemptSync(attempt){
 var s=inspect();
 if(!s.ready)return s;
 if(s.requiresManualReview)return{success:false,reason:"MANUAL_CONFLICT_REVIEW_REQUIRED",queuedProgressCount:s.queuedProgressCount,queuePreserved:true,conflictCount:s.conflictCount,retryPlan:null,productionApproved:false,prototype:true};
 var retry=canRetry(attempt);
 if(!retry.allowed)return{success:false,reason:retry.reason,queuedProgressCount:s.queuedProgressCount,queuePreserved:true,retryPlan:retry.plan||null,productionApproved:false,prototype:true};
 return{success:false,reason:"SERVER_SYNC_NOT_CONFIGURED",queuedProgressCount:s.queuedProgressCount,queuePreserved:true,retryPlan:retry.plan,productionApproved:false,prototype:true};
}
function clearAfterServerAcknowledgement(ack){
 if(ack!==true)return{success:false,reason:"SERVER_ACKNOWLEDGEMENT_REQUIRED",queuePreserved:true,productionApproved:false,prototype:true};
 var r=runtime();if(!r||typeof r.clearQueue!=="function")return{success:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 return{success:r.clearQueue().success,cleared:true,productionApproved:false,prototype:true};
}
function connectionSummary(){var s=inspect();return{state:connectionState,online:connectionState==="online",queuedProgressCount:s.queuedProgressCount||0,conflictCount:s.conflictCount||0,requiresManualReview:Boolean(s.requiresManualReview),lastTransitionAt:lastTransitionAt,lastTransition:lastTransition,serverSyncConfigured:false,prototype:true};}
function announce(reason){var detail=connectionSummary();detail.reason=reason||null;try{window.dispatchEvent(new CustomEvent("pacific:offline-sync-status",{detail:detail}));}catch(e){}renderUserStatus(detail);}
function renderUserStatus(detail){function render(){var host=document.getElementById("systemStatus");if(!host)return;var el=host.querySelector("[data-pacific-reconnect-status]");if(!el){el=document.createElement("div");el.setAttribute("data-pacific-reconnect-status","");el.setAttribute("role","status");el.setAttribute("aria-live","polite");host.appendChild(el);}var queued=detail.queuedProgressCount||0;if(detail.requiresManualReview){el.textContent=detail.online?"Connection restored. "+detail.conflictCount+" queued sync conflict(s) require manual review; data remains preserved.":"Offline. "+detail.conflictCount+" queued sync conflict(s) require manual review; data remains preserved.";}else if(detail.online){el.textContent=queued?"Connection restored. "+queued+" queued learning item(s) remain pending; automatic server sync is not configured.":"Connection restored. No queued learning sync items are pending.";}else{el.textContent=queued?"Offline. Learning progress is queued locally for later review/sync.":"Offline. The learning shell can continue using available offline support.";}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();}
function transition(next,reason){var changed=connectionState!==next;connectionState=next;if(changed){lastTransitionAt=Date.now();lastTransition=reason||next;}announce(reason||next);}
function status(){return inspect();}
window.addEventListener("offline",function(){transition("offline","network-offline");});
window.addEventListener("online",function(){transition("online","network-reconnected");});
window.PacificEducationOfflineSyncController=Object.freeze({name:"PacificEducationOfflineSyncController",version:VERSION,inspect:inspect,buildSyncBatch:buildSyncBatch,detectConflicts:detectConflicts,hasConflictFor:hasConflictFor,conflictSummary:conflictSummary,reviewConflicts:reviewConflicts,markConflictReviewed:markConflictReviewed,clearReviewedConflictState:clearReviewedConflictState,canRetry:canRetry,attemptSync:attemptSync,clearAfterServerAcknowledgement:clearAfterServerAcknowledgement,retryPlan:retryPlan,status:status,connectionSummary:connectionSummary,announceStatus:announce});
announce("initial-state");
})(window);
