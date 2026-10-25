/* Pacific Education — Mandatory step-by-step voice + highlighted guidance
 * Adds a clear visual guide without replacing the existing voice controller.
 * No production/payment changes.
 */
(function(window, document){
  "use strict";
  var active=null, panel=null, timer=null, lastTarget=null, lastMessage="";
  var lastDirective="", lastDirectiveAt=0, manualVoiceUntil=0;

  /* One short page directive is the automatic voice baseline. The highlighted
     step guide remains visual; it must not narrate every focus, click or box. */
  function currentPageIsWelcome(){
    var page=document.getElementById("pacificEducationWelcome");
    return !!(page && !page.hidden && (!window.getComputedStyle || window.getComputedStyle(page).display!=="none"));
  }
  function shortPageDirective(raw){
    var text=String(raw||"").replace(/\s+/g," ").trim();
    if(!text) return "";
    if(/^Step\s+\d+\s+of\s+\d+\s+on\s+/i.test(text)) return "";
    var daily=text.match(/^Step\s+\d+\s+of\s+\d+\.\s+(.+?)\.\s+This daily learning activity is required\./i);
    if(daily) return daily[1]+". Complete today's activity and save your work before pressing Next.";
    var sequential=text.match(/^Step\s+\d+\s+of\s+\d+\.\s+(.+?)\.\s+Follow this numbered step, then press Next\.?$/i);
    if(sequential) return sequential[1]+". Follow this page, then press Next.";
    if(/^Please\s+(?:enter|choose|select|provide|tap)\b/i.test(text) && /\b(?:this box|this selection box|this text area|this answer space|highlighted box|highlighted button|highlighted item|next box)\b/i.test(text)) return "";
    if(/^Step\s+\d+\s+of\s+\d+\s*:/i.test(text)) return "";
    if(/^Welcome to /i.test(text) && !currentPageIsWelcome()){
      var sentences=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
      text=sentences.slice(0,2).join(" ").replace(/\s+/g," ").trim();
      if(text.length>190) text=text.slice(0,187).replace(/\s+\S*$/,"")+"...";
    }
    return text;
  }
  function installShortVoiceDirective(){
    function wrapSpeechObject(){
      var engine=window.PacificEducationSpeech;
      if(engine && typeof engine.speakText==="function" && !engine.speakText.__peShortDirective){
        var original=engine.speakText;
        var wrapped=function(raw){
          var text=shortPageDirective(raw);
          if(!text) return false;
          var now=Date.now(), manual=now<=manualVoiceUntil;
          if(!manual && text===lastDirective && now-lastDirectiveAt<5000) return false;
          if(manual) manualVoiceUntil=0;
          lastDirective=text; lastDirectiveAt=now;
          return original.call(this,text);
        };
        wrapped.__peShortDirective=true; wrapped.__peOriginal=original; engine.speakText=wrapped;
      }
      if(typeof window.speakText==="function" && !window.speakText.__peShortDirective){
        var globalOriginal=window.speakText;
        var globalWrapped=function(raw){
          var text=shortPageDirective(raw);
          if(!text) return false;
          var now=Date.now(), manual=now<=manualVoiceUntil;
          if(!manual && text===lastDirective && now-lastDirectiveAt<5000) return false;
          if(manual) manualVoiceUntil=0;
          lastDirective=text; lastDirectiveAt=now;
          return globalOriginal.call(this,text);
        };
        globalWrapped.__peShortDirective=true; globalWrapped.__peOriginal=globalOriginal; window.speakText=globalWrapped;
      }
    }
    document.addEventListener("click",function(event){
      var control=event.target&&event.target.closest?event.target.closest("button,[role='button']"):null;
      if(control && /hear|listen|play|speak|voice/i.test(String(control.getAttribute("aria-label")||control.textContent||""))) manualVoiceUntil=Date.now()+1800;
    },true);
    wrapSpeechObject();
    window.setTimeout(wrapSpeechObject,300);
    window.setTimeout(wrapSpeechObject,1000);
  }

  function visible(el){
    if(!el || el.hidden) return false;
    var s=window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !(s && (s.display==="none" || s.visibility==="hidden"));
  }
  function speak(text){
    /* The guide is visual-only. Page voice comes from the shared page directive,
       and users can replay it with Hear This Page / Hear Instructions controls. */
    return false;
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
  function effectivePageRoot(){
    var body=document.body;
    if(!body) return null;
    /* The old guide searched the whole document, including hidden pages and
       app-wide controls. This caused counts such as "Step 186 of 299" on Registration. */
    var activeId=body.getAttribute("data-pe-active-guided-page");
    var step=body.getAttribute("data-pe-flow-step");
    var page=activeId ? document.getElementById(activeId) : null;
    if(page && visible(page)) return page;
    if(body.classList.contains("pe-guided-flow") && step==="3"){
      page=document.getElementById("pacificEducationIdentityRegistration");
      if(page && visible(page)) return page;
    }
    if(body.classList.contains("pacedu-registration-mode")){
      page=document.getElementById("pacificEducationIdentityRegistration");
      if(page && visible(page)) return page;
    }
    return body;
  }
  function actuallyVisible(el,root){
    for(var node=el;node;node=node.parentElement){
      if(node.hidden || node.getAttribute("aria-hidden")==="true") return false;
      var style=window.getComputedStyle ? window.getComputedStyle(node) : null;
      if(style && (style.display==="none" || style.visibility==="hidden")) return false;
      if(node===root) break;
    }
    try{ if(typeof el.getClientRects==="function" && el.getClientRects().length===0) return false; }catch(_){}
    return true;
  }
  function candidates(){
    var root=effectivePageRoot();
    if(!root) return [];
    var selectors=[
      "input:not([type='hidden']):not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "[role='button']:not([aria-disabled='true'])",
      "[role='option']:not([aria-disabled='true'])"
    ];
    var all=[];
    selectors.forEach(function(sel){Array.prototype.forEach.call(root.querySelectorAll(sel),function(el){
      if(!actuallyVisible(el,root)) return;
      if(el.closest("[data-pe-top-right-voice-controls]")) return;
      if(el.closest("#pacificEducationStepGuide")) return;
      if(el.closest("#pacificEducationAccessibilityControls")) return;
      if(el.classList.contains("pe-audio-command") || el.closest(".pe-audio-command")) return;
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
  function registrationIsActive(){
    var body=document.body;
    if(!body) return false;
    /* The sequential role workspace has its own page-aware focus guide. On the final Sign Out page, stop this legacy document-wide guide from scrolling other controls into view. */
    var sequentialWorkspace=document.getElementById("pacificEducationSequentialRoleWorkspace");
    var sequentialTitle=document.getElementById("peSequentialTitle");
    if(sequentialWorkspace && visible(sequentialWorkspace) && sequentialTitle && /Sign Out/i.test(String(sequentialTitle.textContent||""))) return true;
    /* Registration is guided-flow step 3 even when the page controller has not
       populated data-pe-active-guided-page yet. The old check missed that state,
       so focus/highlight guidance could call scrollIntoView() and snap the phone
       back to the first role card (Deaf Learner) while the user was scrolling. */
    var registrationStep=body.classList.contains("pe-guided-flow") &&
      String(body.getAttribute("data-pe-flow-step")||"")==="3";
    /* Treat the registration panel's actual rendered visibility as authoritative.
       Page counters/classes can lag during transitions, so relying only on them
       allowed focus guidance to steal the user's scroll position on Page 4. */
    var registrationPanel=document.getElementById("pacificEducationIdentityRegistration");
    var registrationPanelVisible=registrationPanel && actuallyVisible(registrationPanel,body);
    return !!registrationPanelVisible ||
      body.getAttribute("data-pe-active-guided-page")==="pacificEducationIdentityRegistration" ||
      body.classList.contains("pacedu-registration-mode") ||
      registrationStep;
  }
  function highlight(el, announce){
    if(registrationIsActive()){
      clearHighlight();
      if(panel) panel.style.display="none";
      return;
    }
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
      if(registrationIsActive()){
        if(timer)clearTimeout(timer);
        clearHighlight();
        if(panel) panel.style.display="none";
        return;
      }
      if(timer)clearTimeout(timer);
      timer=setTimeout(function(){
        var t=firstTarget();
        if(t && (!active || !visible(active))) highlight(t,true);
      },500);
    }
    new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","style","class","data-pe-flow-step"]});
    refresh();
  }
  function init(){installShortVoiceDirective();install();}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})(window,document);
