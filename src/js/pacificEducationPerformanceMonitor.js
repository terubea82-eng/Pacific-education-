/* Pacific Education — lightweight runtime performance monitor.
 * Prototype diagnostics only. No personal or learner data is collected.
 */
(function(window,document){
  "use strict";
  var started=Date.now();

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
      online:navigator.onLine!==false
    };

    paint.forEach(function(entry){
      if(entry.name==="first-paint")result.firstPaintMs=round(entry.startTime);
      if(entry.name==="first-contentful-paint")result.firstContentfulPaintMs=round(entry.startTime);
    });

    return result;
  }

  function render(){
    var data=collect();
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
        " • Scripts "+(data.scriptCount===null?"n/a":data.scriptCount);
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
