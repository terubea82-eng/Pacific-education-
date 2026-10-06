/* Pacific Education — country + language registration context. Preserves the protected #856 voice controller. */
(function(window, document){
  "use strict";
  var COUNTRY_NAMES={
    FJ:"Fiji",PG:"Papua New Guinea",SB:"Solomon Islands",VU:"Vanuatu",NC:"New Caledonia",PF:"French Polynesia",
    WS:"Samoa",TO:"Tonga",TV:"Tuvalu",KI:"Kiribati",NR:"Nauru",FM:"Federated States of Micronesia",
    MH:"Marshall Islands",PW:"Palau",GU:"Guam",AS:"American Samoa",CK:"Cook Islands",NU:"Niue",TK:"Tokelau",AU:"Australia",NZ:"New Zealand",OTHER:"Other"
  };
  function announce(text){
    if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function"){
      window.PacificEducationSpeech.speakText(text);
    } else if(typeof window.speakText==="function"){ window.speakText(text); }
  }
  function selected(){
    var country=document.getElementById("pacificEducationCountrySelect");
    var language=document.getElementById("pacificEducationLanguageSelect");
    return {country:country,language:language,countryCode:country?country.value:"",languageCode:language?language.value:""};
  }
  function saveContext(){
    var s=selected(), country=s.country, language=s.language, countryCode=s.countryCode, languageCode=s.languageCode;
    if(!country||!language)return {saved:false,reason:"setup boxes not found"};
    try{
      if(countryCode){
        localStorage.setItem("pacificEducationCurriculumCountryCode",countryCode);
        localStorage.setItem("pacificEducationRegistrationCountryCode",countryCode);
        localStorage.setItem("pacificEducationRegistrationCountry",COUNTRY_NAMES[countryCode]||countryCode);
        if(window.PacificEducationCountryConfig && typeof window.PacificEducationCountryConfig.setRegisteredCurriculumLink==="function"){
          window.PacificEducationCountryConfig.setRegisteredCurriculumLink(countryCode);
        }
      }
      if(languageCode){
        localStorage.setItem("pacificEducationRegistrationLanguage",languageCode);
        localStorage.setItem("pacificEducationVoiceLocale",languageCode==="en-AU"||languageCode==="en-FJ"?"en-AU":languageCode);
      }
    }catch(e){ return {saved:false,reason:"browser storage unavailable"}; }
    var cs=document.getElementById("pacificEducationCountryStatus");
    var ls=document.getElementById("pacificEducationLanguageStatus");
    if(cs)cs.textContent=countryCode?"✓ Selected country: "+(COUNTRY_NAMES[countryCode]||countryCode):"⚠ Country required.";
    if(ls)ls.textContent=languageCode?"✓ Selected language: "+(language.options[language.selectedIndex]||{}).text:"⚠ Language required.";
    return {saved:true,countryCode:countryCode,languageCode:languageCode,country:COUNTRY_NAMES[countryCode]||countryCode};
  }
  function validate(){
    var s=selected();
    return {valid:!!(s.countryCode&&s.languageCode),countryCode:s.countryCode,languageCode:s.languageCode};
  }
  function announceSelection(kind){
    var s=selected();
    if(kind==="country"){
      announce(s.countryCode?"Country selected: "+(COUNTRY_NAMES[s.countryCode]||s.countryCode)+".":"Please choose your country.");
    }else{
      announce(s.languageCode?"Language selected: "+(s.language.options[s.language.selectedIndex]||{}).text+".":"Please choose your language.");
    }
  }
  function restore(){
    try{
      var c=localStorage.getItem("pacificEducationRegistrationCountryCode")||"";
      var l=localStorage.getItem("pacificEducationRegistrationLanguage")||"";
      var cs=document.getElementById("pacificEducationCountrySelect"),ls=document.getElementById("pacificEducationLanguageSelect");
      if(cs && c)cs.value=c;
      if(ls && l)ls.value=l;
    }catch(e){}
    return saveContext();
  }
  function bind(){
    var c=document.getElementById("pacificEducationCountrySelect"), l=document.getElementById("pacificEducationLanguageSelect");
    if(!c||!l)return false;
    if(c.getAttribute("data-pe-context-bound")!=="true"){
      c.setAttribute("data-pe-context-bound","true");
      c.addEventListener("change",function(){saveContext();announceSelection("country");});
      c.addEventListener("input",function(){saveContext();});
    }
    if(l.getAttribute("data-pe-context-bound")!=="true"){
      l.setAttribute("data-pe-context-bound","true");
      l.addEventListener("change",function(){saveContext();announceSelection("language");});
      l.addEventListener("input",function(){saveContext();});
    }
    return true;
  }
  function init(){
    if(bind())restore();
    var attempts=0;
    var timer=setInterval(function(){if(bind()||++attempts>=20)clearInterval(timer);},250);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.PacificEducationRegistrationContext={save:saveContext,restore:restore,validate:validate,bind:bind,countries:COUNTRY_NAMES};
})(window,document);