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
    if(!grid||!list)return;
    grid.querySelectorAll("[data-pacedu-teacher-subject]").forEach(function(b){
      var active=b.getAttribute("data-pacedu-teacher-subject")===subject;
      b.setAttribute("aria-pressed",active?"true":"false");
      b.setAttribute("aria-expanded",active?"true":"false");
      b.style.background=active?"#d8efff":"#f7fcff";
      b.style.borderColor=active?"#1877b7":"#7bb9e8";
    });
    var selectedButton=grid.querySelector('[data-pacedu-teacher-subject="'+subject+'"]');
    var selectedCard=selectedButton&&selectedButton.parentNode;
    if(selectedCard)selectedCard.appendChild(list);
    list.hidden=false;
    list.textContent="";
    var title=node("h3",subject+" — Choose a Class");
    list.appendChild(title);
    /* Show the Class 1 English starter pack as soon as English is selected,
       within the Step 2 subject-selection area, before class selection. */
    if(subject==="English"){
      var packCard=node("section");
      packCard.id="paceduClass1EnglishWorksheetPackLink";
      packCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      var packTitle=node("h4","Class 1 English — Daily Worksheet Pack (Days 1–5)");
      var packStatus=node("p","TEACHER REVIEW REQUIRED — source-informed practice worksheets; official curriculum indicators and sequence are not yet verified.");
      var packLink=node("a","Open Class 1 English worksheet pack");
      packLink.href="https://github.com/terubea82-eng/Pacific-education-/blob/main/docs/curriculum/english-class-1-daily-worksheet-pack.md";
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
    if(!host||!grid||!list||grid.getAttribute("data-ready")==="true")return;
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
    var heading=node("h2","Student Daily Activities & Workplans");
    heading.style.cssText="margin-top:0;";
    shell.appendChild(heading);
    shell.appendChild(node("h2","Subject Boxes"));
    shell.appendChild(grid);
    host.textContent="";
    host.appendChild(shell);
    /* Keep the area below the subject boxes clear. Class choices and matching
       resources are inserted inside the selected subject card by selectSubject().
       The linked-plan panel remains hidden here rather than appearing below. */
    if(planPanel){planPanel.hidden=true;planPanel.setAttribute("aria-hidden","true");}
    list.textContent="";
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",init);
})(window,document);
