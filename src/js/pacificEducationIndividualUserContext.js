/* Pacific Education — Individual User Context Bridge
 * Pilot-safe synthetic context only. Production authentication remains locked.
 * Registration -> individual PacEdu ID -> role dashboard alignment.
 */
(function(window, document){
  'use strict';
  var KEY='pacificEducationIndividualUserContextsV1';
  var CURRENT='pacificEducationCurrentPacEduIdV1';
  var VERSION='1.1.2';
  var ROLE_LABELS={student:'Student',teacher:'Teacher','special-education':'Special Education / Inclusion',parent:'Parent / Caregiver',professional:'Professional Reviewer',ngo:'NGO / Organization',education:'Education / Government',community:'Community / Partner',owner:'Owner / Control','head-of-school':'Head of School','institution-admin':'Institution Administrator'};
  var lastLinkedId='';
  function read(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
  function newId(){return 'PE-PILOT-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();}
  function role(){try{return sessionStorage.getItem('pacificEducationPilotRole')||localStorage.getItem('pacificEducationPilotRole')||'';}catch(e){return '';}}
  function ensure(){
    var r=role();if(!r)return null;
    var all=read(KEY,{}),id='';try{id=localStorage.getItem(CURRENT)||'';}catch(e){}
    var item=id&&all[id];
    if(!item||item.role!==r){
      id=newId();
      item={pacEduId:id,role:r,roleLabel:ROLE_LABELS[r]||'User',country:'',institutionId:'',institutionName:'',classId:'',className:'',programme:'',level:(function(){try{var rr=window.PacificEducationTeacherClassRosterContext;var id=rr&&typeof rr.getClassId==='function'?rr.getClassId():'';var cc=id&&typeof rr.getClass==='function'?rr.getClass(id):null;return cc&&cc.level?String(cc.level):'';}catch(e){return '';}})(),subject:'',term:'',capability:'expected',currentDay:1,progress:{lessonsCompleted:0},assessments:{},preferences:{},registeredAt:new Date().toISOString(),prototypeSession:true};
      all[id]=item;write(KEY,all);try{localStorage.setItem(CURRENT,id);localStorage.setItem('pacificEducationUserId',id);}catch(e){}
    } else {try{localStorage.setItem('pacificEducationUserId',item.pacEduId);}catch(e){}}
    return item;
  }
  function clear(){lastLinkedId='';try{localStorage.removeItem(CURRENT);localStorage.removeItem('pacificEducationUserId');}catch(e){}}
  function refresh(){var item=ensure();if(item&&item.pacEduId!==lastLinkedId){lastLinkedId=item.pacEduId;if(window.PacificEducationIndividualUserAlignment&&typeof window.PacificEducationIndividualUserAlignment.refresh==='function')window.PacificEducationIndividualUserAlignment.refresh();}return item;}
  function init(){
    var registered=false;try{registered=sessionStorage.getItem('pacificEducationPilotRegistered')==='true'||localStorage.getItem('pacificEducationPilotRegistered')==='true';}catch(e){}
    if(registered)setTimeout(refresh,120);
    document.addEventListener('click',function(e){if(e.target&&e.target.id==='pilotSignOutButton')clear();});
    document.addEventListener('pacificEducationSelectionChanged',function(){lastLinkedId='';refresh();});
    var scheduled=false;
    if(window.MutationObserver&&document.body){
      var obs=new MutationObserver(function(){
        if(scheduled)return;scheduled=true;
        setTimeout(function(){scheduled=false;var r=role(),reg=false;try{reg=sessionStorage.getItem('pacificEducationPilotRegistered')==='true'||localStorage.getItem('pacificEducationPilotRegistered')==='true';}catch(e){}if(r&&reg)refresh();},120);
      });
      obs.observe(document.body,{childList:true,subtree:true});
    }
    window.PacificEducationIndividualUserContext={version:VERSION,ensure:ensure,refresh:refresh,clear:clear,publicView:function(){var x=ensure();return x?{pacEduId:x.pacEduId,role:x.role,roleLabel:x.roleLabel,country:x.country,institutionName:x.institutionName,className:x.className,programme:x.programme,level:x.level,subject:x.subject,term:x.term,currentDay:x.currentDay}:null;}};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window,document);
