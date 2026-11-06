/* PacEdu — teacher daily-activities-only workspace.
 * Subject first, then registered classes; reuses the existing linked activity planner.
 * Does not alter learner routes, registration, offline storage, or protected #856 voice.
 */
(function(window,document){
  "use strict";
  var SUBJECTS=["English","Mathematics","Phonics","Science","Social Science","Health","Agriculture","Arts","Technology","Home Economics","Computer Studies","Vosa Vakaviti (iTaukei)","Fiji Hindi","Urdu","Rotuman"];
  var hostId="teacherDashboard";
  function node(tag,text){var el=document.createElement(tag);if(text!=null)el.textContent=text;return el;}
  function rosterClasses(){
    try{
      var roster=window.PacificEducationTeacherClassRosterContext;
      return roster&&typeof roster.getClasses==="function"?(roster.getClasses()||{}):{};
    }catch(e){return {};}
  }
  function makeButton(label,kind,value){
    var b=node("button",label);b.type="button";b.setAttribute("data-pacedu-teacher-"+kind,value);
    b.style.cssText="min-height:48px;padding:12px 14px;border:2px solid #7bb9e8;border-radius:9px;background:#f7fcff;color:#17324d;font-weight:700;text-align:left;touch-action:manipulation;";
    return b;
  }
  function selectSubject(subject){
    var grid=document.getElementById("paceduTeacherSubjectGrid");
    var list=document.getElementById("paceduTeacherClassList");
    var planPanel=document.getElementById("pacificEducationLinkedTeacherPlans");
    if(!grid||!list)return;
    grid.querySelectorAll("[data-pacedu-teacher-subject]").forEach(function(b){
      var active=b.getAttribute("data-pacedu-teacher-subject")===subject;
      /* Restore the stable subject-box label before applying a class-specific
         display name (for example, Elementary Science or Basic Science). */
      b.textContent=b.getAttribute("data-pacedu-teacher-subject")||b.textContent;
      b.setAttribute("aria-pressed",active?"true":"false");
      b.setAttribute("aria-expanded",active?"true":"false");
      b.style.background=active?"#d8efff":"#f7fcff";
      b.style.borderColor=active?"#1877b7":"#7bb9e8";
    });
    var selectedButton=grid.querySelector('[data-pacedu-teacher-subject="'+subject+'"]');
    var selectedCard=selectedButton&&selectedButton.parentNode;
    if(selectedCard){
      selectedCard.appendChild(list);
      if(planPanel)selectedCard.appendChild(planPanel);
    }
    if(planPanel){planPanel.hidden=true;planPanel.setAttribute("aria-hidden","true");}
    list.hidden=false;
    list.textContent="";
    var title=node("h3",subject+" — Choose a Class");
    list.appendChild(title);
    var resourceGuide=node("p","Choose the matching class to open its daily activities, lesson/workplan and approved teacher resources. Worksheets and teaching aids must match the same subject, class, term and learning objective.");
    resourceGuide.setAttribute("role","note");
    list.appendChild(resourceGuide);
    /* Show the Class 1 English starter pack as soon as English is selected,
       within the Step 2 subject-selection area, before class selection. */
    if(subject==="English"){
      var packCard=node("section");
      packCard.id="paceduClass1EnglishWorksheetPackLink";
      packCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      var packTitle=node("h4","Class 1 English — Downloadable Daily Activities (Days 1–5)");
      var packStatus=node("p","This activity pack is linked to the English subject box. TEACHER REVIEW REQUIRED — official curriculum indicators and sequence are not yet verified.");
      var packLink=node("a","Download Class 1 English Daily Activities");
      packLink.href="https://github.com/terubea82-eng/Pacific-education-/raw/refs/heads/main/docs/curriculum/english-class-1-daily-worksheet-pack.md";
      packLink.setAttribute("download","PacEdu-Class-1-English-Daily-Activities.md");
      packLink.setAttribute("aria-label","Download Class 1 English daily activities for Days 1 to 5");
      packLink.target="_blank";
      packLink.rel="noopener noreferrer";
      packLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      packCard.appendChild(packTitle);
      packCard.appendChild(packStatus);
      packCard.appendChild(packLink);
      list.appendChild(packCard);
    }
    var classes=rosterClasses(),items=[];
    Object.keys(classes).forEach(function(id){
      var c=classes[id]||{};
      /* Class choices are shared across subjects. A roster's optional subject
         field must never hide a class when the teacher changes the subject. */
      items.push({id:id,label:String(c.className||c.level||id),level:String(c.level||c.className||"")});
    });
    if(!items.length){
      items.push({id:"",label:"ECE",level:"ECE"});
      for(var i=1;i<=8;i++)items.push({id:"",label:"Class "+i,level:"Class "+i});
      for(var f=3;f<=7;f++)items.push({id:"",label:"Form "+f,level:"Form "+f});
      var note=node("p","No registered class list is connected yet. These level choices open the existing pilot daily-activity planner; they do not create school records.");
      note.style.cssText="font-size:.9em;";
      list.appendChild(note);
    }
    var mappingNotice=node("p","Select a class to check whether this subject has its own matching learning content.");
    mappingNotice.id="paceduTeacherSubjectMappingNotice";
    mappingNotice.setAttribute("role","status");
    list.appendChild(mappingNotice);
    var gridClasses=node("div");
    gridClasses.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:10px 0 16px;";
    items.forEach(function(item){
      var b=makeButton(item.label,"class",item.id||item.level);
      b.addEventListener("click",function(){
        var panel=document.getElementById("pacificEducationLinkedTeacherPlans");
        var level=document.getElementById("paceduLinkedPlanLevel");
        var subjectSelect=document.getElementById("paceduLinkedPlanSubject");
        if(item.id){
          var roster=window.PacificEducationTeacherClassRosterContext;
          if(roster&&typeof roster.setClassId==="function")roster.setClassId(item.id);
        }
        if(level){
          var option=Array.prototype.find.call(level.options,function(o){return o.value===item.level;});
          if(!option){option=node("option",item.level);option.value=item.level;level.appendChild(option);}
          level.value=item.level;
        }
        if(subjectSelect)subjectSelect.value=subject;
        /* Keep the selected subject/class as one shared context for the learner
           activity, workplan, lesson plan and existing teacher-review controls. */
        try{
          window.localStorage.setItem("pacificEducationSubject",subject);
          window.localStorage.setItem("pacificEducationLevel",item.level);
          window.localStorage.setItem("pacificEducationClassLevel",item.level);
          if(item.id)window.localStorage.setItem("pacificEducationClassId",item.id);
        }catch(e){}
        var planningSubject=document.getElementById("paceduTeacherPlanningSubject");
        if(planningSubject)planningSubject.value=subject;
        var planningClass=document.getElementById("paceduTeacherPlanningClass");
        if(planningClass)planningClass.value=item.level;
        var mappingApi=window.PacEduFijiSubjectMapping||window.PacEduFijiNineSubjectMapping;
        var mapping=mappingApi&&typeof mappingApi.resolve==="function"?mappingApi.resolve(subject,item.level):null;
        var displaySubject=mapping&&mapping.label?mapping.label:subject;
        if(selectedButton) selectedButton.textContent=displaySubject;
        var listTitle=list.querySelector("h3");
        if(listTitle) listTitle.textContent=displaySubject+" — Choose a Class";
        if(mappingNotice){
          mappingNotice.textContent=mapping?mapping.note:"Subject mapping status is unavailable. Ask the curriculum reviewer before using generated content.";
        }
        var packResolver=window.PacEduDownloadableClassPacks&&typeof window.PacEduDownloadableClassPacks.resolveSubject==="function"?window.PacEduDownloadableClassPacks.resolveSubject(subject,item.level):null;
        var contentUnavailable=!!(mapping&&(mapping.status==="missing"||mapping.status==="level-gap"||mapping.contentStatus==="CONTENT_NOT_AVAILABLE"))||!!(packResolver&&!packResolver.available);
        if(contentUnavailable){
          if(panel){panel.hidden=true;panel.setAttribute("aria-hidden","true");}
          if(mappingNotice)mappingNotice.textContent="Learning content is not yet available for "+subject+" — "+item.level+". No other subject's worksheet will be substituted. "+(mapping.note||"");
          list.querySelectorAll("[data-pacedu-teacher-class]").forEach(function(x){x.setAttribute("aria-pressed","false");});
          b.setAttribute("aria-pressed","true");
          b.style.background="#fff3cd";
          return;
        }
        if(mapping&&mapping.status==="partial"&&mappingNotice){
          mappingNotice.textContent="PARTIAL CONTENT — teacher review required. "+mapping.note;
        }
        /* Keep the selected class's daily learning inside its own subject box.
           The shared learner activity keeps the selected subject/class context above. */
        var dailySection=document.getElementById("dailyLesson");
        if(dailySection&&selectedCard){
          var oldDailyHeading=document.getElementById("paceduTeacherSelectedDailyHeading");
          if(oldDailyHeading)oldDailyHeading.remove();
          dailySection.hidden=false;
          dailySection.setAttribute("aria-label",displaySubject+" — "+item.level+" Daily Activities");
          var dailyHeading=node("h3",displaySubject+" — "+item.level+" Daily Activities");
          dailyHeading.id="paceduTeacherSelectedDailyHeading";
          selectedCard.appendChild(dailyHeading);
          selectedCard.appendChild(dailySection);
        }
        if(panel){
          panel.hidden=false;
          panel.removeAttribute("aria-hidden");
          panel.style.removeProperty("display");
          var refreshButton=Array.prototype.find.call(panel.querySelectorAll("button"),function(btn){return /load matching plans/i.test(btn.textContent||"");});
          if(refreshButton)refreshButton.click();
          panel.scrollIntoView({behavior:"smooth",block:"start"});
        }
        list.querySelectorAll("[data-pacedu-teacher-class]").forEach(function(x){x.setAttribute("aria-pressed","false");});
        b.setAttribute("aria-pressed","true");
        b.style.background="#d8efff";
      });
      b.setAttribute("data-pacedu-teacher-class",item.id||item.level);
      gridClasses.appendChild(b);
    });
    list.appendChild(gridClasses);
  }
  function init(){
    var host=document.getElementById(hostId),grid=document.getElementById("paceduTeacherSubjectGrid"),list=document.getElementById("paceduTeacherClassList");
    if(!host||!grid||!list)return;
    /* The role workspace may be inserted or rebuilt after the first DOM-ready
       pass. Reinitialise only when the local subject controls are genuinely gone. */
    if(grid.getAttribute("data-ready")==="true" &&
       grid.querySelector('[data-pacedu-teacher-subject]') &&
       list.isConnected)return;
    grid.removeAttribute("data-ready");
    grid.textContent="";
    list.textContent="";
    grid.setAttribute("data-ready","true");
    grid.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin:14px 0;";
    SUBJECTS.forEach(function(subject){
      var card=node("section");
      card.className="pacedu-teacher-subject-card";
      card.style.cssText="min-width:0;padding:10px;border:1px solid #c8d7e2;border-radius:11px;background:#fff;box-sizing:border-box;";
      var b=makeButton(subject,"subject",subject);
      b.style.width="100%";
      b.setAttribute("aria-expanded","false");
      b.addEventListener("click",function(){selectSubject(subject);});
      card.appendChild(b);
      grid.appendChild(card);
    });
    /* Keep the class/resource panel in the subject-box area from initial load.
       It starts hidden inside the first card, then moves into the selected card. */
    list.hidden=true;
    if(grid.firstElementChild)grid.firstElementChild.appendChild(list);
    list.style.cssText="margin:12px 0;";
    var planSubject=document.getElementById("paceduLinkedPlanSubject");
    if(planSubject&&planSubject.parentElement)planSubject.parentElement.style.display="none";
    var planLevel=document.getElementById("paceduLinkedPlanLevel");
    if(planLevel&&planLevel.parentElement)planLevel.parentElement.style.display="none";
    var planPanel=document.getElementById("pacificEducationLinkedTeacherPlans");
    if(planPanel){planPanel.hidden=true;planPanel.setAttribute("aria-hidden","true");}
    renderDailyLearningOnly(host,grid,list,planPanel);
  }
  /* Keep the teacher step focused on learner activities and their matching
     workplans/lesson plans. Preserve the existing subject/class controls and
     linked-plan generator; remove unrelated teacher forms from this workspace
     without touching registration, role routing, global mailbox, or voice code. */
  function renderDailyLearningOnly(host,grid,list,planPanel){
    if(!host||!grid||!list)return;
    var oldShell=document.getElementById("paceduTeacherDailyLearningOnlyShell");
    if(oldShell)return;
    var shell=node("section");
    shell.id="paceduTeacherDailyLearningOnlyShell";
    shell.setAttribute("aria-label","Student daily activities and matching workplans");
    shell.style.cssText="margin:12px 0;padding:14px;border:1px solid #c8d7e2;border-radius:12px;box-sizing:border-box;";
    var heading=node("h2","My Teaching Workspace — Subject Boxes, Daily Activities & Teacher Resources");
    heading.style.cssText="margin-top:0;";
    shell.appendChild(heading);
    shell.appendChild(node("h2","My Teaching Subject Boxes"));
    shell.appendChild(grid);
    host.textContent="";
    host.appendChild(shell);
    /* Move the linked-plan/resource panel into the first subject card before
       clearing the dashboard. The grid (including its hidden panel) is then
       moved into the clean shell, so nothing is left below the subject boxes. */
    if(planPanel){
      planPanel.hidden=true;
      planPanel.setAttribute("aria-hidden","true");
      if(grid.firstElementChild)grid.firstElementChild.appendChild(planPanel);
    }
    list.textContent="";
  }
  /* STEP 2 clean view: keep the subject boxes and their class selector only.
     Suppress the extra assessment, planning, library, role-task and resource
     panels named in the pilot review. Other app pages and shared modules remain intact. */
  function cleanTeacherStepTwo(){
    var host=document.getElementById(hostId);
    var shell=document.getElementById("paceduTeacherDailyLearningOnlyShell");
    var grid=document.getElementById("paceduTeacherSubjectGrid");
    if(!host||!shell||!grid)return;
    /* Only remove explicitly identified extra panels. Never remove an ancestor
       section based on its text: it may contain the subject grid itself. */
    [
      "paceduAssessmentBlueprintPanel","paceduFijiWeeklyCurriculumPanel",
      "paceduFijiWeeklyCurriculumPreview","paceduWorldLibraryToggle",
      "paceduWorldLibraryPanel","paceduRoleActivityPack",
      "paceduRoleActivityResponse","paceduRoleActivityDone",
      "paceduRoleActivityStatus","paceduLinkedPlanStatus",
      "paceduLinkedPlanContent","paceduLinkedPlanPreview",
      "paceduLinkedPlanPrintableText","paceduLinkedDailyActivityColumn",
      "paceduLinkedWorkplanColumn"
    ].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&host.contains(el)&&!el.contains(grid)&&!el.contains(shell))el.remove();
    });
    host.querySelectorAll('[id*="paceduRoleActivity"],[id*="paceduAssessment"],[id*="paceduFijiWeekly"],[id*="paceduWorldLibrary"],[id*="paceduSeparateDaily"],[id*="paceduDailyResource"]').forEach(function(el){
      if(el!==grid&&el!==shell&&!el.contains(grid)&&!el.contains(shell))el.remove();
    });
  }
  function observeCleanTeacherStepTwo(){
    cleanTeacherStepTwo();
    if(window.MutationObserver&&document.body){
      var cleaning=false;
      var observer=new MutationObserver(function(){
        if(cleaning)return;
        cleaning=true;
        cleanTeacherStepTwo();
        cleaning=false;
      });
      observer.observe(document.getElementById(hostId)||document.body,{childList:true,subtree:true});
    }
  }
  var initQueued=false;
  function scheduleInit(){
    if(initQueued)return;
    initQueued=true;
    window.setTimeout(function(){initQueued=false;init();},0);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scheduleInit,{once:true});
  else scheduleInit();
  window.addEventListener("load",function(){scheduleInit();observeCleanTeacherStepTwo();},{once:true});
  if(document.readyState!=="loading")observeCleanTeacherStepTwo();
  else document.addEventListener("DOMContentLoaded",observeCleanTeacherStepTwo);

  /* Watch only the teacher dashboard and its immediate parent. This recovers
     subject/class controls when the role router replaces that workspace, without
     observing unrelated app-wide mutations. */
  if(window.MutationObserver){
    var dashboardObserver=null;
    var parentObserver=null;
    var observedHost=null;
    var observedParent=null;
    var observerQueued=false;
    function checkTeacherDashboard(){
      observerQueued=false;
      var host=document.getElementById(hostId);
      if(!host)return;
      if(host!==observedHost){
        if(dashboardObserver)dashboardObserver.disconnect();
        if(parentObserver)parentObserver.disconnect();
        observedHost=host;
        observedParent=host.parentNode;
        dashboardObserver=new MutationObserver(function(){
          var current=document.getElementById(hostId);
          var grid=current&&current.querySelector("#paceduTeacherSubjectGrid");
          var list=current&&current.querySelector("#paceduTeacherClassList");
          if(current&&grid&&list&&
             (!grid.querySelector('[data-pacedu-teacher-subject]') ||
              grid.getAttribute("data-ready")!=="true"))queueTeacherCheck();
        });
        dashboardObserver.observe(host,{childList:true,subtree:true});
        if(observedParent){
          parentObserver=new MutationObserver(function(){
            if(document.getElementById(hostId)!==observedHost)queueTeacherCheck();
          });
          parentObserver.observe(observedParent,{childList:true});
        }
      }
      var grid=document.getElementById("paceduTeacherSubjectGrid");
      var list=document.getElementById("paceduTeacherClassList");
      if(grid&&list&&
         (!grid.querySelector('[data-pacedu-teacher-subject]') ||
          grid.getAttribute("data-ready")!=="true" || !list.isConnected))scheduleInit();
    }
    function queueTeacherCheck(){
      if(observerQueued)return;
      observerQueued=true;
      window.setTimeout(checkTeacherDashboard,40);
    }
    checkTeacherDashboard();
  }
  window.PacEduTeacherDailyOnlyWorkspace=Object.freeze({refresh:init});
})(window,document);
