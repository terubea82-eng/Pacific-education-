/* Pacific Education — single narrator compatibility guard
 * Additive adapter: leaves the protected #856 controller untouched while
 * exposing one stable English voice to it for all lines of a conversation.
 */
(function(window){
  "use strict";
  var synth=window.speechSynthesis;
  if(!synth||typeof synth.getVoices!=="function"||synth.__peSingleNarratorGuard)return;
  var originalGetVoices=synth.getVoices.bind(synth);
  var chosen=null;
  function choose(voices){
    voices=Array.isArray(voices)?voices:[];
    var english=voices.filter(function(v){return /^en(?:[-_]|$)/i.test(String(v&&v.lang||""));});
    if(!english.length)return null;
    return english.find(function(v){return /^en[-_]AU$/i.test(String(v.lang||""));})||
      english.find(function(v){return v.default===true;})||english[0]||null;
  }
  function stableVoices(){
    var voices=[];
    try{voices=originalGetVoices()||[];}catch(_){voices=[];}
    if(!chosen||voices.indexOf(chosen)<0)chosen=choose(voices);
    return chosen?[chosen]:[];
  }
  try{
    synth.getVoices=stableVoices;
    Object.defineProperty(synth,"__peSingleNarratorGuard",{value:true,configurable:false});
    if(typeof synth.addEventListener==="function"){
      synth.addEventListener("voiceschanged",function(){chosen=null;stableVoices();});
    }
  }catch(error){
    /* Fail safely: the original protected voice controller remains available. */
  }
})(window);
