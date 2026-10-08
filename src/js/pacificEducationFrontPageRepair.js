/* Pacific Education — Guided UI styling only.
 * The single navigation controller is the sole owner of page-to-page navigation.
 * This file must not bind, intercept, route, scroll, or audit navigation controls.
 * Protected #856 voice and feature engines remain untouched.
 */
(function(window, document){
  "use strict";
/* Green Guided Steps — visual guidance only. Navigation ownership remains single-controller.
 * Visual guidance only: preserves existing #856 voice/navigation behavior.
 */
(function(){
  "use strict";
  var GREEN="#15803d";
  var steps=[
    ["welcomeNextButton","Step 1","Welcome","Next"],
    ["registrationNextButton","Step 2","Student Workspace","Open workspace"],
    ["prototypeNextButton","Step 3","Workspace access","Next"],
    ["levelNextButton","Step 4","Class / Level","Next"],
    ["subjectNextButton","Step 5","Subject","Next"],
    ["termNextButton","Step 6","Term","Next"],
    ["capabilityNextButton","Step 7","Learning capability","Open workspace"]
  ];
  function css(){
    if(document.getElementById("pe-green-guided-style"))return;
    var s=document.createElement("style");s.id="pe-green-guided-style";
    s.textContent=
      ".pe-green-guide{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 4px;font-weight:700;color:"+GREEN+";font-size:1rem}"+
      ".pe-green-guide .pe-green-arrow{font-size:1.35rem;line-height:1}"+
      ".pe-green-guide .pe-green-step{font-weight:800}"+
      ".pacific-flow-next .pe-green-next-button{background:"+GREEN+"!important;color:#fff!important;border:2px solid "+GREEN+"!important;box-shadow:0 2px 5px rgba(0,0,0,.18);font-weight:800!important}"+
      ".pacific-flow-next .pe-green-next-button:focus-visible{outline:4px solid #facc15!important;outline-offset:3px}"+
      ".pe-green-role-hint{margin:8px 0;padding:10px 12px;border-left:5px solid "+GREEN+";background:#f0fdf4;font-weight:700}"+
      "@media(max-width:520px){.pe-green-guide{font-size:.98rem}.pacific-flow-next .pe-green-next-button{width:100%;min-height:62px;font-size:1.15rem}}";
    document.head.appendChild(s);
  }
  function addGuide(button,step,title,label){
    if(!button)return;
    button.classList.add("pe-green-next-button");
    button.setAttribute("data-pe-green-step",step);
    button.setAttribute("aria-label",step+". "+title+". "+label+". Follow the green button to continue.");
    var wrap=button.parentElement;
    if(wrap&&wrap.classList.contains("pacific-flow-next")&&!wrap.querySelector(".pe-green-guide")){
      var g=document.createElement("div");g.className="pe-green-guide";
      g.innerHTML='<span class="pe-green-step">'+step+'</span><span>'+title+'</span><span class="pe-green-arrow" aria-hidden="true">→</span><span>Follow the green button</span>';
      wrap.insertBefore(g,wrap.firstChild);
    }
  }
  function roleHint(){
    var form=document.getElementById("userRegistrationForm");
    if(!form||form.querySelector(".pe-green-role-hint"))return;
    var hint=document.createElement("div");hint.className="pe-green-role-hint";
    hint.setAttribute("role","status");
    hint.textContent="Step 2: Choose your user role, complete the registration boxes, then follow the green Next button.";
    form.insertBefore(hint,form.firstChild);
  }
  function init(){
    css();
    steps.forEach(function(x){addGuide(document.getElementById(x[0]),x[1],x[2],x[3]);});
    roleHint();
    var roleCards=document.querySelectorAll(".pe-user-role-card");
    roleCards.forEach(function(card){
      if(card.getAttribute("data-pe-green-role-bound")==="true")return;
      card.setAttribute("data-pe-green-role-bound","true");
      card.style.borderColor=GREEN;
      card.style.cursor="pointer";
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  [500,1500,3000].forEach(function(ms){setTimeout(init,ms);});
})();
