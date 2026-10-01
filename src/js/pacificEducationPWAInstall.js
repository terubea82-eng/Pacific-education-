/* Pacific Education — PWA install experience */
(function(window, document){
  "use strict";
  var deferredPrompt = null;
  var installButtonId = "pacificEducationInstallButton";
  var installStatusId = "pacificEducationInstallStatus";

  function isStandalone(){
    return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  }

  function getButton(){ return document.getElementById(installButtonId); }
  function getStatus(){ return document.getElementById(installStatusId); }

  function announce(message, speak){
    var status=getStatus();
    if(status) status.textContent=message;
    if(speak && window.speakText){
      try{ window.speakText(message); }catch(_){}
    }
  }

  function setInstallVisible(visible){
    var b=getButton();
    if(!b)return;
    b.hidden=!visible;
    b.disabled=!visible;
  }

  async function install(){
    if(!deferredPrompt){
      announce("Pacific Education can be installed from your browser menu when this browser does not provide an in-page install prompt.", true);
      return false;
    }
    var promptEvent=deferredPrompt;
    deferredPrompt=null;
    setInstallVisible(false);
    try{
      var result=await promptEvent.prompt();
      if(result && result.outcome==="accepted"){
        announce("Pacific Education installation accepted. The app will be available from your device.", true);
      }else{
        announce("Pacific Education installation was not completed. You can install it later from the browser.", true);
      }
    }catch(_){
      announce("The install prompt could not be opened. Please use your browser's Install or Add to Home Screen option.", true);
    }
    return true;
  }

  function init(){
    var b=getButton();
    if(b){
      b.addEventListener("click",function(){install();});
      b.addEventListener("keydown",function(e){
        if(e.key==="Enter" || e.key===" "){ e.preventDefault(); install(); }
      });
    }

    if(isStandalone()){
      setInstallVisible(false);
      announce("Pacific Education is running as an installed app.", false);
    }else{
      announce("Pacific Education is ready. If your browser supports installation, the Install button will appear.", false);
    }

    window.addEventListener("beforeinstallprompt",function(event){
      event.preventDefault();
      deferredPrompt=event;
      setInstallVisible(true);
      announce("Pacific Education is ready to install on this device. Press Install Pacific Education.", true);
    });

    window.addEventListener("appinstalled",function(){
      deferredPrompt=null;
      setInstallVisible(false);
      announce("Pacific Education is installed. You can open it from your device like an app.", true);
    });
  }

  window.PacificEducationPWAInstall={install:install,isStandalone:isStandalone};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
