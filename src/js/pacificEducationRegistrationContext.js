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
    }
  }
  function saveContext(){
    var country=document.getElementById("pacificEducationCountrySelect");
    var language=document.getElementById("pacificEducationLanguageSelect");
    if(!country||!language)return;
    var countryCode=country.value, languageCode=language.value;
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
    }catch(e){}
    var cs=document.getElementById("pacificEducationCountryStatus");
    var ls=document.getElementById("pacificEducationLanguageStatus");
    if(cs)cs.textContent=countryCode?"Selected country: "+(COUNTRY_NAMES[countryCode]||countryCode):"Country not selected.";
    if(ls)ls.textContent=languageCode?"Selected language: "+(language.options[language.selectedIndex]||{}).text:"Language not selected.";
  }
  function restore(){
    try{
      var c=localStorage.getItem("pacificEducationRegistrationCountryCode")||"";
      var l=localStorage.getItem("pacificEducationRegistrationLanguage")||"";
      var cs=document.getElementById("pacificEducationCountrySelect"),ls=document.getElementById("pacificEducationLanguageSelect");
      if(cs && c)cs.value=c;
      if(ls && l)ls.value=l;
    }catch(e){}
    saveContext();
  }
  function init(){
    var c=document.getElementById("pacificEducationCountrySelect"), l=document.getElementById("pacificEducationLanguageSelect");
    if(!c||!l)return;
    c.addEventListener("change",function(){saveContext();var name=COUNTRY_NAMES[c.value]||"country";announce("Country selected: "+name+".");});
    l.addEventListener("change",function(){saveContext();var text=l.options[l.selectedIndex]?l.options[l.selectedIndex].text:"language";announce("Language selected: "+text+".");});
    restore();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.PacificEducationRegistrationContext={save:saveContext,restore:restore,countries:COUNTRY_NAMES};
})(window,document);
