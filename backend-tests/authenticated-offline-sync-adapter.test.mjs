import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const Adapter=require("../src/js/pacificEducationAuthenticatedOfflineSyncAdapter.js");

function fixture(){
  const rows=new Map();
  const queueStore={
    async put(item){rows.set(item.eventId,structuredClone(item));},
    async list(){return Array.from(rows.values()).map(x=>structuredClone(x));},
    async acknowledge(ids){ids.forEach(id=>rows.delete(id));}
  };
  let uuidCounter=1;
  const auth={currentUser:{uid:"fictional-auth-uid",async getIdToken(){return "emulator-token";}}};
  const submitted=[];
  const adapter=Adapter.create({enabled:true,auth,queueStore,
    getSubmissionContext:async()=>({classId:"fictional-class-a",activityId:"fictional-english-day-1"}),
    makeUuid:()=> "550e8400-e29b-41d4-a716-44665544000"+uuidCounter++,
    submitCallable:async payload=>{submitted.push(payload);return{data:{acknowledged:true,eventId:payload.eventId,queuedAt:payload.queuedAt}};}
  });
  return{adapter,queueStore,submitted,auth,rows};
}

test("production activation remains hard-disabled and default adapter cannot sync",async()=>{
  assert.equal(Adapter.productionActivation,false);
  const adapter=Adapter.create({});
  const result=await adapter.sync();
  assert.equal(result.reason,"STAGING_ADAPTER_DISABLED");
  assert.equal(adapter.status().productionActivation,false);
});

test("enqueue derives no UID from caller and stores only callable contract fields",async()=>{
  const f=fixture();
  const result=await f.adapter.enqueue({completed:true,answerText:"Fictional response"});
  assert.equal(result.success,true);
  const [item]=await f.queueStore.list();
  assert.equal(item.eventId,result.eventId);
  assert.equal(item.classId,"fictional-class-a");
  assert.equal(item.activityId,"fictional-english-day-1");
  assert.equal("uid" in item,false);
  assert.equal("studentUid" in item,false);
  assert.deepEqual(Object.keys(item).sort(),["activityId","classId","eventId","queuedAt","response"].sort());
});

test("enqueue validates trusted context before requiring callable sync dependencies",async()=>{
  const f=fixture();
  const enqueueOnly=Adapter.create({enabled:true,auth:f.auth,queueStore:f.queueStore,
    getSubmissionContext:async()=>({classId:"fictional-class-a",activityId:"fictional-english-day-1"}),
    makeUuid:()=>"550e8400-e29b-41d4-a716-446655440012"
  });
  const queued=await enqueueOnly.enqueue({completed:true});
  assert.equal(queued.success,true);
  const sync=await enqueueOnly.sync();
  assert.equal(sync.reason,"ADAPTER_DEPENDENCIES_MISSING");
  assert.equal((await f.queueStore.list()).length,1);
});

test("unauthenticated enqueue is rejected without queue mutation",async()=>{
  const f=fixture();f.auth.currentUser=null;
  const result=await f.adapter.enqueue({completed:true});
  assert.equal(result.reason,"AUTHENTICATION_REQUIRED");
  assert.equal((await f.queueStore.list()).length,0);
});

test("missing approved activity context and insecure UUID fail closed",async()=>{
  const f=fixture();
  const noContext=Adapter.create({enabled:true,auth:f.auth,queueStore:f.queueStore,
    getSubmissionContext:async()=>({classId:"fictional-class-a"}),makeUuid:()=>"550e8400-e29b-41d4-a716-446655440011"});
  assert.equal((await noContext.enqueue({completed:true})).reason,"APPROVED_ACTIVITY_CONTEXT_REQUIRED");
  const noUuid=Adapter.create({enabled:true,auth:f.auth,queueStore:f.queueStore,
    getSubmissionContext:async()=>({classId:"fictional-class-a",activityId:"fictional-english-day-1"}),makeUuid:()=>"weak-id"});
  assert.equal((await noUuid.enqueue({completed:true})).reason,"SECURE_UUID_UNAVAILABLE");
  assert.equal((await f.queueStore.list()).length,0);
});

test("partial acknowledgement removes only exact acknowledged item and preserves failures",async()=>{
  const f=fixture();
  await f.adapter.enqueue({completed:true,answerText:"A"});
  await f.adapter.enqueue({completed:false,answerText:"B"});
  let calls=0;
  const partial=Adapter.create({enabled:true,auth:f.auth,queueStore:f.queueStore,
    getSubmissionContext:async()=>({classId:"fictional-class-a",activityId:"fictional-english-day-1"}),
    submitCallable:async payload=>{calls++;if(calls===1)return{data:{acknowledged:true,eventId:payload.eventId,queuedAt:payload.queuedAt}};throw new Error("simulated network loss");}
  });
  const before=await f.queueStore.list();
  const result=await partial.sync();
  assert.equal(result.success,false);
  assert.equal(result.acknowledgedEventIds.length,1);
  assert.equal(result.failed.length,1);
  const remaining=await f.queueStore.list();
  assert.equal(remaining.length,1);
  assert.equal(remaining[0].eventId,before[1].eventId);
  assert.equal(remaining[0].response.answerText,"B");
});

test("mismatched server acknowledgement never deletes queued item",async()=>{
  const f=fixture();await f.adapter.enqueue({completed:true});
  const unsafe=Adapter.create({enabled:true,auth:f.auth,queueStore:f.queueStore,
    getSubmissionContext:async()=>({classId:"fictional-class-a",activityId:"fictional-english-day-1"}),
    submitCallable:async payload=>({data:{acknowledged:true,eventId:"550e8400-e29b-41d4-a716-446655440099",queuedAt:payload.queuedAt}})
  });
  const result=await unsafe.sync();
  assert.equal(result.success,false);
  assert.equal(result.failed[0].reason,"EXACT_SERVER_ACK_REQUIRED");
  assert.equal((await f.queueStore.list()).length,1);
});

test("token refresh failure preserves all queued work",async()=>{
  const f=fixture();await f.adapter.enqueue({completed:true});
  f.auth.currentUser.getIdToken=async()=>{throw new Error("expired session");};
  const result=await f.adapter.sync();
  assert.equal(result.reason,"AUTHENTICATION_REFRESH_FAILED");
  assert.equal((await f.queueStore.list()).length,1);
});
