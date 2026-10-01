/* PACIFIC EDUCATION — ROOT OFFLINE SERVICE WORKER
 * Prototype only. Keeps the pilot shell usable while ensuring updated
 * HTML/JavaScript is fetched after a deployment instead of serving stale
 * button handlers from an older cache. Never caches APIs, query-string
 * requests, credentials, payments, authentication material, or child data.
 */
"use strict";
const CACHE_NAME="pacific-education-prototype-root-v4";
const ENTRY="./src/index.html";

async function buildAssets(){
 const assets=new Set(["./","./index.html","./src/index.html","./service-worker.js"]);
 try{
  const response=await fetch(ENTRY,{cache:"no-store"});
  if(response.ok){
   const html=await response.text();
   const matches=html.matchAll(/<script\b[^>]+src=["']([^"']+)["']/gi);
   for(const match of matches){
    const ref=String(match[1]).split("?")[0].split("#")[0];
    if(!ref||ref.indexOf("://")!==-1||ref.indexOf("//")===0||ref.indexOf("data:")===0)continue;
    const u=new URL("./src/"+ref.replace(/^\.\//,""),self.location.href);
    if(u.origin===self.location.origin)assets.add(u.pathname);
   }
  }
 }catch(_){}
 return Array.from(assets);
}

self.addEventListener("install",e=>e.waitUntil(
 buildAssets().then(assets=>caches.open(CACHE_NAME).then(c=>c.addAll(assets))).then(()=>self.skipWaiting())
));

self.addEventListener("activate",e=>e.waitUntil(
 caches.keys().then(keys=>Promise.all(
  keys.filter(k=>k.indexOf("pacific-education-prototype-root-")===0&&k!==CACHE_NAME).map(k=>caches.delete(k))
 )).then(()=>self.clients.claim())
));

self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const url=new URL(e.request.url);
 if(url.origin!==self.location.origin||url.search||url.hash)return;

 e.respondWith(
  caches.open(CACHE_NAME).then(async cache=>{
   try{
    const fresh=await fetch(e.request,{cache:"no-store"});
    if(fresh.ok) cache.put(e.request,fresh.clone());
    return fresh;
   }catch(_){
    const cached=await cache.match(e.request);
    return cached||new Response("Offline content unavailable",{status:503,statusText:"Offline"});
   }
  })
 );
});