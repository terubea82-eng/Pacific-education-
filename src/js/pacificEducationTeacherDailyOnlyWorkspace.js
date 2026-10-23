/* PacEdu — teacher daily-activities-only workspace.
 * Subject first, then registered classes; reuses the existing linked activity planner.
 * Does not alter learner routes, registration, offline storage, or protected #856 voice.
 */
(function(window,document){
  "use strict";
  var SUBJECTS=["English","Mathematics","Phonics","Science","Social Science","Health","Agriculture","Arts","Technology"];
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
    grid.querySelectorAll("button").forEach(function(b){
      var active=b.getAttribute("data-pacedu-teacher-subject")===subject;
      b.setAttribute("aria-pressed",active?"true":"false");
      b.style.background=active?"#d8efff":"#f7fcff";
      b.style.borderColor=active?"#1877b7":"#7bb9e8";
    });
    list.textContent="";
    var title=node("h3",subject+" — Choose a Class");
    list.appendChild(title);
    var classes=rosterClasses(),items=[];
    Object.keys(classes).forEach(function(id){
      var c=classes[id]||{};
      /* Class choices are shared across subjects. A roster's optional subject
         field must never hide a class when the teacher changes the subject. */
      items.push({id:id,label:String(c.className||c.level||id),level:String(c.level||c.className||"")});
    });
    if(!items.length){
      items.push({id:"",label:"ECE",level:"ECE"});
      for(var i=1;i<=13;i++)items.push({id:"",label:"Class "+i,level:"Class "+i});
      var note=node("p","No registered class list is connected yet. These level choices open the existing pilot daily-activity planner; they do not create school records.");
      note.style.cssText="font-size:.9em;";
      list.appendChild(note);
    }
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
      var b=makeButton(subject,"subject",subject);
      b.addEventListener("click",function(){selectSubject(subject);});
      grid.appendChild(b);
    });
    list.style.cssText="margin:12px 0;";
    var planSubject=document.getElementById("paceduLinkedPlanSubject");
    if(planSubject&&planSubject.parentElement)planSubject.parentElement.style.display="none";
    var planPanel=document.getElementById("pacificEducationLinkedTeacherPlans");
    if(planPanel){planPanel.hidden=true;planPanel.setAttribute("aria-hidden","true");}
    var hint=node("p","One linked workflow: choose a subject, choose any class (ECE–Class 13), then review that class's matching student worksheet, teacher workplan and lesson plan. Print / Save as PDF or download the plan. All generated content requires teacher review.");
    hint.setAttribute("role","note");
    grid.parentNode.insertBefore(hint,grid.nextSibling);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",init);
})(window,document);
