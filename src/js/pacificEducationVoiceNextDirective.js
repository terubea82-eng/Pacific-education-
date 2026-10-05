/* Pacific Education — Voice User Directive for Next + mandatory step guide */
(function (window, document) {
  "use strict";

  var recognition = null;
  var listening = false;
  var globalListening = false;
  var globalRecognition = null;
  var globalRestart = null;
  var globalStopRequested = false;
  var nextButtonId = "";
  var statusId = "";
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function getStatus() {
    return statusId ? document.getElementById(statusId) : null;
  }
  function setStatus(message) {
    var el = getStatus();
    if (el) { el.textContent = message; el.setAttribute("aria-live", "polite"); }
  }
  function stopListening() {
    if (recognition) { try { recognition.stop(); } catch (_) {} }
    listening = false;
    var button = nextButtonId ? document.getElementById(nextButtonId) : null;
    if (button) { button.disabled = false; button.textContent = "🎙️ Voice Next — Say “Next”"; }
  }
  function matchesNextCommand(text) {
    var normalized = String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    return /^(next|next step|continue|go next|next stage|move next|move to next)$/.test(normalized);
  }
  function start(nextId, statusElementId) {
    nextButtonId = nextId; statusId = statusElementId || "";
    var button = document.getElementById(nextId);
    if (!SpeechRecognition) { setStatus("Voice directive is not available in this browser. Use the Next button."); return false; }
    if (listening) { stopListening(); setStatus("Voice directive stopped. Use the button again when ready."); return false; }
    try {
      recognition = new SpeechRecognition(); recognition.lang = "en-US"; recognition.interimResults = false; recognition.continuous = false; recognition.maxAlternatives = 3;
      recognition.onstart = function () { listening = true; if (button) { button.textContent = "🎙️ Listening… Say “Next”"; button.disabled = false; } setStatus("Listening for the voice directive: Next."); if (window.speakText) window.speakText("Listening. Say Next to continue."); };
      recognition.onresult = function (event) {
        var transcript = ""; try { transcript = event.results[0][0].transcript || ""; } catch (_) {}
        if (matchesNextCommand(transcript)) { setStatus("Voice directive accepted: Next."); stopListening(); var nextButton = document.getElementById(nextId); if (nextButton) nextButton.click(); }
        else { setStatus("Voice directive not recognized. Please say Next, then try again."); stopListening(); if (window.speakText) window.speakText("Please say Next to continue."); }
      };
      recognition.onerror = function (event) { stopListening(); var error = event && event.error ? event.error : "unknown"; if (error === "not-allowed" || error === "service-not-allowed") setStatus("Microphone permission is required for Voice Next. You can still use the Next button."); else setStatus("Voice directive could not be heard. Please try again or use Next."); };
      recognition.onend = function () { if (listening) { listening = false; if (button) button.textContent = "🎙️ Voice Next — Say “Next”"; } };
      recognition.start(); return true;
    } catch (error) { stopListening(); setStatus("Voice directive could not start. Please use the Next button."); return false; }
  }

  function globalCommand(text) {
    var normalized = String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    if (/^(install|install pacific education|download pacific education)$/.test(normalized)) {
      if (window.PacificEducationPWAInstall && typeof window.PacificEducationPWAInstall.install === "function") window.PacificEducationPWAInstall.install();
      else speakAndUpdate("Pacific Education is ready on the web. Use your browser Install or Add to Home Screen option."); return;
    }
    var dictation = normalized.match(/^(?:dictate|type|enter|write) (.+)$/);
    if (dictation) { if (fillFocusedField(dictation[1])) speakAndUpdate("Entered the spoken text."); else speakAndUpdate("Focus a text field, then say Dictate followed by your message."); return; }
    var choose = normalized.match(/^choose option ([1-9][0-9]*)$/);
    if (choose) { speakAndUpdate(chooseOption(Number(choose[1])) ? "Option " + choose[1] + " selected." : "That option is not available."); return; }
    if (/^(start voice|start listening|voice on)$/.test(normalized)) { startGlobal(); return; }
    if (/^(stop listening|voice off|stop voice control)$/.test(normalized)) { stopGlobal(); return; }
    if (/^(next|next step|continue|go next|next stage|move next|move to next)$/.test(normalized)) {
      var next = document.querySelector(".pacific-flow-next button:not([hidden])"); if (next) { next.click(); return; }
      var ids = ["welcomeNextButton","registrationNextButton","prototypeNextButton","levelNextButton","subjectNextButton","termNextButton","capabilityNextButton","dailyNextButton","practiceNextButton","assessmentNextButton"];
      for (var i=0;i<ids.length;i++) { var b=document.getElementById(ids[i]); if(b && !b.hidden){b.click();return;} }
      if(window.speakText)window.speakText("Next is not available."); return;
    }
    if (/^(read choices|read options|multiple choice)$/.test(normalized)) {
      var choices=[].slice.call(document.querySelectorAll("input[type=radio],input[type=checkbox],select option")).map(function(e){ var l=e.id?document.querySelector("label[for='"+CSS.escape(e.id)+"']"):null; return String(l?l.textContent:e.textContent||e.getAttribute("aria-label")||e.value||"").replace(/\s+/g," ").trim(); }).filter(Boolean);
      if(window.speakText)window.speakText(choices.length ? "Choices available. "+choices.join(". ") : "No choices are currently available."); return;
    }
    if (/^(read|read page|read screen|read section)$/.test(normalized)) {
      var active=document.querySelector("body.pe-guided-flow main > *:not([hidden])")||document.querySelector("main"); var content=active?String(active.innerText||active.textContent||"").replace(/\s+/g," ").trim():""; if(content && window.speakText)window.speakText(content.slice(0,2400)); return;
    }
    if (/^(sign out|log out|logout)$/.test(normalized)) {
      stopGlobal(); var links=[].slice.call(document.querySelectorAll("button,a,[role=button]")); var sign=links.find(function(e){return /^(sign out|log out|logout)$/i.test(String(e.getAttribute("aria-label")||e.textContent||"").replace(/\s+/g," ").trim());}); if(sign)sign.click(); return;
    }
  }
  function startGlobal() {
    if(!SpeechRecognition){ updateGlobalUI("🎙️ Start Voice Control","Voice recognition is unavailable in this browser. Use the buttons instead."); return false; }
    if(globalListening) return true; globalStopRequested=false;
    try {
      globalRecognition=new SpeechRecognition(); globalRecognition.lang="en-US"; globalRecognition.continuous=false; globalRecognition.interimResults=false; globalRecognition.maxAlternatives=2;
      globalRecognition.onstart=function(){globalListening=true;updateGlobalUI("🎙️ Voice Control: Listening","Voice control listening. Say Next, Read, Read Choices, or Sign Out.");};
      globalRecognition.onresult=function(event){for(var i=event.resultIndex;i<event.results.length;i++){if(event.results[i].isFinal)globalCommand(event.results[i][0].transcript);}};
      globalRecognition.onerror=function(event){globalListening=false;if(globalRestart)clearTimeout(globalRestart);var error=event&&event.error?event.error:"unknown";if(error==="not-allowed"||error==="service-not-allowed")updateGlobalUI("🎙️ Start Voice Control","Allow microphone access, then press Start Voice Control.");else if(error==="audio-capture")updateGlobalUI("🎙️ Start Voice Control","Microphone could not be opened. Check the microphone permission and try again.");else if(error==="no-speech")updateGlobalUI("🎙️ Start Voice Control","No speech was detected. Press Start Voice Control and try again.");else if(error==="network")updateGlobalUI("🎙️ Start Voice Control","Voice recognition needs a supported network service. You can still use the buttons.");else updateGlobalUI("🎙️ Start Voice Control","Voice control could not listen. Press Start Voice Control to try again.");};
      globalRecognition.onend=function(){globalListening=false;if(globalRestart)clearTimeout(globalRestart);updateGlobalUI("🎙️ Start Voice Control","Voice control ready. Press Start Voice Control for the next command.");};
      globalRecognition.start(); return true;
    } catch (_) { globalListening=false; updateGlobalUI("🎙️ Start Voice Control","Voice control ready. Press Start Voice Control if automatic listening was blocked."); return false; }
  }
  function stopGlobal(){globalStopRequested=true;if(globalRestart)clearTimeout(globalRestart);try{if(globalRecognition)globalRecognition.stop();}catch(_){}globalListening=false;updateGlobalUI("🎙️ Start Voice Control","Voice control stopped.");}
  function speakAndUpdate(message){updateGlobalUI(globalListening ? "🎙️ Voice Control: Listening" : "🎙️ Start Voice Control", message);if(window.speakText)window.speakText(message);}
  function fillFocusedField(text){var value=String(text||"").trim();if(!value)return false;var active=document.activeElement;if(!active||!/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))return false;if(active.tagName==="SELECT"){var options=[].slice.call(active.options||[]);var match=options.find(function(o){return String(o.textContent||"").toLowerCase().trim()===value.toLowerCase();});if(match){active.value=match.value;active.dispatchEvent(new Event("change",{bubbles:true}));return true;}return false;}var setter=Object.getOwnPropertyDescriptor(active.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,"value");if(setter&&setter.set)setter.set.call(active,value);else active.value=value;active.dispatchEvent(new Event("input",{bubbles:true}));active.dispatchEvent(new Event("change",{bubbles:true}));return true;}
  function chooseOption(number){var choices=[].slice.call(document.querySelectorAll('input[type="radio"], input[type="checkbox"]')).filter(function(e){return !e.disabled;});var index=Number(number)-1;if(index>=0&&index<choices.length){choices[index].click();return true;}return false;}
  function updateGlobalUI(label,message){var b=document.getElementById("pacificEducationPersistentVoiceButton");var s=document.getElementById("pacificEducationPersistentVoiceStatus");if(b)b.textContent=label;if(s)s.textContent=message;}
  function initGlobalVoiceUI(){var controls=document.getElementById("pacificEducationAccessibilityControls");if(controls&&!document.getElementById("pacificEducationPersistentVoiceButton")){var wrap=document.createElement("div");wrap.style.cssText="display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%;";var b=document.createElement("button");b.type="button";b.id="pacificEducationPersistentVoiceButton";b.textContent="🎙️ Start Voice Control";b.setAttribute("aria-label","Start voice control");var s=document.createElement("span");s.id="pacificEducationPersistentVoiceStatus";s.setAttribute("role","status");s.setAttribute("aria-live","polite");s.textContent="Voice control ready. Press Start Voice Control to use the microphone.";wrap.appendChild(b);wrap.appendChild(s);controls.insertBefore(wrap,controls.firstChild);b.onclick=function(){globalListening?stopGlobal():startGlobal();}}document.addEventListener("click",function(e){var x=e.target&&e.target.closest?e.target.closest("button,a,[role=button]"):null;if(x&&/^(sign out|log out|logout)$/i.test(String(x.getAttribute("aria-label")||x.textContent||"").replace(/\s+/g," ").trim()))stopGlobal();},true);}
  function attach(nextId,statusElementId){var button=document.getElementById(nextId);if(!button||button.dataset.peVoiceNextBound==="true")return;button.dataset.peVoiceNextBound="true";button.setAttribute("aria-label","Voice Next: say Next to continue");button.addEventListener("click",function(event){if(event&&event.detail===0)return;});}

  /* Mandatory step-by-step guidance: highlight one actionable box/control at a time and speak a complete instruction. */
  var guidePanel=null, guideActive=null, guideTimer=null, guideLastSpeech="";
  function guideVisible(el){if(!el||el.hidden)return false;var s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden";}
  function guideSpeak(text){text=String(text||"").replace(/\s+/g," ").trim();if(!text||text===guideLastSpeech)return;guideLastSpeech=text;try{if(window.PacificEducationMandatoryVoiceNavigation&&typeof window.PacificEducationMandatoryVoiceNavigation.speak==="function")window.PacificEducationMandatoryVoiceNavigation.speak(text);else if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")window.PacificEducationSpeech.speakText(text);}catch(_){} }
  function guideStep(){var n=Number(document.body&&document.body.getAttribute("data-pe-flow-step"));return Number.isFinite(n)?n:0;}
  function guidePage(){var pages=window.PacificEducationMandatoryVoiceNavigation&&window.PacificEducationMandatoryVoiceNavigation.pages,n=guideStep();if(pages)for(var i=0;i<pages.length;i++)if(pages[i].step===n)return pages[i].label;return "this page";}
  function guideLabel(el){var id=el.id||"",aria=el.getAttribute("aria-label")||"",ph=el.getAttribute("placeholder")||"",label="";if(id){try{var l=document.querySelector('label[for="'+CSS.escape(id)+'"]');if(l)label=l.textContent;}catch(_){} }return String(aria||label||ph||el.name||id||el.textContent||"the highlighted box").replace(/\s+/g," ").trim();}
  function guideCandidates(){var sels=["input:not([type='hidden']):not([disabled])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])","[role='button']:not([aria-disabled='true'])","[role='option']:not([aria-disabled='true'])"],out=[];sels.forEach(function(sel){document.querySelectorAll(sel).forEach(function(el){if(!guideVisible(el)||el.closest("[data-pe-top-right-voice-controls]"))return;if(el.getAttribute("data-pe-step-guide-ignore")==="true")return;if(out.indexOf(el)<0)out.push(el);});});return out;}
  function guideNav(el){var s=((el.id||"")+" "+(el.textContent||"")).toLowerCase();return /next|previous|back|submit|stop|play|hear instructions|menu|sign out|logout/.test(s);}
  function guideFirst(){var a=guideCandidates();for(var i=0;i<a.length;i++)if(!guideNav(a[i]))return a[i];return a[0]||null;}
  function guidePanelEnsure(){if(guidePanel)return guidePanel;guidePanel=document.createElement("aside");guidePanel.id="pacificEducationStepGuide";guidePanel.setAttribute("role","status");guidePanel.setAttribute("aria-live","polite");guidePanel.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:99998;max-width:760px;margin:auto;padding:12px 14px;border:3px solid currentColor;border-radius:12px;background:Canvas;color:CanvasText;box-shadow:0 4px 16px rgba(0,0,0,.24);font-weight:800;line-height:1.35;";document.body.appendChild(guidePanel);return guidePanel;}
  function guideClear(){if(guideActive){guideActive.classList.remove("pe-step-highlight");guideActive.removeAttribute("data-pe-step-highlight");}guideActive=null;}
  function guideHighlight(el,announce){if(!el)return;guideClear();guideActive=el;el.classList.add("pe-step-highlight");el.setAttribute("data-pe-step-highlight","true");try{el.scrollIntoView({behavior:"smooth",block:"center"});}catch(_){}var a=guideCandidates(),idx=Math.max(0,a.indexOf(el))+1,total=Math.max(1,a.length),label=guideLabel(el),tag=(el.tagName||"").toLowerCase(),action=(tag==="select"||el.getAttribute("role")==="option")?"tap the highlighted selection box and choose the correct option":(tag==="button"||el.getAttribute("role")==="button")?"tap the highlighted button":"tap the highlighted box and enter the requested information";guidePanelEnsure().textContent="Step "+idx+" of "+total+": Tap the highlighted item. Complete it before moving to the next item.";if(announce)guideSpeak("Step "+idx+" of "+total+" on "+guidePage()+". Please "+action+" for "+label+". Complete this step before moving to the next item.");}
  function installGuide(){if(document.body.getAttribute("data-pe-step-guide-installed")==="true")return;document.body.setAttribute("data-pe-step-guide-installed","true");var st=document.createElement("style");st.textContent=".pe-step-highlight{outline:4px solid currentColor!important;outline-offset:5px!important;box-shadow:0 0 0 8px rgba(255,193,7,.40),0 0 18px rgba(0,0,0,.28)!important;position:relative!important;z-index:99997!important}@media(max-width:600px){#pacificEducationStepGuide{font-size:16px;bottom:5px;left:5px;right:5px}}";document.head.appendChild(st);guidePanelEnsure();document.addEventListener("focusin",function(e){if(e.target&&e.target.matches&&e.target.matches("input,select,textarea,button,[role='button'],[role='option']")&&!guideNav(e.target))guideHighlight(e.target,true);},true);document.addEventListener("change",function(e){if(e.target&&e.target.matches&&e.target.matches("input,select,textarea"))setTimeout(function(){var a=guideCandidates(),i=a.indexOf(e.target),n=null;for(var j=i+1;j<a.length;j++)if(!guideNav(a[j])){n=a[j];break;}if(n)guideHighlight(n,true);},180);},true);document.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("button,[role='button'],[role='option']"):null;if(b&&!guideNav(b))setTimeout(function(){var a=guideCandidates(),i=a.indexOf(b),n=null;for(var j=i+1;j<a.length;j++)if(!guideNav(a[j])){n=a[j];break;}if(n)guideHighlight(n,true);},250);},true);function refresh(){if(guideTimer)clearTimeout(guideTimer);guideTimer=setTimeout(function(){var t=guideFirst();if(t&&(!guideActive||!guideVisible(guideActive)))guideHighlight(t,true);},450);}new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","style","class","data-pe-flow-step"]});refresh();}

  window.PacificEducationVoiceNextDirective = Object.freeze({supported:!!SpeechRecognition,start:start,stop:stopListening,matchesNextCommand:matchesNextCommand,attach:attach,startGlobal:startGlobal,stopGlobal:stopGlobal,globalListening:function(){return globalListening;}});
  document.addEventListener("DOMContentLoaded",function(){initGlobalVoiceUI();installGuide();});
  if(document.readyState!=="loading")installGuide();
})(window, document);
