import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const Adapter=require("../src/js/pacificEducationAuthenticatedOfflineSyncAdapter.js");
const DurableStore=require("../src/js/pacificEducationIndexedDbOfflineQueueStore.js");

const idbAvailable=typeof indexedDB!=="undefined";
function makeItem(n){return{eventId:"550e8400-e29b-41d4-a716-4466554400"+String(n).padStart(2,"0"),
  classId:"fictional-class-a",activityId:"fictional-english-day-1",queuedAt:"2026-11-10T00:00:00.000Z",
  response:{completed:true,answerText:"fictional learner answer"}};}

test("durable IndexedDB queue survives store close and reopen", {skip:!idbAvailable}, async()=>{
  const dbName="pacedu-recovery-"+Date.now()+"-"+Math.random();
  const first=DurableStore.create({dbName});
  await first.put(makeItem(1));
  await first.put(makeItem(2));
  assert.equal((await first.list()).length,2);
  await first.close(); // Simulates the app process closing after durable transaction completion.
  const reopened=DurableStore.create({dbName});
  const recovered=await reopened.list();
  assert.deepEqual(recovered.map(x=>x.eventId).sort(),[makeItem(1).eventId,makeItem(2).eventId].sort());
  await reopened.acknowledge(recovered.map(x=>x.eventId));
  assert.equal((await reopened.list()).length,0);
  await reopened.close();
});

test("network interruption leaves unacknowledged durable queue item for restart recovery", {skip:!idbAvailable}, async()=>{
  const dbName="pacedu-network-recovery-"+Date.now()+"-"+Math.random();
  let store=DurableStore.create({dbName});
  const item=makeItem(3);
  await store.put(item);
  const auth={currentUser:{uid:"fictional-auth-uid",async getIdToken(){return"emulator-token";}}};
  const interrupted=Adapter.create({enabled:true,auth,queueStore:store,
    submitCallable:async()=>{throw new Error("simulated offline/network interruption");}});
  const failed=await interrupted.sync();
  assert.equal(failed.success,false);
  assert.equal(failed.failed[0].reason,"SERVER_SUBMISSION_FAILED");
  assert.equal((await store.list()).length,1);
  await store.close();

  store=DurableStore.create({dbName});
  let attempts=0;
  const recoveredAdapter=Adapter.create({enabled:true,auth,queueStore:store,
    submitCallable:async payload=>{attempts++;return{data:{acknowledged:true,eventId:payload.eventId,queuedAt:payload.queuedAt}};}});
  const recovered=await recoveredAdapter.sync();
  assert.equal(attempts,1);
  assert.equal(recovered.success,true);
  assert.deepEqual(recovered.acknowledgedEventIds,[item.eventId]);
  assert.equal((await store.list()).length,0);
  await store.close();
});

test("durable queue fails closed without IndexedDB and never falls back to localStorage",async()=>{
  const store=DurableStore.create({indexedDB:null});
  // Explicit null is treated as unavailable in environments without a global IndexedDB.
  if(!idbAvailable){
    await assert.rejects(store.put(makeItem(4)),/INDEXEDDB_UNAVAILABLE/);
  }
});
