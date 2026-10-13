/* Pacific Education — one-at-a-time breathing focus guide.
 * Guides entry, registration, every sequential role-workspace page, and final Sign Out.
 * Additive UI only: the protected #856 speech engine and navigation controllers remain unchanged.
 */
(function(window,document){
"use strict";
var STYLE_ID="pacificEducationBreathingFocusStyle",FOCUS_CLASS="pacific-breathing-focus",LABEL_CLASS="pacific-breathing-focus-label",LOCK_CLASS="pacific-breathing-locked",READY_CLASS="pacific-next-breathing-ready";
var activeTarget=null,activeControl=null,busy=false,lastPageKey="",completed=new WeakSet(),refreshTimer=null;
var IGNORE=/^(back|next|finish|hear this page|stop speech|hear instructions|ai playback|stop narration|refresh mail box|start voice control|normal text|large text|extra large|voice preference|accessibility)$/i;
function injectStyle(){
 if(get(STYLE_ID))return;var s=document.createElement("style");s.id=STYLE_ID;
 s.textContent=".pacific-breathing-focus{position:relative!important;border:3px solid #1597ff!important;box-shadow:0 0 0 4px rgba(21,151,255,.25),0 0 22px rgba(21,151,255,.68)!important;animation:paceduBlueBreathe 1.8s ease-in-out infinite!important;z-index:5!important;border-radius:10px!important}.pacific-breathing-focus-label{display:block;margin:0 0 8px;padding:9px 12px;border-radius:10px;background:#e7f5ff;color:#064b78;font-weight:800;border:2px solid #1597ff}.pacific-breathing-locked{opacity:.55!important;cursor:not-allowed!important}.pacific-next-breathing-ready{animation:paceduGreenBreathe 1.8s ease-in-out infinite!important;box-shadow:0 0 0 3px rgba(22,138,58,.22),0 0 18px rgba(22,138,58,.48)!important}@keyframes paceduBlueBreathe{0%,100%{box-shadow:0 0 0 3px rgba(21,151,255,.2),0 0 12px rgba(21,151,255,.4)}50%{box-shadow:0 0 0 8px rgba(21,151,255,.38),0 0 28px rgba(21,151,255,.8)}}@keyframes paceduGreenBreathe{0%,100%{box-shadow:0 0 0 2px rgba(22,138,58,.18),0 0 8px rgba(22,138,58,.25)}50%{box-shadow:0 0 0 7px rgba(22,138,58,.32),0 0 24px rgba(22,138,58,.65)}}@media(prefers-reduced-motion:reduce){.pacific-breathing-focus,.pacific-next-breathing-ready{animation:none!important}}";
 document.head.appendChild(s);
}
function get(id){return document.getElementById(id);}
function visible(el){if(!el||el.hidden)return false;var s=window.getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&el.getAttribute("aria-hidden")!=="true";}
function labelOf(el){return String(el.getAttribute("aria-label")||el.getAttribute("title")||el.innerText||el.textContent||"").replace(/\s+/g," ").trim();}
function excluded(el){var t=labelOf(el);return IGNORE.test(t)||/^(🔊|🔇|✉️|📬)/.test(t)||el.matches("[data-audio-command-for],#peSequentialHear,#peSequentialStop,#pacificEducationStopSpeechButton,#pacificEducationWelcomeVoiceButton,#pacificEducationAIPlaybackButton");}
function controls(root){return Array.prototype.slice.call((root||document).querySelectorAll('input:not([type="hidden"]),select,textarea,button,[role="button"]')).filter(function(el){return visible(el)&&!el.disabled&&!el.readOnly&&!excluded(el)&&String(el.type||"").toLowerCase()!=="checkbox";});}
function unlockAll(){Array.prototype.forEach.call(document.querySelectorAll("."+LOCK_CLASS),function(el){el.classList.remove(LOCK_CLASS);el.removeAttribute("aria-disabled");if(el.getAttribute("data-pe-breathing-disabled")==="1"){el.removeAttribute("disabled");el.removeAttribute("data-pe-breathing-disabled");}});}
function clearVisuals(){if(activeTarget){activeTarget.classList.remove(FOCUS_CLASS);activeTarget.removeAttribute("data-pe-breathing-active");}Array.prototype.forEach.call(document.querySelectorAll("."+LABEL_CLASS),function(el){el.remove();});Array.prototype.forEach.call(document.querySelectorAll("."+READY_CLASS),function(el){el.classList.remove(READY_CLASS);el.removeAttribute("data-pe-breathing-next-ready");});unlockAll();activeTarget=null;activeControl=null;}
function lockTo(target,root){/* Visual guidance only; preserve existing control and navigation handlers. */}
function boxFor(target){return target.closest(".pe-user-box,#pacificEducationRegistrationBox,.pacedu-entry-card,.pacedu-entry-grid section,.pacedu-agreement,.pe-guided-action-box")||target;}
function showFocus(target,text,root){
 if(!target||!visible(target)||target.disabled)return false;var box=boxFor(target);
 if(activeTarget===box&&activeControl===target){var old=box.querySelector("."+LABEL_CLASS);if(old){if(old.textContent!==text)old.textContent=text;return true;}}
 clearVisuals();lockTo(target,root||target.closest("#pacificEducationIdentityRegistration,#pacificEducationPilotPages,#pacificEducationSequentialRoleWorkspace")||target.parentElement);
 var p=document.createElement("div");p.className=LABEL_CLASS;p.setAttribute("role","status");p.setAttribute("aria-live","polite");p.textContent=text;
 if(box===target)target.parentNode.insertBefore(p,target);else box.insertBefore(p,box.firstChild);
 box.classList.add(FOCUS_CLASS);box.setAttribute("data-pe-breathing-active","true");activeTarget=box;activeControl=target;
 /* Page 4 is user-scrolled: never move the viewport automatically while registration is active. Preserve smooth focus guidance on other pages. */var registrationRoot=box.closest("#pacificEducationIdentityRegistration");if(!registrationRoot){try{box.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}}return true;
}
function nextButton(root){return(root||document).querySelector("#welcomeNextButton,#paceduVisionNext,#paceduRulesContinue,#registrationNextButton,#prototypeNextButton,#levelNextButton,#subjectNextButton,#termNextButton,#capabilityNextButton,#dailyNextButton,#practiceNextButton,#assessmentNextButton,#peSequentialNext");}
function markNextReady(root){var n=nextButton(root);if(n&&!n.disabled&&!n.hidden){n.classList.add(READY_CLASS);n.setAttribute("data-pe-breathing-next-ready","true");}}
function focusEntry(){
 var gateway=document.querySelector("body.pacedu-entry-mode .pacedu-entry-page");if(!visible(gateway))return false;
 var list=controls(gateway),target=null;
 for(var i=0;i<list.length;i++){var el=list[i];if(el.matches("input,select,textarea")){if(!String(el.value||"").trim()){target=el;break;}completed.add(el);}else if(!completed.has(el)){target=el;break;}}
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
 else if(visible(name)&&!String(name.value||"").trim()){target=name;text="STEP 5 — Enter a display name or test name.";}
 else if(visible(save)&&!save.disabled){var saved=false;try{saved=!!sessionStorage.getItem("pacificEducationPilotRegistered");}catch(e){}if(!saved){target=save;text="STEP 6 — Save Pilot Registration, then wait for confirmation.";}}
 if(target)return showFocus(target,text,reg);
 var n=get("registrationNextButton");if(n&&!n.disabled){clearVisuals();n.classList.add(READY_CLASS);n.setAttribute("data-pe-breathing-next-ready","true");}return true;
}
function focusWorkspace(){
 var shell=get("pacificEducationSequentialRoleWorkspace"),page=get("peSequentialPage");if(!visible(shell)||!visible(page))return false;
 var title=get("peSequentialTitle"),key="workspace:"+(title?title.textContent:"");
 if(key!==lastPageKey){lastPageKey=key;completed=new WeakSet();}
 var signOutButton=get("peSequentialSignOutButton"),yes=get("peSequentialSignOutYes"),confirm=get("peSequentialSignOutConfirm");
 if(signOutButton&&visible(signOutButton)&&confirm&&confirm.hidden)return showFocus(signOutButton,"FINAL STEP — Tap Sign Out when you are ready.",shell);
 if(yes&&visible(yes)&&confirm&&!confirm.hidden)return showFocus(yes,"FINAL STEP — Confirm Sign Out to end this pilot session.",shell);
 var list=controls(page),target=null;
 for(var i=0;i<list.length;i++){var el=list[i];if(el.id==="peSequentialNext"||el.id==="peSequentialBack")continue;if(el.matches("input,select,textarea")){if(!String(el.value||"").trim()){target=el;break;}completed.add(el);}else if(!completed.has(el)){target=el;break;}}
 var next=get("peSequentialNext");if(target){if(next){next.classList.remove(READY_CLASS);next.removeAttribute("data-pe-breathing-next-ready");}return showFocus(target,target.matches("input,select,textarea")?"CURRENT STEP — Enter or select information in this highlighted box.":"CURRENT STEP — Use this highlighted control, then continue.",page);}
 clearVisuals();if(next&&!next.disabled&&!next.hidden){next.classList.add(READY_CLASS);next.setAttribute("data-pe-breathing-next-ready","true");}return true;
}
function choose(){if(focusWorkspace())return;if(focusRegistration())return;if(focusEntry())return;clearVisuals();}
function completedAction(event){
 var el=event.target&&event.target.closest?event.target.closest("input:not([type='hidden']),select,textarea,button,[role='button']"):null;if(!el||excluded(el)||el.disabled)return;
 if(el.matches("input,select,textarea")){if(String(el.value||"").trim())completed.add(el);}else if(!/^(next|back|finish)$/i.test(labelOf(el)))completed.add(el);
 setTimeout(refresh,80);
}
function refresh(){if(busy)return;busy=true;try{injectStyle();choose();}finally{busy=false;}}
function init(){
 injectStyle();
 document.addEventListener("input",completedAction,true);document.addEventListener("change",completedAction,true);
 document.addEventListener("click",function(event){var n=event.target&&event.target.closest?event.target.closest("#peSequentialNext,#registrationNextButton,#welcomeNextButton,#paceduVisionNext,#paceduRulesContinue,#peSequentialSignOutButton,#peSequentialSignOutYes"):null;if(n){completed=new WeakSet();lastPageKey="";setTimeout(refresh,120);setTimeout(refresh,450);setTimeout(refresh,900);return;}completedAction(event);},true);
 window.addEventListener("resize",refresh);setTimeout(refresh,250);
 // Catch navigation updates without creating a MutationObserver or changing the protected speech engine.
 if(!refreshTimer)refreshTimer=window.setInterval(function(){var page=get("peSequentialPage"),title=get("peSequentialTitle"),key=page&&title?title.textContent+":"+page.innerHTML.length:"";if(key!==lastPageKey||!activeTarget||!visible(activeTarget))refresh();},700);
}
window.PacificEducationBreathingFocusGuide={version:"1.1.1-all-pages-no-observer",refresh:refresh,clear:clearVisuals};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
