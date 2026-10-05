/* Pacific Education — Mandatory step-by-step voice + highlighted guidance
 * Adds a clear visual guide without replacing the existing voice controller.
 * No production/payment changes.
 */
(function(window, document){
  "use strict";
  var active=null, panel=null, timer=null, lastTarget=null, lastMessage="";

  function visible(el){
    if(!el || el.hidden) return false;
    var s=window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !(s && (s.display==="none" || s.visibility==="hidden"));
  }
  function speak(text){
    text=String(text||"").replace(/\s+/g," ").trim();
    if(!text || text===lastMessage) return;
    lastMessage=text;
    try{
      if(window.PacificEducationMandatoryVoiceNavigation && typeof window.PacificEducationMandatoryVoiceNavigation.speak==="function"){
        window.PacificEducationMandatoryVoiceNavigation.speak(text);
      }else if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function"){
        window.PacificEducationSpeech.speakText(text);
      }
    }catch(e){}
  }
  function currentStep(){
    var n=Number(document.body && document.body.getAttribute("data-pe-flow-step"));
    return Number.isFinite(n) ? n : 0;
  }
  function pageLabel(){
    var pages=window.PacificEducationMandatoryVoiceNavigation && window.PacificEducationMandatoryVoiceNavigation.pages;
    var step=currentStep();
    if(pages){for(var i=0;i<pages.length;i++) if(pages[i].step===step) return pages[i].label;}
    return "this page";
  }
  function clearHighlight(){
    if(active){active.classList.remove("pe-step-highlight");active.removeAttribute("data-pe-step-highlight");}
    active=null;
  }
  function ensurePanel(){
    if(panel) return panel;
    panel=document.createElement("aside");
    panel.id="pacificEducationStepGuide";
    panel.setAttribute("aria-live","polite");
    panel.setAttribute("role","status");
    panel.style.cssText="position:fixed;left:10px;right:10px;bottom:10px;z-index:99998;max-width:760px;margin:auto;padding:12px 14px;border:3px solid currentColor;border-radius:12px;background:Canvas;color:CanvasText;box-shadow:0 4px 16px rgba(0,0,0,.24);font-weight:700;line-height:1.35;display:none;";
    document.body.appendChild(panel);
    return panel;
  }
  function setPanel(text){
    var p=ensurePanel();
    p.textContent=text;
    p.style.display="block";
  }
  function candidates(){
    var root=document.body;
    if(!root) return [];
    var selectors=[
      "input:not([type='hidden']):not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled]):not([data-pe-top-right-voice-controls] button)",
      "[role='button']:not([aria-disabled='true'])",
      "[role='option']:not([aria-disabled='true'])"
    ];
    var all=[];
    selectors.forEach(function(sel){Array.prototype.forEach.call(root.querySelectorAll(sel),function(el){
      if(!visible(el)) return;
      if(el.closest("[data-pe-top-right-voice-controls]")) return;
      if(el.getAttribute("data-pe-step-guide-ignore")==="true") return;
      if(all.indexOf(el)<0) all.push(el);
    });});
    return all;
  }
  function isNavigation(el){
    var id=(el.id||"").toLowerCase(), text=(el.textContent||"").toLowerCase();
    return /next|previous|back|submit|stop|play|hear instructions|menu|sign out|logout/.test(id+" "+text);
  }
  function firstTarget(){
    var list=candidates();
    for(var i=0;i<list.length;i++) if(!isNavigation(list[i])) return list[i];
    return list[0]||null;
  }
  function targetLabel(el){
    if(!el) return "the highlighted box";
    var aria=el.getAttribute("aria-label")||"";
    var ph=el.getAttribute("placeholder")||"";
    var id=el.id||"";
    var label="";
    if(id){try{var l=document.querySelector('label[for="'+CSS.escape(id)+'"]');if(l)label=l.textContent;}catch(_) {}}
    return String(aria||label||ph||el.name||id||el.textContent||"the highlighted box").replace(/\s+/g," ").trim();
  }
  function instructionFor(el,number,total){
    var label=targetLabel(el);
    var tag=(el.tagName||"").toLowerCase();
    var type=(el.type||"").toLowerCase();
    var action=(tag==="select"||el.getAttribute("role")==="option") ? "tap the highlighted selection box and choose the correct option" :
      (tag==="button"||el.getAttribute("role")==="button") ? "tap the highlighted button" :
      "tap the highlighted box and enter the requested information";
    return "Step "+number+" of "+total+" on "+pageLabel()+". Please "+action+" for "+label+". Complete this step before moving to the next box.";
  }
  function highlight(el, announce){
    clearHighlight();
    if(!el) return;
    active=el;
    active.classList.add("pe-step-highlight");
    active.setAttribute("data-pe-step-highlight","true");
    try{active.scrollIntoView({behavior:"smooth",block:"center"});}catch(_){}
    var list=candidates(), index=Math.max(0,list.indexOf(el))+1, total=Math.max(1,list.length);
    setPanel("Step "+index+" of "+total+": Tap the highlighted item. Complete it, then continue to the next highlighted item.");
    if(announce) speak(instructionFor(el,index,total));
  }
  function install(){
    if(document.body.getAttribute("data-pe-step-guide-installed")==="true") return;
    document.body.setAttribute("data-pe-step-guide-installed","true");
    var style=document.createElement("style");
    style.textContent=".pe-step-highlight{outline:4px solid currentColor!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(255,193,7,.38),0 0 18px rgba(0,0,0,.28)!important;position:relative!important;z-index:99997!important}.pe-step-highlight::after{content:' TAP HERE';font-weight:800;}@media(max-width:600px){#pacificEducationStepGuide{font-size:16px;bottom:6px;left:6px;right:6px}}";
    document.head.appendChild(style);
    ensurePanel();
    document.addEventListener("focusin",function(e){
      if(e.target && (e.target.matches("input,select,textarea,button,[role='button'],[role='option']"))) highlight(e.target,true);
    },true);
    document.addEventListener("change",function(e){
      if(e.target && (e.target.matches("input,select,textarea"))) setTimeout(function(){
        var list=candidates(), idx=list.indexOf(e.target), next=null;
        for(var i=idx+1;i<list.length;i++){if(!isNavigation(list[i])){next=list[i];break;}}
        if(next) highlight(next,true);
      },180);
    },true);
    document.addEventListener("click",function(e){
      var b=e.target && e.target.closest ? e.target.closest("button,[role='button'],[role='option']") : null;
      if(b && !isNavigation(b)) setTimeout(function(){
        var list=candidates(),idx=list.indexOf(b),next=null;
        for(var i=idx+1;i<list.length;i++){if(!isNavigation(list[i])){next=list[i];break;}}
        if(next) highlight(next,true);
      },250);
    },true);
    function refresh(){
      if(timer)clearTimeout(timer);
      timer=setTimeout(function(){
        var t=firstTarget();
        if(t && (!active || !visible(active))) highlight(t,true);
      },500);
    }
    new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","style","class","data-pe-flow-step"]});
    refresh();
  }
  function init(){install();}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})(window,document);
