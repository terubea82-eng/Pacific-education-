/*
 * Pacific Education
 * Expanded Class 7–13 (Form 1–7) Pilot Activity UI
 * Version 1.0.0
 *
 * Teacher-testing interface for the expanded subject catalog.
 * PROTOTYPE ONLY. Activities are not official curriculum prescriptions.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var STORAGE_KEY="pacificEducationExpandedActivityIndex";

    function catalog(){
        return window.PacificEducationExpandedSubjectCatalog||null;
    }

    function selection(){
        var level=window.localStorage.getItem("pacificEducationLevel")||"Class 1";
        var subject=window.localStorage.getItem("pacificEducationSubject")||"English";
        return {level:level,subjectId:subject};
    }

    function isExpanded(level){
        return /^Class (?:[7-9]|1[0-3])$/.test(level);
    }

    function getIndex(){
        var n=Number(window.localStorage.getItem(STORAGE_KEY)||"0");
        return Number.isInteger(n)&&n>=0?n:0;
    }

    function setIndex(n){
        window.localStorage.setItem(STORAGE_KEY,String(n));
    }

    function escapeText(value){
        return String(value==null?"":value);
    }

    function render(){
        var host=document.getElementById("pacificEducationExpandedActivityUI");
        var c=catalog();
        if(!host||!c)return false;

        var s=selection();
        if(!isExpanded(s.level)){
            host.innerHTML="<h2>Class 7–13 (Form 1–7) Pilot Activities</h2><p>Select Class 7–13 (Form 1–7) to use the expanded subject activity catalog. Class 1–6 continue using the existing learning flow.</p>";
            return true;
        }

        var records=c.list({level:s.level,subjectId:s.subjectId});
        if(!records.length){
            host.innerHTML="<h2>Class 7–13 (Form 1–7) Pilot Activities</h2><p>No expanded pilot activity is currently listed for this selection.</p>";
            return true;
        }

        var index=Math.min(getIndex(),records.length-1);
        setIndex(index);
        var activity=records[index];

        host.innerHTML="";
        var title=document.createElement("h2");
        title.textContent=s.subjectId+" — "+s.level+" Pilot Activity";
        var notice=document.createElement("p");
        notice.innerHTML="<strong>PILOT PROTOTYPE — Curriculum Verification Required</strong>. Do not treat this activity as an official Fiji curriculum prescription.";
        var counter=document.createElement("p");
        counter.textContent="Activity "+(index+1)+" of "+records.length+" • "+activity.topic;

        var instruction=document.createElement("p");
        instruction.textContent=activity.instruction;

        var task=document.createElement("p");
        task.textContent="Teacher testing task: "+activity.teacherTask;

        var feedback=document.createElement("textarea");
        feedback.id="pacificEducationExpandedActivityFeedback";
        feedback.rows=4;
        feedback.placeholder="Prototype feedback only: clarity, level suitability, curriculum-alignment issues or corrections. Do not enter real child information.";
        feedback.setAttribute("aria-label","Prototype teacher feedback");

        var status=document.createElement("p");
        status.id="pacificEducationExpandedActivityStatus";
        status.setAttribute("aria-live","polite");

        var prev=document.createElement("button");
        prev.type="button";
        prev.textContent="Previous activity";
        prev.disabled=index===0;
        prev.onclick=function(){setIndex(Math.max(0,index-1));render();};

        var next=document.createElement("button");
        next.type="button";
        next.textContent=index===records.length-1?"Restart activities":"Next activity";
        next.onclick=function(){setIndex(index===records.length-1?0:index+1);render();};

        var complete=document.createElement("button");
        complete.type="button";
        complete.textContent="Record prototype review";
        complete.onclick=function(){
            status.textContent="Prototype review recorded in this browser session only. Server submission is disabled.";
            window.localStorage.setItem("pacificEducationExpandedActivityLastReviewed",activity.id);
        };

        host.appendChild(title);
        host.appendChild(notice);
        host.appendChild(counter);
        host.appendChild(instruction);
        host.appendChild(task);
        host.appendChild(feedback);
        host.appendChild(document.createElement("br"));
        host.appendChild(prev);
        host.appendChild(next);
        host.appendChild(complete);
        host.appendChild(status);
        return true;
    }

    function initialise(){
        render();
        return {version:VERSION,prototype:true,curriculumVerification:"required-before-production"};
    }

    window.PacificEducationExpandedSubjectActivityUI=Object.freeze({
        version:VERSION,
        render:render,
        initialise:initialise,
        getSelection:selection
    });

    if(document.readyState==="loading"){
        document.addEventListener("DOMContentLoaded",initialise);
    }else{
        initialise();
    }
})(window);
