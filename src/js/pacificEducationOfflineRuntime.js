/* PACIFIC EDUCATION — OFFLINE RUNTIME
 * Prototype only. Queue contains lesson progress metadata only.
 * Never use this client queue as production authentication,
 * authorization, payment verification, or safeguarding storage.
 */
(function(window){
"use strict";
var VERSION="1.3.0",QUEUE_KEY="pacificEducationOfflineProgressQueue";
var ALLOWED_TYPES={progress:true,lesson_completion:true};
function q(){try{var v=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");return Array.isArray(v)?v:[];}catch(e){return[];}}
function save(x){try{localStorage.setItem(QUEUE_KEY,JSON.stringify(x));return true;}catch(e){return false;}}
function safeString(v,max){if(typeof v!=="string")return null;var t=v.trim();if(!t||t.length>max||/[<>"'\`\r\n]/.test(t))return null;return t;}
function safeDay(v){var n=Number(v);return Number.isInteger(n)&&n>=1&&n<=365?n:null;}
function queueProgress(item){
 item=item&&typeof item==="object"?item:{};
 var type=safeString(item.type,32)||"progress",lessonId=safeString(item.lessonId,128),dayNumber=safeDay(item.dayNumber);
 if(!ALLOWED_TYPES[type]||dayNumber===null)return{success:false,reason:"INVALID_PROTOTYPE_QUEUE_ITEM",prototype:true};
 var safe={type:type,lessonId:lessonId,dayNumber:dayNumber,completed:Boolean(item.completed),queuedAt:new Date().toISOString()};
 var list=q(),duplicate=list.some(function(x){return x&&x.lessonId===safe.lessonId&&x.dayNumber===safe.dayNumber&&x.completed===safe.completed;});
 if(!duplicate)list.push(safe);
 return{success:save(list),queued:safe,duplicate:duplicate,count:list.length,prototype:true};
}
function getQueueConflictCandidates(){
 var q=getQueue();
 var seen={},duplicates=[];
 (q.items||[]).forEach(function(item){
   var key=[item&&item.type||"",item&&item.lessonId||"",item&&item.dayNumber==null?"":item.dayNumber].join("|");
   if(seen[key]&&seen[key].completed!==item.completed)duplicates.push({key:key,requiresReview:true});
   else if(!seen[key])seen[key]=item;
 });
 return {count:duplicates.length,requiresManualReview:duplicates.length>0,items:duplicates,prototype:true};
}
function getQueueStatus(){
 var result=getQueue();
 var items=result&&Array.isArray(result.items)?result.items:[];
 return {count:items.length,items:items.slice(),prototype:true};
}
function getQueue(){return{items:q(),count:q().length,prototype:true};}
function clearQueue(){return{success:save([]),prototype:true};}
function registerServiceWorker(){if(!("serviceWorker"in navigator))return Promise.resolve({registered:false,reason:"SERVICE_WORKER_UNAVAILABLE",prototype:true});/* The pilot entry page is under /src while dependencies also live under /js; use the root-scoped prototype worker consistently. */return navigator.serviceWorker.register("../service-worker.js").then(function(r){return{registered:true,scope:r.scope,prototype:true};}).catch(function(){return{registered:false,reason:"SERVICE_WORKER_REGISTRATION_FAILED",prototype:true};});}
function connection(){var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;return c?{effectiveType:c.effectiveType||null,downlinkMbps:typeof c.downlink==="number"?c.downlink:null,rttMs:typeof c.rtt==="number"?c.rtt:null,saveData:c.saveData===true}:null;}
function status(){return{version:VERSION,online:navigator.onLine,queuedProgressCount:q().length,serviceWorkerSupported:"serviceWorker"in navigator,serviceWorkerControlled:!!(navigator.serviceWorker&&navigator.serviceWorker.controller),connection:connection(),lowBandwidthFallback:true,queueContainsLessonMetadataOnly:true,clientCacheMustNotContainSecrets:true,productionApproved:false,realDeviceTestingRequired:true};}
function listenConnectivity(callback){if(typeof callback!=="function")return function(){};var handler=function(){callback(status());};window.addEventListener("online",handler);window.addEventListener("offline",handler);var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(c&&c.addEventListener)c.addEventListener("change",handler);return function(){window.removeEventListener("online",handler);window.removeEventListener("offline",handler);if(c&&c.removeEventListener)c.removeEventListener("change",handler);};}
window.PacificEducationOfflineRuntime=Object.freeze({name:"PacificEducationOfflineRuntime",version:VERSION,queueProgress:queueProgress,getQueue:getQueue,
 getQueueStatus:getQueueStatus,
 getQueueConflictCandidates:getQueueConflictCandidates,clearQueue:clearQueue,registerServiceWorker:registerServiceWorker,status:status,listenConnectivity:listenConnectivity});
})(window);