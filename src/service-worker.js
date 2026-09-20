/* PACIFIC EDUCATION — OFFLINE SERVICE WORKER
 * Prototype only. No authentication, authorization, secrets,
 * payments or child-identifying records are cached.
 */
"use strict";
const CACHE_NAME="pacific-education-prototype-src-v2";
const CORE_ASSETS=["./","./index.html","./js/app.js","./js/dailyLessons.js","./js/dashboards.js","./js/assessments.js","./js/pacificEducationOfflineRuntime.js","./js/pacificEducationAccessibilityRuntime.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(c=>c||new Response("Offline content unavailable",{status:503,statusText:"Offline"}))));});
