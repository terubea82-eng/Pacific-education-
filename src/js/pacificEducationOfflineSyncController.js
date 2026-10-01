/* PACIFIC EDUCATION — OFFLINE SYNC CONTROLLER
 * v1.2.0 — prototype reconciliation and retry planning only
 * A real server must authenticate the session, validate ownership,
 * deduplicate events and acknowledge durable persistence.
 */
(function(window){
"use strict";
var VERSION="1.2.0";
var MAX_RETRIES=5;
var BASE_DELAY_MS=2000;
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
 var q=r.getQueue();
 return {ready:true,queuedProgressCount:q.count||0,serverSyncConfigured:false,syncStatus:"SERVER_ENDPOINT_REQUIRED",retryPolicy:{maxAttempts:MAX_RETRIES,baseDelayMs:BASE_DELAY_MS},productionApproved:false,prototype:true};
}
function buildSyncBatch(){
 var r=runtime();
 if(!r||typeof r.getQueue!=="function") return {success:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 var q=r.getQueue(),items=(q.items||[]).map(function(item){
   return {eventId:eventId(item),type:item.type,lessonId:item.lessonId,dayNumber:item.dayNumber,completed:Boolean(item.completed),queuedAt:item.queuedAt||null,retry:retryPlan(0)};
 });
 return {success:true,items:items,count:items.length,containsSensitiveFields:false,idempotencyKeysIncluded:true,retryPolicy:{maxAttempts:MAX_RETRIES,baseDelayMs:BASE_DELAY_MS},prototype:true};
}
function attemptSync(){
 var s=inspect();
 if(!s.ready)return s;
 return {success:false,reason:"SERVER_SYNC_NOT_CONFIGURED",queuedProgressCount:s.queuedProgressCount,queuePreserved:true,retryPlan:retryPlan(0),productionApproved:false,prototype:true};
}
function clearAfterServerAcknowledgement(ack){
 if(ack!==true)return{success:false,reason:"SERVER_ACKNOWLEDGEMENT_REQUIRED",queuePreserved:true,productionApproved:false,prototype:true};
 var r=runtime();
 if(!r||typeof r.clearQueue!=="function")return{success:false,reason:"OFFLINE_RUNTIME_UNAVAILABLE",prototype:true};
 return{success:r.clearQueue().success,cleared:true,productionApproved:false,prototype:true};
}
function conflictKey(item){
    item=item||{};
    return [item.type||"",item.lessonId||"",item.dayNumber==null?"":item.dayNumber].join("|");
  }

  function detectConflicts(items){
    var seen={},conflicts=[];
    (items||[]).forEach(function(item){
      var key=conflictKey(item);
      if(!key)return;
      if(seen[key] && seen[key].completed!==item.completed){
        conflicts.push({key:key,first:seen[key],second:item,requiresReview:true});
      }else if(!seen[key])seen[key]=item;
    });
    return conflicts;
  }

function status(){return inspect();}
window.PacificEducationOfflineSyncController=Object.freeze({name:"PacificEducationOfflineSyncController",version:VERSION,inspect:inspect,buildSyncBatch:buildSyncBatch,
    detectConflicts:detectConflicts,attemptSync:attemptSync,clearAfterServerAcknowledgement:clearAfterServerAcknowledgement,retryPlan:retryPlan,status:status});
})(window);
