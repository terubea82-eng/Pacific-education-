/* Pacific Education — one-at-a-time breathing focus guide.
 * Guides entry, registration, every sequential role-workspace page, and final Sign Out.
 * Additive UI only: the protected #856 speech engine and navigation controllers remain unchanged.
 */
(function(window,document){
"use strict";
var STYLE_ID="pacificEducationBreathingFocusStyle",FOCUS_CLASS="pacific-breathing-focus",FINAL_CLASS="pacific-breathing-final-action",LABEL_CLASS="pacific-breathing-focus-label",LOCK_CLASS="pacific-breathing-locked",READY_CLASS="pacific-next-breathing-ready";
var activeTarget=null,activeControl=null,busy=false,lastPageKey="",completed=new WeakSet(),refreshTimer=null;
var IGNORE=/^(back|next|finish|hear this page|stop speech|hear instructions|ai playback|stop narration|refresh mail box|start voice control|normal text|large text|extra large|voice preference|accessibility)$/i;
function injectStyle(){
 if(get(STYLE_ID))return;var s=document.createElement("style");s.id=STYLE_ID;
 s.textContent=".pacific-breathing-focus{position:relative!important;border:3px solid #1597ff!important;box-shadow:0 0 0 4px rgba(21,151,255,.25),0 0 22px rgba(21,151,255,.68)!important;animation:paceduBlueBreathe 1.8s ease-in-out infinite!important;z-index:5!important;border-radius:10px!important}.pacific-breathing-final-action{outline:4px solid #1597ff!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(21,151,255,.25),0 0 20px rgba(21,151,255,.55)!important;border-radius:8px!important}.pacific-breathing-focus-label{display:block;margin:0 0 8px;padding:9px 12px;border-radius:10px;background:#e7f5ff;color:#064b78;font-weight:800;border:2px solid #1597ff}.pacific-breathing-locked{opacity:.55!important;cursor:not-allowed!important}.pacific-next-breathing-ready{animation:paceduGreenBreathe 1.8s ease-in-out infinite!important;box-shadow:0 0 0 3px rgba(22,138,58,.22),0 0 18px rgba(22,138,58,.48)!important}@keyframes paceduBlueBreathe{0%,100%{box-shadow:0 0 0 3px rgba(21,151,255,.2),0 0 12px rgba(21,151,255,.4)}50%{box-shadow:0 0 0 8px rgba(21,151,255,.38),0 0 28px rgba(21,151,255,.8)}}@keyframes paceduGreenBreathe{0%,100%{box-shadow:0 0 0 2px rgba(22,138,58,.18),0 0 8px rgba(22,138,58,.25)}50%{box-shadow:0 0 0 7px rgba(22,138,58,.32),0 0 24px rgba(22,138,58,.65)}}@media(prefers-reduced-motion:reduce){.pacific-breathing-focus,.pacific-next-breathing-ready{animation:none!important;transition:none!important}}@media(forced-colors:active){.pacific-breathing-focus,.pacific-breathing-final-action,.pacific-next-breathing-ready{outline:2px solid Highlight!important;box-shadow:none!important}}";
 document.head.appendChild(s);
}
function get(id){return document.getElementById(id);}
function visible(el){if(!el||el.hidden)return false;var s=window.getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&el.getAttribute("aria-hidden")!=="true";}
function labelOf(el){return String(el.getAttribute("aria-label")||el.getAttribute("title")||el.innerText||el.textContent||"").replace(/\s+/g," ").trim();}
function excluded(el){var t=labelOf(el).replace(/^[^\p{L}\p{N}]+/u,"").trim();return IGNORE.test(t)||/^(🔊|🔇|✉️|📬)/.test(labelOf(el))||el.matches("[data-audio-command-for],[data-pe-back-button=\"true\"],#peSequentialBack,#peSequentialSignOutNo,#peSequentialHear,#peSequentialStop,#pacificEducationStopSpeechButton,#pacificEducationWelcomeVoiceButton,#pacificEducationAIPlaybackButton");}
function controls(root){return Array.prototype.slice.call((root||document).querySelectorAll('input:not([type="hidden"]),select,textarea,button,[role="button"]')).filter(function(el){return visible(el)&&!el.disabled&&!el.readOnly&&!excluded(el)&&String(el.type||"").toLowerCase()!=="checkbox";});}
function mandatoryFields(root){return Array.prototype.slice.call((root||document).querySelectorAll("input:not([type=hidden]),select,textarea")).filter(function(el){if(!visible(el)||el.disabled||el.readOnly)return false;return el.required||el.getAttribute("aria-required")==="true"||el.getAttribute("data-pe-required")==="true"||el.getAttribute("data-mandatory")==="true"||el.hasAttribute("data-pe-cap-answer")||!!el.closest("#levelSelection,#subjectSelection,#termSelection,#capabilitySelection")||/^(pacificEducationLevel|pacificEducationClassReference|pacificEducationSubject|pacificEducationTerm|pacificEducationCapability)$/.test(el.id);});}
function fieldComplete(el){if(!el)return true;var type=String(el.type||"").toLowerCase();if(type==="checkbox"||type==="radio")return !!el.checked;var value=String(el.value||"").trim();return !!value&&(!(typeof el.checkValidity==="function")||el.checkValidity());}
function unlockAll(){Array.prototype.forEach.call(document.querySelectorAll("."+LOCK_CLASS),function(el){el.classList.remove(LOCK_CLASS);el.removeAttribute("aria-disabled");if(el.getAttribute("data-pe-breathing-disabled")==="1"){el.removeAttribute("disabled");el.removeAttribute("data-pe-breathing-disabled");}});}
function clearVisuals(){if(activeTarget){activeTarget.classList.remove(FOCUS_CLASS);activeTarget.classList.remove(FINAL_CLASS);activeTarget.removeAttribute("data-pe-breathing-active");}Array.prototype.forEach.call(document.querySelectorAll("."+LABEL_CLASS),function(el){el.remove();});Array.prototype.forEach.call(document.querySelectorAll("."+READY_CLASS),function(el){el.classList.remove(READY_CLASS);el.removeAttribute("data-pe-breathing-next-ready");});unlockAll();activeTarget=null;activeControl=null;}
function lockTo(target,root){/* Visual guidance only; preserve existing control and navigation handlers. */}
function boxFor(target){return target.closest(".pe-user-box,#pacificEducationRegistrationBox,.pacedu-entry-card,.pacedu-entry-grid section,.pacedu-agreement,.pe-guided-action-box")||target;}
function showFocus(target,text,root){
 if(!target||!visible(target)||target.disabled)return false;var box=boxFor(target);
 if(activeTarget===box&&activeControl===target){var old=box.querySelector("."+LABEL_CLASS);if(old){if(old.textContent!==text)old.textContent=text;return true;}}
 clearVisuals();lockTo(target,root||target.closest("#pacificEducationIdentityRegistration,#pacificEducationPilotPages,#pacificEducationSequentialRoleWorkspace")||target.parentElement);
 var p=document.createElement("div");p.className=LABEL_CLASS;p.setAttribute("role","status");p.setAttribute("aria-live","polite");p.textContent=text;
 if(box===target)target.parentNode.insertBefore(p,target);else box.insertBefore(p,box.firstChild);
 box.classList.add(FOCUS_CLASS);box.setAttribute("data-pe-breathing-active","true");activeTarget=box;activeControl=target;
 /* Registration and final Sign Out are user-scrolled reading surfaces. */var registrationRoot=box.closest("#pacificEducationIdentityRegistration");var finalSignOut=target.id==="peSequentialSignOutButton"||target.id==="peSequentialSignOutYes";/* On the final page, turn off CSS smooth scrolling at the document level before restoring the current position. This cancels any animation still running from the previous guided page; repeated guide refreshes must never pull the reader toward Sign Out. */if(finalSignOut){try{document.documentElement.style.setProperty("scroll-behavior","auto","important");document.body.style.setProperty("scroll-behavior","auto","important");var currentX=window.scrollX,currentY=window.scrollY;window.scrollTo({left:currentX,top:currentY,behavior:"auto"});}catch(e){try{window.scrollTo(window.scrollX,window.scrollY);}catch(ignore){}}}else if(!registrationRoot&&!target.closest("#pacificEducationSequentialRoleWorkspace")){try{box.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}}return true;
}
function nextButton(root){return(root||document).querySelector("#welcomeNextButton,#paceduVisionNext,#paceduRulesContinue,#registrationNextButton,#prototypeNextButton,#levelNextButton,#subjectNextButton,#termNextButton,#capabilityNextButton,#dailyNextButton,#practiceNextButton,#assessmentNextButton,#coverageNextButton,#teacherCalendarNextButton,#peSequentialNext");}
function markNextReady(root){var n=nextButton(root);if(n&&!n.disabled&&!n.hidden){n.classList.add(READY_CLASS);n.setAttribute("data-pe-breathing-next-ready","true");}}
function focusEntry(){
 var gateway=document.querySelector("body.pacedu-entry-mode .pacedu-entry-page");if(!visible(gateway))return false;
 var list=controls(gateway),target=null;
 for(var i=0;i<list.length;i++){var el=list[i];if(el.matches("input,select,textarea")){var value=String(el.value||"").trim();var invalid=typeof el.checkValidity==="function"&&!el.checkValidity();var mandatory=el.required||el.getAttribute("aria-required")==="true";if(!value||(mandatory&&invalid)){target=el;break;}completed.add(el);}else if(!completed.has(el)){target=el;break;}}
 if(target)return showFocus(target,target.matches("input,select,textarea")?"CURRENT STEP — Complete this box, then continue.":"CURRENT STEP — Tap this highlighted control.",gateway);
 clearVisuals();markNextReady(gateway);return true;
}
function focusRegistration(){
 var reg=get("pacificEducationIdentityRegistration");if(!visible(reg)||get("pacificEducationSequentialRoleWorkspace"))return false;
 var country=get("pacificEducationCountrySelect"),language=get("pacificEducationLanguageSelect"),open=get("userRegistrationOpenButton"),cards=get("pilotUserRoleCards"),name=get("pilotRegistrationName"),save=get("pilotRegistrationSaveButton"),role=get("pilotRegistrationRole");
 var selected=!!(role&&String(role.value||"").trim())||!!document.querySelector("#pilotUserRoleCards .pe-user-role-card[aria-pressed='true']");
 var target=null,text="";
 if(visible(country)&&!String(country.value||"").trim()){target=country;text="STEP 1 — Select your country here.";}
 else if(visible(language)&&!String(language.value||"").trim()){target=language;text="STEP 2 — Select your language here.";}
 else if(visible(open)&&!selected){target=open;text="STEP 3 — Tap to open User Registration.";}
 else if(visible(cards)&&!selected){target=cards;text="STEP 4 — Choose one role in this highlighted box.";}
 else if(visible(name)&&(!String(name.value||"").trim()||(name.required&&typeof name.checkValidity==="function"&&!name.checkValidity()))){target=name;text="STEP 5 — Enter a valid display name or test name.";}
 else if(visible(save)&&!save.disabled){var saved=false;try{saved=!!sessionStorage.getItem("pacificEducationPilotRegistered");}catch(e){}if(!saved){target=save;text="STEP 6 — Save Pilot Registration, then wait for confirmation.";}}
 if(target)return showFocus(target,text,reg);
 var n=get("registrationNextButton");if(n&&!n.disabled){clearVisuals();n.classList.add(READY_CLASS);n.setAttribute("data-pe-breathing-next-ready","true");}return true;
}
function focusFinalSignOut(target,page,pageChanged){
 if(activeTarget===target&&target.classList.contains(FINAL_CLASS))return;
 /* Final Sign Out is a reading surface: do not insert labels, change control dimensions, focus it, or scroll to it. Use outline-only styling so the cue cannot change document height and trigger scroll anchoring. */
 clearVisuals();
 if(page){page.style.setProperty("overflow-anchor","none","important");}
 var shell=get("pacificEducationSequentialRoleWorkspace");
 if(shell){shell.style.setProperty("overflow-anchor","none","important");}
 /* Disable viewport scroll anchoring for the whole final reading surface. Anchoring on html/body can otherwise compensate for small layout changes above the reader and move the viewport back toward the bottom. */
 try{document.documentElement.style.setProperty("overflow-anchor","none","important");document.body.style.setProperty("overflow-anchor","none","important");document.documentElement.style.setProperty("scroll-behavior","auto","important");document.body.style.setProperty("scroll-behavior","auto","important");}catch(e){}
 target.classList.add(FINAL_CLASS);target.setAttribute("data-pe-breathing-active","true");activeTarget=target;activeControl=target;
}
function focusWorkspace(){
 var shell=get("pacificEducationSequentialRoleWorkspace"),page=get("peSequentialPage");if(!visible(shell)||!visible(page))return false;
 var title=get("peSequentialTitle"),key="workspace:"+(title?title.textContent:"");
 var pageChanged=key!==lastPageKey;if(pageChanged){lastPageKey=key;completed=new WeakSet();}
 var signOutButton=get("peSequentialSignOutButton"),yes=get("peSequentialSignOutYes"),confirm=get("peSequentialSignOutConfirm");
 /* The Sign Out controls can exist in the DOM while earlier workspace pages are active. Only disable breathing focus on the actual final Sign Out page, so earlier pages still receive their required blue focus or green Next cue. */
 var isFinalSignOutPage=!!(title&&/Sign Out/i.test(title.textContent));
 if(isFinalSignOutPage&&signOutButton&&visible(signOutButton)&&confirm&&confirm.hidden){focusFinalSignOut(signOutButton,page,pageChanged);return true;}
 if(isFinalSignOutPage&&yes&&visible(yes)&&confirm&&!confirm.hidden){focusFinalSignOut(yes,page,pageChanged);return true;}
 var list=mandatoryFields(page),target=null;
 for(var i=0;i<list.length;i++){var el=list[i];if(!fieldComplete(el)){target=el;break;}completed.add(el);}
 var next=get("peSequentialNext");if(target){if(next){next.classList.remove(READY_CLASS);next.removeAttribute("data-pe-breathing-next-ready");}return showFocus(target,"MANDATORY STEP — Complete this required box correctly before moving to the next one.",page);}
 clearVisuals();if(next&&!next.disabled&&!next.hidden){next.classList.add(READY_CLASS);next.setAttribute("data-pe-breathing-next-ready","true");}return true;
}
function focusGuidedPage(){
 var body=document.body;if(!body||!body.classList.contains("pe-guided-flow"))return false;
 var id=body.getAttribute("data-pe-active-guided-page")||"";
 if(!id||id==="pacificEducationIdentityRegistration")return false;
 var root=get(id);if(!visible(root))return false;
 var n=nextButton(root);
 if(!n||n.disabled||n.hidden)return false;
 /* Each guided page gets its own green Next cue. Do not scroll, focus, disable,
    or replace the page controls; navigation remains owned by the single controller. */
 clearVisuals();n.classList.add(READY_CLASS);n.setAttribute("data-pe-breathing-next-ready","true");
 return true;
}
function choose(){if(focusWorkspace())return;if(focusRegistration())return;if(focusEntry())return;if(focusGuidedPage())return;clearVisuals();}
function completedAction(event){
 var el=event.target&&event.target.closest?event.target.closest("input:not([type='hidden']),select,textarea,button,[role='button']"):null;if(!el||excluded(el)||el.disabled)return;
 if(el.matches("input,select,textarea")){if(String(el.value||"").trim())completed.add(el);}else if(!/^(next|back|finish)$/i.test(labelOf(el)))completed.add(el);
 setTimeout(refresh,80);
}
function refresh(){if(busy)return;busy=true;try{injectStyle();choose();}finally{busy=false;}}
function init(){
 injectStyle();
 document.addEventListener("input",completedAction,true);document.addEventListener("change",completedAction,true);
 document.addEventListener("click",function(event){var n=event.target&&event.target.closest?event.target.closest("#peSequentialNext,#registrationNextButton,#welcomeNextButton,#paceduVisionNext,#paceduRulesContinue,#peSequentialSignOutButton,#peSequentialSignOutYes"):null;if(n&&n.id==="peSequentialNext"){var page=get("peSequentialPage"),required=mandatoryFields(page),missing=null;for(var i=0;i<required.length;i++){if(!fieldComplete(required[i])){missing=required[i];break;}}if(missing){event.preventDefault();event.stopImmediatePropagation();showFocus(missing,"MANDATORY STEP — Complete this required box correctly before moving to the next one.",page);return;}}if(n){completed=new WeakSet();lastPageKey="";setTimeout(refresh,120);setTimeout(refresh,450);setTimeout(refresh,900);return;}completedAction(event);},true);
 window.addEventListener("resize",refresh);setTimeout(refresh,250);
 // Catch navigation updates without creating a MutationObserver or changing the protected speech engine.
 if(!refreshTimer)refreshTimer=window.setInterval(function(){var page=get("peSequentialPage"),title=get("peSequentialTitle"),key=page&&title?"workspace:"+title.textContent:"";if(key!==lastPageKey||!activeTarget||!visible(activeTarget))refresh();},700);
}
window.PacificEducationBreathingFocusGuide={version:"1.2.0-mandatory-fields",refresh:refresh,clear:clearVisuals};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
