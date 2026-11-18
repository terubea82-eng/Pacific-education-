/* PacEdu — country/school local date service for daily worksheets.
 * Uses an explicitly configured school's IANA time zone where available.
 * Falls back to the device zone with a visible warning; never guesses a school
 * time zone from IP/location. Updates at display refresh, visibility/focus,
 * before print, and on a short refresh cycle to cross midnight safely.
 */
(function(window,document){
  "use strict";
  var VERSION="1.0.0";
  var ZONE_KEY="pacificEducationSchoolTimeZone";
  var COUNTRY_KEY="pacificEducationCountry";
  function clean(v){return String(v||"").trim();}
  function country(){
    try{
      var api=window.PacificEducationCountryConfig;
      var state=api&&typeof api.getState==="function"?api.getState():null;
      if(state&&state.country)return clean(state.country);
    }catch(e){}
    try{return clean(localStorage.getItem(COUNTRY_KEY))||"Country not configured";}catch(e){return "Country not configured";}
  }
  function resolveZone(){
    var configured="";
    try{configured=clean(localStorage.getItem(ZONE_KEY));}catch(e){}
    if(configured){
      try{
        new Intl.DateTimeFormat("en",{timeZone:configured}).format(new Date());
        return {timeZone:configured,source:"school",configured:true};
      }catch(e){}
    }
    var deviceZone="";
    try{deviceZone=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}
    if(deviceZone){
      return {timeZone:deviceZone,source:"device",configured:false};
    }
    return {timeZone:"UTC",source:"fallback",configured:false};
  }
  function getSnapshot(now){
    now=now instanceof Date?now:new Date();
    var zone=resolveZone(),dateText,timeText;
    try{
      dateText=new Intl.DateTimeFormat(undefined,{timeZone:zone.timeZone,weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(now);
      timeText=new Intl.DateTimeFormat(undefined,{timeZone:zone.timeZone,hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
    }catch(e){
      zone={timeZone:"UTC",source:"fallback",configured:false};
      dateText=new Intl.DateTimeFormat("en",{timeZone:"UTC",weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(now);
      timeText=new Intl.DateTimeFormat("en",{timeZone:"UTC",hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
    }
    return {country:country(),timeZone:zone.timeZone,date:dateText,time:timeText,
      configured:zone.configured,source:zone.source,
      status:zone.configured?"School time zone configured":"Device time zone in use — school time zone needs confirmation"};
  }
  function fill(root){
    root=root||document;
    var s=getSnapshot();
    function setAll(selector,value){
      root.querySelectorAll(selector).forEach(function(el){el.textContent=value;});
    }
    setAll("[data-pacedu-local-date]",s.date);
    setAll("[data-pacedu-local-time]",s.time);
    setAll("[data-pacedu-country-name]",s.country);
    setAll("[data-pacedu-time-zone]",s.timeZone);
    setAll("[data-pacedu-date-status]",s.status);
    root.querySelectorAll("[data-pacedu-print-date-fields]").forEach(function(el){
      el.setAttribute("data-pacedu-print-country",s.country);
      el.setAttribute("data-pacedu-print-time-zone",s.timeZone);
      el.setAttribute("data-pacedu-print-local-date",s.date);
      el.setAttribute("data-pacedu-print-local-time",s.time);
      el.setAttribute("data-pacedu-print-date-status",s.status);
    });
    return s;
  }
  function refresh(){fill(document);}
  function start(){
    refresh();
    window.addEventListener("focus",refresh);
    window.addEventListener("beforeprint",refresh);
    document.addEventListener("visibilitychange",function(){if(!document.hidden)refresh();});
    document.addEventListener("pacificEducationCountryConfigChanged",refresh);
    window.setInterval(refresh,60000);
  }
  window.PacEduWorksheetLocalDate=Object.freeze({version:VERSION,getSnapshot:getSnapshot,fill:fill,refresh:refresh,zoneStorageKey:ZONE_KEY});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);
  else start();
})(window,document);
