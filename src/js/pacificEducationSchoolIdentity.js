/* Pacific Education — Pilot School Identity */
(function(window, document) {
  "use strict";
  var VERSION="1.0.0";
  var COUNTRIES=[
    {id:"Fiji",label:"Fiji",prefix:"FJ"},
    {id:"Australia",label:"Australia",prefix:"AU"},
    {id:"New Zealand",label:"New Zealand",prefix:"NZ"},
    {id:"Papua New Guinea",label:"Papua New Guinea",prefix:"PG"},
    {id:"Other",label:"Other country",prefix:""}
  ];
  function get(k,f){return window.localStorage.getItem(k)||f||"";}
  function save(country,name,number){
    window.localStorage.setItem("pacificEducationSchoolCountry",country);
    window.localStorage.setItem("pacificEducationSchoolName",name.trim());
    window.localStorage.setItem("pacificEducationSchoolRegistrationNumber",number.trim());
    document.dispatchEvent(new CustomEvent("pacificEducationSchoolChanged",{detail:{country:country,schoolName:name.trim(),registrationNumber:number.trim(),prototype:true}}));
  }
  function render(id){
    var h=document.getElementById(id||"pacificEducationSchoolIdentity"); if(!h)return false;
    h.innerHTML="<h2>School Details</h2><p>Controlled pilot: use synthetic/demo school details only.</p>"+
      '<label for="pacificEducationSchoolCountry">Country</label><br><select id="pacificEducationSchoolCountry" required></select><br><br>'+
      '<label for="pacificEducationSchoolName">School Name</label><br><input id="pacificEducationSchoolName" type="text" maxlength="160" placeholder="Enter school name" required><br><br>'+
      '<label for="pacificEducationSchoolRegistrationNumber">School Registration Number</label><br><input id="pacificEducationSchoolRegistrationNumber" type="text" maxlength="80" required><p id="pacificEducationSchoolRegistrationHint" aria-live="polite"></p>'+
      "<small>Country-specific guidance is provided here; official registry verification is not performed by the pilot.</small>";
    var c=document.getElementById("pacificEducationSchoolCountry"),n=document.getElementById("pacificEducationSchoolName"),r=document.getElementById("pacificEducationSchoolRegistrationNumber"),hint=document.getElementById("pacificEducationSchoolRegistrationHint");
    COUNTRIES.forEach(function(x){var o=document.createElement("option");o.value=x.id;o.textContent=x.label;c.appendChild(o);});
    c.value=get("pacificEducationSchoolCountry","Fiji"); n.value=get("pacificEducationSchoolName"); r.value=get("pacificEducationSchoolRegistrationNumber");
    function update(){var x=COUNTRIES.filter(function(a){return a.id===c.value;})[0]||COUNTRIES[0];hint.textContent=x.prefix?"Country code: "+x.prefix+" • Enter the registration number used by that country.":"Enter the registration number required by the selected country.";}
    update();
    [c,n,r].forEach(function(e){e.addEventListener("change",function(){save(c.value,n.value,r.value);update();});});
    return true;
  }
  function getProfile(){return {country:get("pacificEducationSchoolCountry","Fiji"),schoolName:get("pacificEducationSchoolName"),registrationNumber:get("pacificEducationSchoolRegistrationNumber"),prototype:true};}
  window.PacificEducationSchoolIdentity=Object.freeze({version:VERSION,countries:COUNTRIES,getProfile:getProfile,save:save,render:render});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window);
