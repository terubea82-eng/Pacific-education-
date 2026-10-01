/* Pacific Education — Individual User Dashboard Alignment
 * Pilot-safe: synthetic identity/context only; production auth remains locked.
 */
(function(window, document){
  'use strict';
  var KEY='pacificEducationIndividualUserContextsV1';
  var CURRENT='pacificEducationCurrentPacEduIdV1';
  var VERSION='1.0.1';
  var ROLE_LABELS={student:'Student',teacher:'Teacher','special-education':'Special Education / Inclusion',parent:'Parent / Caregiver',professional:'Professional Reviewer',ngo:'NGO / Organization',education:'Education / Government',community:'Community / Partner',owner:'Owner / Control','head-of-school':'Head of School','institution-admin':'Institution Administrator'};
  var ROUTE_IDS={
    student:['learningPlatform','levelSelection','subjectSelection','termSelection','capabilitySelection','dailyLesson','pacificEducationTermBaseline','assessments','pacificEducationStudentProgressDashboard','pacificEducationHomeSubmission','pacificEducationTransferIntake','pacificGuardianCommentSection'],
    teacher:['teacherDashboard','teacherCalendarSection','pacificEducationTeacherClassDashboard','pacificEducationCoverageDashboard','pacificEducationTeacherEvidence'],
    'special-education':['teacherDashboard','specialEducationDashboard','specialEducationReviewEvidence','pacificEducationTeacherClassDashboard'],
    parent:['parentDashboard','pacificGuardianCommentSection'],
    professional:['pacificEducationExternalReviewerPortal','pacificEducationExternalSpecialistReviewEvidenceRegistry','pacificEducationExternalSpecialistReviewEvidenceLog'],
    ngo:['pacificEducationCoverageDashboard','pacificEducationTeacherEvidence'],
    education:['pacificEducationCoverageDashboard','pacificEducationCurriculumMasterControlStatus','pacificEducationCurriculumEvidenceRegistry','pacificEducationCurriculumEvidenceTraceability'],
    community:['pacificEducationCoverageDashboard'],
    owner:['systemStatus','pacificEducationWebsitePilotChecklist','pacificEducationProductionReleaseChecklist','pacificEducationProductionReleaseEvidenceRegistry','pacificEducationProductionReleaseEvidenceGate','publicationStatus','pacificEducationOfflineSyncStatus'],
    'head-of-school':['pacificEducationSchoolIdentitySection','pacificEducationTeacherClassRoster','pacificEducationExamCalendarSection','pacificEducationCoverageDashboard'],
    'institution-admin':['pacificEducationInstitutionSetup','pacificEducationInstitutionAdvice','pacificEducationExamCalendarSection']
  };
  var aligning=false, lastRole='';
  function read(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
  function newId(){return 'PE-PILOT-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();}
  function getRole(){try{return sessionStorage.getItem('pacificEducationPilotRole')||localStorage.getItem('pacificEducationPilotRole')||'';}catch(e){return '';}}
  function getCurrent(){try{return localStorage.getItem(CURRENT)||'';}catch(e){return '';}}
  function setCurrent(id){try{localStorage.setItem(CURRENT,id);}catch(e){}}
  function contexts(){return read(KEY,{});}
  function ensure(){
    var role=getRole(); if(!role) return null;
    var all=contexts(), id=getCurrent(), item=id&&all[id];
    if(!item || item.role!==role){
      id=newId(); item={pacEduId:id,role:role,roleLabel:ROLE_LABELS[role]||'User',country:'',institutionId:'',institutionName:'',classId:'',className:'',programme:'',level:'Class 1',subject:'English',term:'Term 1',capability:'expected',currentDay:1,progress:{lessonsCompleted:0},assessments:{},preferences:{},registeredAt:new Date().toISOString(),prototypeSession:true}; all[id]=item; write(KEY,all); setCurrent(id);
    }
    return item;
  }
  function update(patch){var item=ensure();if(!item)return null;var all=contexts();item=Object.assign({},item,patch,{updatedAt:new Date().toISOString()});all[item.pacEduId]=item;write(KEY,all);return item;}
  function hideAllRoleSections(role){
    var allowed=ROUTE_IDS[role]||[]; var main=document.getElementById('app'); if(!main)return;
    Array.prototype.forEach.call(main.children,function(el){
      if(['pacificEducationSingleRegistration','pilotBanner','userFirstNavigation','pacificEducationAppTools'].indexOf(el.id)!==-1)return;
      if(el.id && allowed.indexOf(el.id)===-1) el.hidden=true;
    });
    allowed.forEach(function(id){var el=document.getElementById(id);if(el)el.hidden=false;});
  }
  function addIdentityCard(item){
    var entry=document.getElementById('pacificEducationSingleRegistration'); if(!entry)return;
    var old=document.getElementById('pacificIndividualIdentityCard'); if(old)old.remove();
    var card=document.createElement('div'); card.id='pacificIndividualIdentityCard'; card.style.cssText='margin-top:14px;padding:12px;border:1px solid currentColor;border-radius:8px';
    card.innerHTML='<strong>Your dashboard</strong><p style="margin:6px 0"><strong>PacEdu ID:</strong> '+item.pacEduId+'</p><p style="margin:6px 0"><strong>Role:</strong> '+(item.roleLabel||'User')+'</p><p style="margin:6px 0">Your registered workspace is now linked to this dashboard.</p>';
    entry.appendChild(card);
  }
  function align(){
    if(aligning)return; aligning=true;
    try{
      var item=ensure(); if(!item)return;
      hideAllRoleSections(item.role); addIdentityCard(item); lastRole=item.role;
      var label=document.getElementById('teacherStudentName');if(label&&item.role==='teacher')label.textContent=item.className||'Assigned class';
      var day=document.getElementById('teacherCurrentDay');if(day&&item.role==='teacher')day.textContent=String(item.currentDay||1);
      var studentDay=document.getElementById('dailyLessonDay');if(studentDay&&item.role==='student')studentDay.textContent=String(item.currentDay||1);
      var progress=document.getElementById('dailyLessonProgress');if(progress&&item.role==='student')progress.textContent='Day '+(item.currentDay||1)+' of 365 daily activities';
    }finally{aligning=false;}
  }
  function clearCurrent(){try{localStorage.removeItem(CURRENT);}catch(e){}}
  function wireSignOut(){document.addEventListener('click',function(e){if(e.target&&e.target.id==='pilotSignOutButton'){clearCurrent();}});}
  function init(){
    wireSignOut();
    var registered=false;try{registered=sessionStorage.getItem('pacificEducationPilotRegistered')==='true'||localStorage.getItem('pacificEducationPilotRegistered')==='true';}catch(e){}
    if(registered) setTimeout(align,100);
    var scheduled=false;
    var obs=new MutationObserver(function(){
      if(scheduled)return; scheduled=true;
      setTimeout(function(){scheduled=false;var r=getRole();if(r&&r!==lastRole)align();},100);
    });
    if(document.body)obs.observe(document.body,{childList:true,subtree:true});
    window.PacificEducationIndividualUserContext={version:VERSION,ensure:ensure,getCurrent:ensure,update:update,align:align,clearCurrent:clearCurrent,publicView:function(){var x=ensure();return x?{pacEduId:x.pacEduId,role:x.role,roleLabel:x.roleLabel,country:x.country,institutionName:x.institutionName,className:x.className,programme:x.programme,level:x.level,subject:x.subject,term:x.term,currentDay:x.currentDay}:null;}};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window,document);
