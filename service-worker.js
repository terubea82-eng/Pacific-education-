/* PACIFIC EDUCATION — PERFORMANCE/OFFLINE SERVICE WORKER */
"use strict";

const CACHE_NAME="pacific-education-shell-v26";
const ENTRY="/Pacific-education-/src/index.html";
const CACHE_STATUS_MESSAGE="PACIFIC_CACHE_STATUS";
const NAVIGATION_TIMEOUT_MS=6000;
const RUNTIME_REPAIR="/Pacific-education-/src/js/pacificEducationPilotRuntimeRepair.js";
const FRONT_PAGE_REPAIR="/Pacific-education-/src/js/pacificEducationFrontPageRepair.js";

const CORE_ASSETS=[
  "/Pacific-education-/js/pacificEducationCore.js",
  "/Pacific-education-/src/js/pacificEducationSpeechVoice.js",
  "/Pacific-education-/src/js/pacificEducationPWAInstall.js",
  "/Pacific-education-/src/js/pacificEducationVoiceNextDirective.js",
  "/Pacific-education-/src/js/pacificEducationUniversalButtonVoice.js",
  "/Pacific-education-/src/js/pacificEducationAccessibilityRuntime.js",
  "/Pacific-education-/src/js/pacificEducationOfflineRuntime.js",
  "/Pacific-education-/src/js/pacificEducationOfflineSyncController.js",
  "/Pacific-education-/src/js/pacificEducationConnectivity.js",
  "/Pacific-education-/src/js/pacificEducationPerformanceMonitor.js",
  "/Pacific-education-/src/js/pacificEducationPilotRuntimeRepair.js",
  "/Pacific-education-/src/js/pacificEducationFrontPageRepair.js",
  "/Pacific-education-/src/business-advertising.html",
  "/Pacific-education-/src/js/paceduBusinessAdvertising.js?v=20261026-business-advertising",
  "/Pacific-education-/js/pacificEducationAccessibilitySupport.js"
];

function isStatic(request){
  const d=request.destination;
  return d==="script"||d==="style"||d==="image"||d==="font"||d==="worker";
}

function fetchWithTimeout(request,timeoutMs){
  if(typeof AbortController==="undefined")return fetch(request,{cache:"no-store"});
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  return fetch(request,{cache:"no-store",signal:controller.signal}).finally(()=>clearTimeout(timer));
}

function injectRuntimeRepair(response){
  if(!response||!response.ok)return response;
  const type=response.headers.get("content-type")||"";
  if(type.indexOf("text/html")===-1)return response;
  return response.text().then(function(html){
    const tags=[];
    if(html.indexOf("pacificEducationPilotRuntimeRepair.js")===-1)tags.push('<script src="../src/js/pacificEducationPilotRuntimeRepair.js" defer></script>');
    if(html.indexOf("pacificEducationFrontPageRepair.js")===-1)tags.push('<script src="../src/js/pacificEducationFrontPageRepair.js" defer></script>');
    if(!tags.length)return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const updated=html.indexOf("</head>")>=0?html.replace("</head>",tags.join("")+"</head>"):html+tags.join("");
    const headers=new Headers(response.headers);
    headers.delete("content-length");
    return new Response(updated,{status:response.status,statusText:response.statusText,headers:headers});
  }).catch(function(){return response;});
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

self.addEventListener("message",event=>{
  if(event.data&&event.data.type===CACHE_STATUS_MESSAGE){
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache){return cache.keys();}).then(function(keys){
      var urls=keys.map(function(request){return new URL(request.url).pathname;});
      if(event.ports&&event.ports[0])event.ports[0].postMessage({cacheName:CACHE_NAME,entryCached:urls.indexOf(ENTRY)>=0,coreCached:CORE_ASSETS.map(function(url){return {url:url,cached:urls.indexOf(url)>=0};}),cachedCount:urls.length});
    }));
  }
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
    /* Cache each HTML route under its own path. A secondary page must never
       overwrite the offline app entry in ENTRY. Query parameters are excluded
       so stateful entry URLs share the stable HTML shell without storing state. */
    const navigationCacheKey=new Request(url.origin+url.pathname,{method:"GET"});
    const appRoot=ENTRY.replace(/src\/index\.html$/,"");
    const isAppEntry=url.pathname===ENTRY||url.pathname===appRoot||url.pathname===appRoot+"index.html";
    function offlineNavigationResponse(fallbackResponse){
      return caches.match(navigationCacheKey).then(function(cached){
        if(cached)return cached;
        if(isAppEntry){
          return caches.match(ENTRY).then(function(entry){
            return entry||fallbackResponse||new Response("Pacific Education is offline or the connection is taking too long.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
          });
        }
        return fallbackResponse||new Response("This Pacific Education page is not cached for offline use. Connect to the internet and open it once.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
      }).catch(function(){
        return fallbackResponse||new Response("Pacific Education is offline or the connection is taking too long.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
      });
    }
    event.respondWith(
      fetchWithTimeout(request,NAVIGATION_TIMEOUT_MS).then(response=>{
        if(!response.ok)return offlineNavigationResponse(response);
        return injectRuntimeRepair(response).then(function(repaired){
          const copy=repaired.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(navigationCacheKey,copy)).catch(()=>{});
          return repaired;
        });
      }).catch(()=>offlineNavigationResponse(null))
    );
    return;
  }

  if(isStatic(request)){
    /* Keep version query strings in the cache key. Otherwise ?v=... script updates
     still receive the old cached JavaScript on the first load after deployment. */
    const cacheKey=new Request(url.origin+url.pathname+url.search,{method:"GET"});
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
