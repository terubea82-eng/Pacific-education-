/* Pacific Education — Universal Button Voice Speaker for accessibility */
(function(window, document){
  "use strict";

  var bound = new WeakSet();

  function labelFor(button){
    var label = button.getAttribute("aria-label") || button.innerText || button.textContent || "";
    return String(label).replace(/\s+/g," ").trim();
  }

  function speakLabel(button){
    var label = labelFor(button);
    if(!label || button.disabled) return false;
    try{
      if(window.PacificEducationVoice && window.PacificEducationVoice.stop) window.PacificEducationVoice.stop();
      if(window.speakText) return window.speakText(label);
    }catch(_){}
    return false;
  }

  function bind(button){
    if(!button || bound.has(button)) return;
    if(button.classList.contains("pacific-voice-speaker") ||
       button.classList.contains("pacific-voice-next-directive")) return;

    bound.add(button);
    button.setAttribute("data-pe-voice-enabled","true");

    var speaker=document.createElement("button");
    speaker.type="button";
    speaker.className="pacific-voice-speaker";
    speaker.textContent="🔊";
    speaker.setAttribute("aria-label","Speak button: "+labelFor(button));
    speaker.setAttribute("title","Speak this button");
    speaker.style.marginLeft="2px";
    speaker.style.minWidth="44px";
    speaker.style.minHeight="44px";
    speaker.addEventListener("click",function(e){
      e.preventDefault();
      e.stopPropagation();
      speakLabel(button);
      return false;
    });

    if(button.parentNode) button.parentNode.insertBefore(speaker,button.nextSibling);
  }

  function scan(root){
    var scope=root && root.querySelectorAll ? root : document;
    Array.prototype.forEach.call(scope.querySelectorAll("button"),bind);
  }

  function init(){
    scan(document);
    var observer=new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes,function(node){
          if(node.nodeType===1){
            if(node.tagName==="BUTTON") bind(node);
            scan(node);
          }
        });
      });
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  window.PacificEducationUniversalButtonVoice={
    speakButton:speakLabel,
    scan:scan
  };

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})(window,document);
