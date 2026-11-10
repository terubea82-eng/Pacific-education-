/* PacEdu durable offline queue: IndexedDB-backed, staging-only infrastructure.
 * No localStorage fallback: if IndexedDB is unavailable, writes fail closed.
 * Queue records contain learner responses and must remain app-origin scoped.
 */
(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.PacificEducationIndexedDbOfflineQueueStore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  var DB_VERSION=1, STORE="pendingSubmissions";
  function create(options){
    options=options||{};
    var idb=Object.prototype.hasOwnProperty.call(options,"indexedDB")?options.indexedDB:(typeof indexedDB!=="undefined"?indexedDB:null);
    var dbName=options.dbName||"pacedu-offline-queue-staging";
    var dbPromise=null, closed=false;
    function open(){
      if(closed)return Promise.reject(new Error("QUEUE_STORE_CLOSED"));
      if(!idb||typeof idb.open!=="function")return Promise.reject(new Error("INDEXEDDB_UNAVAILABLE"));
      if(dbPromise)return dbPromise;
      dbPromise=new Promise(function(resolve,reject){
        var request;
        try{request=idb.open(dbName,DB_VERSION);}catch(e){dbPromise=null;reject(e);return;}
        request.onupgradeneeded=function(){
          var db=request.result;
          if(!db.objectStoreNames.contains(STORE))
            db.createObjectStore(STORE,{keyPath:"eventId"});
        };
        request.onsuccess=function(){
          var db=request.result;
          db.onversionchange=function(){db.close();closed=true;};
          resolve(db);
        };
        request.onerror=function(){dbPromise=null;reject(request.error||new Error("INDEXEDDB_OPEN_FAILED"));};
        request.onblocked=function(){dbPromise=null;reject(new Error("INDEXEDDB_OPEN_BLOCKED"));};
      });
      return dbPromise;
    }
    function transaction(mode,work){
      return open().then(function(db){return new Promise(function(resolve,reject){
        var tx;
        try{tx=db.transaction([STORE],mode,{durability:"strict"});}
        catch(e){try{tx=db.transaction([STORE],mode);}catch(inner){reject(inner);return;}}
        var value;
        try{value=work(tx.objectStore(STORE),tx);}catch(e){try{tx.abort();}catch(_){}reject(e);return;}
        tx.oncomplete=function(){resolve(value);};
        tx.onerror=function(){reject(tx.error||new Error("QUEUE_TRANSACTION_FAILED"));};
        tx.onabort=function(){reject(tx.error||new Error("QUEUE_TRANSACTION_ABORTED"));};
      });});
    }
    function validate(item){
      if(!item||typeof item!=="object"||Array.isArray(item)||
        Object.keys(item).some(function(k){return ["eventId","classId","activityId","queuedAt","response"].indexOf(k)===-1;})||
        typeof item.eventId!=="string"||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.eventId)||
        typeof item.classId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(item.classId)||
        typeof item.activityId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(item.activityId)||
        typeof item.queuedAt!=="string"||Number.isNaN(Date.parse(item.queuedAt))||
        !item.response||typeof item.response!=="object"||Array.isArray(item.response)||
        Object.keys(item.response).some(function(k){return ["completed","answerText"].indexOf(k)===-1;})||
        typeof item.response.completed!=="boolean"||
        (item.response.answerText!==undefined&&(typeof item.response.answerText!=="string"||item.response.answerText.length>4000)))
        throw new Error("INVALID_QUEUE_ITEM");
      return JSON.parse(JSON.stringify(item));
    }
    return Object.freeze({
      put:function(item){var safe;try{safe=validate(item);}catch(e){return Promise.reject(e);}
        return transaction("readwrite",function(os){os.add(safe);});
      },
      list:function(){return transaction("readonly",function(os){
        var req=os.getAll();return new Promise(function(resolve,reject){
          req.onsuccess=function(){resolve(req.result||[]);};
          req.onerror=function(){reject(req.error||new Error("QUEUE_READ_FAILED"));};
        });
      }).then(function(value){return value;});},
      acknowledge:function(ids){
        if(!Array.isArray(ids)||ids.some(function(id){return typeof id!=="string";}))
          return Promise.reject(new Error("INVALID_ACKNOWLEDGEMENT_IDS"));
        return transaction("readwrite",function(os){ids.forEach(function(id){os.delete(id);});});
      },
      close:async function(){closed=true;if(dbPromise){try{(await dbPromise).close();}catch(_){}dbPromise=null;}},
      databaseName:dbName
    });
  }
  return Object.freeze({create:create,version:DB_VERSION});
});
