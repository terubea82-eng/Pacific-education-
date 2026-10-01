/* Pacific Education — lightweight runtime performance monitor.
 * Prototype diagnostics only. No personal or learner data is collected.
 */
(function(window,document){
  "use strict";
  var started=Date.now();
  var SLOW_LOAD_MS=5000;
  var SLOW_DOM_MS=3000;

  function round(value){return Math.round(Number(value||0));}
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
    window.PacificEducationPerformance=data;
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
        (data.connectionType?" • "+data.connectionType:"")+ 
        (data.rttMs!==null?" • RTT "+data.rttMs+" ms":"")+
        (data.slowLoad||data.slowDom?" • Slow-load warning":"")+
        (data.saveData?" • Data-saver on":"");
    }
  }

  window.PacificEducationPerformanceMonitor={collect:collect};

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){setTimeout(render,0);});
  }else{
    setTimeout(render,0);
  }
  window.addEventListener("load",function(){setTimeout(render,0);});
})(window,document);
