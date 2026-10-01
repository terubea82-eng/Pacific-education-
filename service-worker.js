/* PACIFIC EDUCATION — PERFORMANCE/OFFLINE SERVICE WORKER */
"use strict";

const CACHE_NAME="pacific-education-shell-v6";
const ENTRY="/Pacific-education-/src/index.html";
const CORE_ASSETS=[
  "/Pacific-education-/js/pacificEducationCore.js",
  "/Pacific-education-/src/js/pacificEducationSpeechVoice.js",
  "/Pacific-education-/src/js/pacificEducationPWAInstall.js",
  "/Pacific-education-/src/js/pacificEducationVoiceNextDirective.js",
  "/Pacific-education-/src/js/pacificEducationUniversalButtonVoice.js",
  "/Pacific-education-/src/js/pacificEducationAccessibilityRuntime.js",
  "/Pacific-education-/src/js/pacificEducationOfflineRuntime.js",
  "/Pacific-education-/src/js/pacificEducationOfflineSyncController.js",
  "/Pacific-education-/src/js/pacificEducationPerformanceMonitor.js",
  "/Pacific-education-/js/pacificEducationAccessibilitySupport.js"
];

function isStatic(request){
  const d=request.destination;
  return d==="script"||d==="style"||d==="image"||d==="font"||d==="worker";
}

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>{
        const urls=[ENTRY].concat(CORE_ASSETS);
        return Promise.all(urls.map(url=>
          fetch(url,{cache:"no-store"}).then(response=>{
            if(response.ok)return cache.put(new Request(url),response);
            return null;
          }).catch(()=>null)
        ));
      })
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.indexOf("pacific-education-shell-")===0&&k!==CACHE_NAME)
        .map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==="navigate"||request.destination==="document"){
    event.respondWith(
      fetch(request,{cache:"no-store"}).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(ENTRY,copy));
        }
        return response;
      }).catch(()=>caches.match(ENTRY).then(cached=>cached||new Response("Pacific Education is offline.",{status:503})))
    );
    return;
  }

  if(isStatic(request)){
    // Versioned assets such as foo.js?v=123 use one stable cache key.
    // The network request keeps its version query so deployments stay fresh.
    const cacheKey=new Request(url.origin+url.pathname,{method:"GET"});
    event.respondWith(
      caches.match(cacheKey).then(cached=>{
        const refresh=fetch(request,{cache:"no-store"}).then(response=>{
          if(response.ok){
            caches.open(CACHE_NAME).then(cache=>cache.put(cacheKey,response.clone()));
          }
          return response;
        }).catch(()=>null);
        return cached||refresh.then(function(response){return response||new Response("Pacific Education asset unavailable while offline.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});});
      })
    );
  }
});
