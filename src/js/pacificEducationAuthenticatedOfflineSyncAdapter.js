/* PacEdu authenticated offline-sync adapter.
 * Staging integration boundary only. Production activation is hard-disabled.
 * No learner UID/role is accepted from queue data; Firebase Auth supplies identity.
 * Durable queue storage is injected so sensitive learner responses are not silently
 * placed in localStorage by this adapter.
 */
(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.PacificEducationAuthenticatedOfflineSyncAdapter=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  var VERSION="1.0.0";
  var PRODUCTION_ACTIVATION=false;
  var UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function result(success,reason,extra){return Object.assign({success:success,reason:reason||null,productionApproved:false,productionActivation:false,prototype:true},extra||{});}
  function create(options){
    options=options||{};
    var auth=options.auth, submitCallable=options.submitCallable, queueStore=options.queueStore;
    var getSubmissionContext=options.getSubmissionContext, makeUuid=options.makeUuid;
    var enabled=options.enabled===true;
    function enqueueDependenciesReady(){
      return !!(auth&&queueStore&&typeof queueStore.put==="function"&&
        typeof getSubmissionContext==="function");
    }
    function syncDependenciesReady(){
      return !!(auth&&typeof submitCallable==="function"&&queueStore&&
        typeof queueStore.list==="function"&&typeof queueStore.acknowledge==="function");
    }
    function currentUser(){
      var user=auth&&auth.currentUser;
      return user&&typeof user.uid==="string"&&user.uid?user:null;
    }
    function uuid(){
      var value=typeof makeUuid==="function"?makeUuid():
        (typeof crypto!=="undefined"&&crypto&&typeof crypto.randomUUID==="function"?crypto.randomUUID():null);
      return typeof value==="string"&&UUID.test(value)?value.toLowerCase():null;
    }
    async function enqueue(response){
      if(!enabled)return result(false,"STAGING_ADAPTER_DISABLED");
      if(!enqueueDependenciesReady())return result(false,"ADAPTER_DEPENDENCIES_MISSING");
      if(!currentUser())return result(false,"AUTHENTICATION_REQUIRED");
      if(!response||typeof response!=="object"||Array.isArray(response)||
        typeof response.completed!=="boolean"||
        (response.answerText!==undefined&&(typeof response.answerText!=="string"||response.answerText.length>4000))||
        Object.keys(response).some(function(k){return k!=="completed"&&k!=="answerText";}))
        return result(false,"INVALID_LEARNER_RESPONSE");
      var context;
      try{context=await getSubmissionContext();}catch(e){return result(false,"TRUSTED_ACTIVITY_CONTEXT_UNAVAILABLE");}
      if(!context||typeof context.classId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(context.classId)||
        typeof context.activityId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(context.activityId))
        return result(false,"APPROVED_ACTIVITY_CONTEXT_REQUIRED");
      var eventId=uuid();
      if(!eventId)return result(false,"SECURE_UUID_UNAVAILABLE");
      var queuedAt=new Date().toISOString();
      var item={eventId:eventId,classId:context.classId,activityId:context.activityId,
        queuedAt:queuedAt,response:{completed:response.completed}};
      if(response.answerText!==undefined)item.response.answerText=response.answerText;
      try{
        await queueStore.put(item);
        return result(true,"QUEUED",{eventId:eventId,queuedAt:queuedAt,queuePreserved:true});
      }catch(e){return result(false,"QUEUE_WRITE_FAILED",{queuePreserved:true});}
    }
    async function sync(){
      if(!enabled)return result(false,"STAGING_ADAPTER_DISABLED",{queuePreserved:true});
      if(!syncDependenciesReady())return result(false,"ADAPTER_DEPENDENCIES_MISSING",{queuePreserved:true});
      var user=currentUser();
      if(!user)return result(false,"AUTHENTICATION_REQUIRED",{queuePreserved:true});
      try{if(typeof user.getIdToken!=="function")return result(false,"FIREBASE_AUTH_TOKEN_UNAVAILABLE",{queuePreserved:true});await user.getIdToken();}
      catch(e){return result(false,"AUTHENTICATION_REFRESH_FAILED",{queuePreserved:true});}
      var items;
      try{items=await queueStore.list();}catch(e){return result(false,"QUEUE_READ_FAILED",{queuePreserved:true});}
      if(!Array.isArray(items))return result(false,"INVALID_QUEUE_STORE_RESULT",{queuePreserved:true});
      var acknowledged=[],failed=[];
      for(var i=0;i<items.length;i++){
        var item=items[i];
        if(!item||!UUID.test(item.eventId||"")||typeof item.classId!=="string"||
          typeof item.activityId!=="string"||!item.response||typeof item.response.completed!=="boolean"){
          failed.push({eventId:item&&item.eventId||null,reason:"INVALID_QUEUED_ITEM"});continue;
        }
        try{
          var response=await submitCallable({
            eventId:item.eventId,classId:item.classId,activityId:item.activityId,
            queuedAt:item.queuedAt,response:item.response
          });
          var data=response&&response.data;
          if(data&&data.acknowledged===true&&data.eventId===item.eventId&&data.queuedAt===item.queuedAt)
            acknowledged.push(item.eventId);
          else failed.push({eventId:item.eventId,reason:"EXACT_SERVER_ACK_REQUIRED"});
        }catch(e){failed.push({eventId:item.eventId,reason:"SERVER_SUBMISSION_FAILED"});}
      }
      if(acknowledged.length){
        try{await queueStore.acknowledge(acknowledged);}
        catch(e){return result(false,"ACKNOWLEDGEMENT_QUEUE_UPDATE_FAILED",{acknowledgedEventIds:acknowledged,failed:failed,queuePreserved:true});}
      }
      return result(failed.length===0,"SYNC_FINISHED",{acknowledgedEventIds:acknowledged,failed:failed,
        queuePreserved:failed.length>0,remainingCount:(await queueStore.list()).length});
    }
    return Object.freeze({version:VERSION,productionActivation:PRODUCTION_ACTIVATION,enqueue:enqueue,sync:sync,
      status:function(){return{enabled:enabled,authenticated:!!currentUser(),productionActivation:false,productionApproved:false,prototype:true};}});
  }
  return Object.freeze({version:VERSION,productionActivation:PRODUCTION_ACTIVATION,create:create});
});
