/* PACIFIC EDUCATION — OFFLINE SERVICE WORKER
 * Prototype only. Cache only the explicit static assets below.
 * Never cache APIs, query-string responses, credentials, payments,
 * authentication material, or child-identifying records.
 */
"use strict";
const CACHE_NAME="pacific-education-prototype-src-v5";
const CORE_ASSETS=["./","./index.html","./js/app.js","./js/dailyLessons.js","./js/dashboards.js","./js/assessments.js","./js/pacificEducationOfflineRuntime.js","./js/pacificEducationAccessibilityRuntime.js"];
const CACHE_SET=new Set(CORE_ASSETS);
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.indexOf("pacific-education-prototype-src-")===0&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const url=new URL(e.request.url),isSameOrigin=url.origin===self.location.origin;
 const swPath=self.location.pathname,marker="/service-worker.js",base=swPath.indexOf(marker)!==-1?swPath.slice(0,swPath.indexOf(marker)):"/";
 const path=url.pathname,relative=path.indexOf(base)===0?path.slice(base.length)||"/":null;
 const allowed=relative!==null&&(CACHE_SET.has("./"+relative)||relative==="/"&&CACHE_SET.has("./"));
 if(!isSameOrigin||url.search||url.hash||!allowed)return;
 e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(c=>c||new Response("Offline content unavailable",{status:503,statusText:"Offline"}))));
});