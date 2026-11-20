/* PacEdu — country/school local date service for daily worksheets.
 * Time zones are stored per configured country so a device serving more than
 * one country does not accidentally reuse another school's time zone.
 * Never infer a school's time zone from IP location.
 */
(function(window,document){
  "use strict";
  var VERSION="1.1.0";
  var ZONES_KEY="pacificEducationSchoolTimeZones";
  var LEGACY_ZONE_KEY="pacificEducationSchoolTimeZone";
  var COUNTRY_KEY="pacificEducationCountry";
  function clean(v){return String(v||"").trim();}
  function country(){
    try{
      var api=window.PacificEducationCountryConfig;
      var state=api&&typeof api.getState==="function"?api.getState():null;
      if(state&&state.country)return clean(state.country);
    }catch(e){}
    try{return clean(window.localStorage.getItem(COUNTRY_KEY))||"Country not configured";}catch(e){return "Country not configured";}
  }
  function readZones(){
    try{var value=JSON.parse(window.localStorage.getItem(ZONES_KEY)||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}catch(e){return {};}
  }
  function getSchoolTimeZone(countryName){
    var name=clean(countryName||country());
    var zones=readZones();
    if(name&&clean(zones[name]))return clean(zones[name]);
    /* Migrate the earlier single-country setting to this country's entry. */
    try{
      var legacy=clean(window.localStorage.getItem(LEGACY_ZONE_KEY));
      if(name&&legacy){
        try{new Intl.DateTimeFormat("en",{timeZone:legacy}).format(new Date());zones[name]=legacy;window.localStorage.setItem(ZONES_KEY,JSON.stringify(zones));window.localStorage.removeItem(LEGACY_ZONE_KEY);return legacy;}catch(e){}
      }
    }catch(e){}
    return "";
  }
  function setSchoolTimeZone(zone,countryName){
    zone=clean(zone);var name=clean(countryName||country());
    if(!name||name==="Country not configured")throw new Error("Configure the school country before saving its time zone.");
    if(!zone)throw new Error("Enter the school's IANA time zone.");
    new Intl.DateTimeFormat("en",{timeZone:zone}).format(new Date());
    var zones=readZones();zones[name]=zone;
    window.localStorage.setItem(ZONES_KEY,JSON.stringify(zones));
    window.localStorage.removeItem(LEGACY_ZONE_KEY);
    document.dispatchEvent(new CustomEvent("pacificEducationSchoolTimeZoneChanged",{detail:{country:name,timeZone:zone}}));
    return zone;
  }
  function resolveZone(){
    var configured=getSchoolTimeZone();
    if(configured)return {timeZone:configured,source:"school",configured:true};
    var deviceZone="";
    try{deviceZone=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}
    if(deviceZone)return {timeZone:deviceZone,source:"device",configured:false};
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
      status:zone.configured?"School time zone configured for "+country():"Device time zone in use — configure the school's time zone for "+country()};
  }
  function fill(root){
    root=root||document;
    var s=getSnapshot();
    function setAll(selector,value){root.querySelectorAll(selector).forEach(function(el){el.textContent=value;});}
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
    document.addEventListener("pacificEducationSchoolTimeZoneChanged",refresh);
    window.setInterval(refresh,60000);
  }
  window.PacEduWorksheetLocalDate=Object.freeze({version:VERSION,getSnapshot:getSnapshot,fill:fill,refresh:refresh,getSchoolTimeZone:getSchoolTimeZone,setSchoolTimeZone:setSchoolTimeZone,zoneStorageKey:ZONES_KEY});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})(window,document);
