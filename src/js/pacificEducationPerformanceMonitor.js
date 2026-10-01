/* Pacific Education — lightweight runtime performance monitor.
 * Prototype diagnostics only. No personal or learner data is collected.
 */
(function(window,document){
  "use strict";
  var started=Date.now();
  var SLOW_LOAD_MS=5000;
  var SLOW_DOM_MS=3000;
  var MAX_SLOW_SAMPLES=20;
  var samples=[];

  function round(value){return Math.round(Number(value||0));}
  function announceReady(result){
  try{window.dispatchEvent(new CustomEvent("pacific:performance-ready",{detail:result||{}}));}catch(e){}
}

function collect(){
    var nav=(window.performance&&performance.getEntriesByType)?performance.getEntriesByType("navigation")[0]:null;
    var paint=(window.performance&&performance.getEntriesByType)?performance.getEntriesByType("paint"):[];

    var result={
      supported:!!window.performance,
      navigationStart:started,
      domContentLoadedMs:nav?round(nav.domContentLoadedEventEnd):null,
      loadEventMs:nav?round(nav.loadEventEnd):null,
      responseMs:nav?round(nav.responseEnd-nav.requestStart):null,
      transferSize:nav&&typeof nav.transferSize==="number"?nav.transferSize:null,
      firstPaintMs:null,
      firstContentfulPaintMs:null,
      scriptCount:document.scripts?document.scripts.length:null,
      online:navigator.onLine!==false,
      slowLoad:false,
      slowDom:false,
      connectionType:null,
      rttMs:null,
      saveData:false
    };

    paint.forEach(function(entry){
      if(entry.name==="first-paint")result.firstPaintMs=round(entry.startTime);
      if(entry.name==="first-contentful-paint")result.firstContentfulPaintMs=round(entry.startTime);
    });

    return result;
  }

  function average(values){if(!values.length)return null;return Math.round(values.reduce(function(a,b){return a+b;},0)/values.length);}
  function capacitySummary(){
    var valid=samples.filter(function(x){return x&&typeof x.loadEventMs==="number";});
    var loads=valid.map(function(x){return x.loadEventMs;}).sort(function(a,b){return a-b;});
    var p95=null;
    if(loads.length)p95=loads[Math.min(loads.length-1,Math.ceil(loads.length*0.95)-1)];
    return {sampleCount:valid.length,averageLoadMs:average(loads),p95LoadMs:p95,slowSamples:valid.filter(function(x){return (x.loadEventMs||0)>SLOW_LOAD_MS;}).length};
  }

function summary(){
    var valid=samples.filter(function(x){return x&&typeof x.loadEventMs==="number";}).map(function(x){return x.loadEventMs;});
    return {sampleCount:samples.length,averageLoadMs:average(valid),slowSamples:samples.filter(function(x){return (x.loadEventMs||0)>SLOW_LOAD_MS||(x.domContentLoadedMs||0)>SLOW_DOM_MS;}).length};
  }

  function render(){
    var data=collect();
    data.cacheStatus=("serviceWorker"in navigator) ? "Service worker supported" : "Service worker unavailable";
    data.slowLoad=data.loadEventMs!==null&&data.loadEventMs>SLOW_LOAD_MS;
    data.slowDom=data.domContentLoadedMs!==null&&data.domContentLoadedMs>SLOW_DOM_MS;
    var connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(connection){
      data.connectionType=connection.effectiveType||null;
      data.rttMs=typeof connection.rtt==="number"?connection.rtt:null;
      data.saveData=connection.saveData===true;
    }
    samples.push({at:new Date().toISOString(),domContentLoadedMs:data.domContentLoadedMs,loadEventMs:data.loadEventMs,connectionType:data.connectionType,rttMs:data.rttMs,online:data.online});
    if(samples.length>MAX_SLOW_SAMPLES)samples.shift();
    data.sampleCount=samples.length;
    data.recentSamples=samples.slice();
    data.summary=summary();
    data.capacitySummary=capacitySummary();
    window.PacificEducationPerformance=data;
    announceReady(data);
    var status=document.getElementById("systemStatus");
    if(status){
      var target=status.querySelector("[data-pacific-performance]");
      if(!target){
        target=document.createElement("div");
        target.setAttribute("data-pacific-performance","true");
        target.style.marginTop="10px";
        status.appendChild(target);
      }
      target.textContent="Runtime performance: DOM "+(data.domContentLoadedMs===null?"n/a":data.domContentLoadedMs+" ms")+
        " • Load "+(data.loadEventMs===null?"n/a":data.loadEventMs+" ms")+
        " • Scripts "+(data.scriptCount===null?"n/a":data.scriptCount)+
        " • "+data.cacheStatus+
        (data.summary.sampleCount?" • Samples "+data.summary.sampleCount:"")+
        (data.connectionType?" • "+data.connectionType:"")+ 
        (data.rttMs!==null?" • RTT "+data.rttMs+" ms":"")+
        (data.slowLoad||data.slowDom?" • Slow-load warning":"")+
        (data.saveData?" • Data-saver on":"");
    }
  }

  window.PacificEducationPerformanceMonitor={collect:collect,getSamples:function(){return samples.slice();},getSummary:summary,getCapacitySummary:capacitySummary,clearSamples:function(){samples=[];return true;},cacheStatus:function(){return new Promise(function(resolve){if(!navigator.serviceWorker||!navigator.serviceWorker.controller){resolve({supported:!!navigator.serviceWorker,controlled:false});return;}var channel=new MessageChannel();channel.port1.onmessage=function(event){resolve(event.data||{});};navigator.serviceWorker.controller.postMessage({type:"PACIFIC_CACHE_STATUS"},[channel.port2]);});}};

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){setTimeout(render,0);});
  }else{
    setTimeout(render,0);
  }
  window.addEventListener("load",function(){setTimeout(render,0);});
})(window,document);
