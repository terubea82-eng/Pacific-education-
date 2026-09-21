/* PACIFIC EDUCATION — OFFLINE SERVICE WORKER
 * Prototype only. Cache only explicit same-origin static pilot assets.
 * Never cache APIs, query-string responses, credentials, payments,
 * authentication material, or child-identifying records.
 */
"use strict";
const CACHE_NAME="pacific-education-prototype-src-v6";
const BASE_ASSETS=["./","./index.html","./service-worker.js"];
const normalizeRef=ref=>{
 const clean=String(ref||"").split("?")[0].split("#")[0];
 if(!clean||clean.indexOf("://")!==-1||clean.indexOf("//")===0||clean.indexOf("data:")===0)return null;
 return new URL(clean,self.location.href).pathname.startsWith(self.location.pathname.replace(/service-worker\.js$/,""))
   ? "./"+new URL(clean,self.location.href).pathname.slice(self.location.pathname.replace(/service-worker\.js$/,"").length)
   : null;
};
async function buildCoreAssets(){
 const assets=new Set(BASE_ASSETS);
 try{
  const response=await fetch("./index.html",{cache:"no-store"});
  if(response.ok){
   const html=await response.text();
   const matches=html.matchAll(/<script\b[^>]+src=["']([^"']+)["']/gi);
   for(const match of matches){
    const ref=normalizeRef(match[1]);
    if(ref)assets.add(ref);
   }
  }
 }catch(_){}
 return Array.from(assets);
}
self.addEventListener("install",e=>e.waitUntil(
 buildCoreAssets().then(assets=>caches.open(CACHE_NAME).then(c=>c.addAll(assets))).then(()=>self.skipWaiting())
));
self.addEventListener("activate",e=>e.waitUntil(
 caches.keys().then(keys=>Promise.all(
  keys.filter(k=>k.indexOf("pacific-education-prototype-src-")===0&&k!==CACHE_NAME).map(k=>caches.delete(k))
 )).then(()=>self.clients.claim())
));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const url=new URL(e.request.url),isSameOrigin=url.origin===self.location.origin;
 const base=self.location.pathname.replace(/service-worker\.js$/,"");
 const relative=url.pathname.indexOf(base)===0?url.pathname.slice(base.length)||"/":null;
 if(!isSameOrigin||url.search||url.hash||relative===null)return;
 e.respondWith(
  fetch(e.request).then(r=>{
   if(r&&r.ok)caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone())).catch(()=>{});
   return r;
  }).catch(()=>caches.match(e.request).then(c=>c||new Response("Offline content unavailable",{status:503,statusText:"Offline"})))
 );
});