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
      /* Restore the stable box name before a class-specific display label is applied. */
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
    function addEnglishAbilityLinks(card,level,viewerFile){
      var wrap=node("div");
      wrap.style.cssText="margin-top:12px;padding:10px;border:1px solid #c8d6df;border-radius:8px;background:#fff;";
      var heading=node("p",level+" — separate pathway worksheets (Days 1–115). Choose one pathway:");
      heading.style.cssText="font-weight:700;margin:4px 0 8px;";
      wrap.appendChild(heading);
      ["Copper","Bronze","Silver","Gold"].forEach(function(group){
        var a=node("a","Open "+group+" Worksheets");
        a.href="https://terubea82-eng.github.io/Pacific-education-/src/"+viewerFile+"?ability="+group;
        a.setAttribute("aria-label","Open "+level+" English "+group+" pathway worksheets for Days 1 to 115");
        a.target="_blank";a.rel="noopener noreferrer";
        a.style.cssText="display:inline-block;min-height:44px;padding:9px 11px;margin:4px 6px 4px 0;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
        wrap.appendChild(a);
      });
      var note=node("p","Each link opens the selected pathway. Choose a learning day, then print or save that learner worksheet as PDF.");
      note.style.cssText="font-size:.92em;margin:6px 0 2px;";
      wrap.appendChild(note);
      if(level==="Class 3"||level==="Class 4"||level==="Class 5"){
        var guide=node("a","Open "+level+" Week 1 Teacher Marking Guide");
        var guideFile=level==="Class 3"?"english-class3-teacher-guide-days-1-5.md":level==="Class 4"?"english-class4-teacher-guide-days-1-5.md":"english-class5-teacher-guide-days-1-5.md";
        guide.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/"+guideFile;
        guide.target="_blank";guide.rel="noopener noreferrer";
        guide.style.cssText="display:block;min-height:44px;padding:9px 0;font-weight:700;";
        wrap.appendChild(guide);
      }
      card.appendChild(wrap);
    }

    /* Keep English daily packs inside the English subject box. These links
       use the current branch so the draft can be reviewed without changing main. */
    if(subject==="English"){
      var eceCard=node("section");
      eceCard.id="paceduECEDailyEnglishPackLink";
      eceCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      eceCard.appendChild(node("h4","ECE English — 115 Daily Activities (Copper–Gold)"));
      eceCard.appendChild(node("p","Original play-based activity draft. PENDING_TEACHER_REVIEW — exact current Fiji ECE outcomes and indicators must be verified before learner release."));
      var eceLink=node("a","Open ECE English Days 1–115");
      eceLink.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-ece-daily-activities-days-1-115.md";
      eceLink.setAttribute("aria-label","Open ECE English daily activities from Day 1 to Day 115");
      eceLink.target="_blank";
      eceLink.rel="noopener noreferrer";
      eceLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      eceCard.appendChild(eceLink);
      var eceWorksheetStatus=node("p","Separate daily printable worksheets are prepared for all 115 learning days and four flexible ability pathways. PENDING_ECE_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; not approved for learner release.");
      eceCard.appendChild(eceWorksheetStatus);
      var eceWorksheetLink=node("a","Open ECE Printable Worksheets — Days 1–115");
      eceWorksheetLink.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-ece-english-printable-worksheets.html";
      eceWorksheetLink.setAttribute("aria-label","Open ECE printable English worksheets, all 115 days and four ability groups");
      eceWorksheetLink.target="_blank";
      eceWorksheetLink.rel="noopener noreferrer";
      eceWorksheetLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      eceCard.appendChild(eceWorksheetLink);
      list.appendChild(eceCard);
      addEnglishAbilityLinks(eceCard,"ECE","pacedu-ece-english-printable-worksheets.html");

      var packCard=node("section");
      packCard.id="paceduClass1EnglishWorksheetPackLink";
      packCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      var packTitle=node("h4","Class 1 English — 115 Daily Activities (Copper–Gold)");
      var packStatus=node("p","Original 23-week practice programme with four differentiated pathways. PENDING_TEACHER_REVIEW — verify exact current Fiji English outcomes and the school's approved teaching sequence before learner release.");
      var packLink=node("a","Open Class 1 English Days 1–115");
      packLink.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class-1-daily-activities-days-1-115.md";
      packLink.setAttribute("aria-label","Open Class 1 English daily activities from Day 1 to Day 115");
      packLink.target="_blank";
      packLink.rel="noopener noreferrer";
      packLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      packCard.appendChild(packTitle);
      packCard.appendChild(packStatus);
      packCard.appendChild(packLink);

      var printableCard=node("section");
      printableCard.id="paceduClass1EnglishPrintableWorksheetLink";
      printableCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #1877b7;border-radius:9px;background:#f4faff;";
      printableCard.appendChild(node("h4","Class 1 English — Printable Daily Worksheets (115 Days × 4 Ability Groups)"));
      var printableStatus=node("p","Separate Copper, Bronze, Silver and Gold print versions are drafted for every learning day. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; not yet approved for student release.");
      printableCard.appendChild(printableStatus);
      var dateLine=node("p","Country: ");
      dateLine.appendChild(node("span",""));
      dateLine.lastChild.setAttribute("data-pacedu-country-name","");
      dateLine.appendChild(node("span"," · Local date: "));
      var dateValue=node("span","");
      dateValue.setAttribute("data-pacedu-local-date","");
      dateLine.appendChild(dateValue);
      printableCard.appendChild(dateLine);
      var zoneLine=node("p","");
      zoneLine.setAttribute("data-pacedu-date-status","");
      printableCard.appendChild(zoneLine);
      var zoneLabel=node("label","School time zone (IANA name, e.g. Pacific/Fiji)");
      zoneLabel.style.cssText="display:block;font-weight:700;margin:8px 0;";
      var zoneInput=node("input");
      zoneInput.type="text";
      zoneInput.autocomplete="off";
      zoneInput.placeholder="e.g. Pacific/Fiji or Europe/Paris";
      zoneInput.setAttribute("aria-label","School time zone IANA name");
      zoneInput.style.cssText="display:block;width:100%;min-height:44px;padding:8px;box-sizing:border-box;margin-top:5px;";
      try{zoneInput.value=window.PacEduWorksheetLocalDate?window.PacEduWorksheetLocalDate.getSchoolTimeZone():(window.localStorage.getItem("pacificEducationSchoolTimeZone")||"");}catch(e){}
      zoneLabel.appendChild(zoneInput);
      printableCard.appendChild(zoneLabel);
      var zoneSave=makeButton("Save school time zone","date-zone","save");
      zoneSave.style.width="100%";
      var zoneFeedback=node("p","");
      zoneFeedback.setAttribute("role","status");
      zoneFeedback.setAttribute("aria-live","polite");
      printableCard.appendChild(zoneSave);
      printableCard.appendChild(zoneFeedback);
      zoneSave.addEventListener("click",function(){
        var zone=String(zoneInput.value||"").trim();
        if(!zone){zoneFeedback.textContent="Enter the school's IANA time zone. Example: Pacific/Fiji.";return;}
        try{
          if(!window.PacEduWorksheetLocalDate)throw new Error("The PacEdu local-date service is not available.");
          window.PacEduWorksheetLocalDate.setSchoolTimeZone(zone);
          window.PacEduWorksheetLocalDate.refresh();
          window.PacEduWorksheetLocalDate.fill(printableCard);
          zoneFeedback.textContent="School time zone saved for "+window.PacEduWorksheetLocalDate.getSnapshot().country+": "+zone+". Other countries keep their own time-zone setting.";
        }catch(e){zoneFeedback.textContent="That time zone was not recognised. Enter a valid IANA name, such as Pacific/Fiji or Europe/Paris.";}
      });
      var printLink=node("a","Open Class 1 Printable Worksheets — Days 1–115");
      printLink.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class1-english-printable-worksheets.html";
      printLink.setAttribute("aria-label","Open Class 1 printable English worksheets, all 115 days and four ability groups");
      printLink.target="_blank";
      printLink.rel="noopener noreferrer";
      printLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      printableCard.appendChild(printLink);
      list.appendChild(printableCard);
      addEnglishAbilityLinks(printableCard,"Class 1","pacedu-class1-english-printable-worksheets.html");
      if(window.PacEduWorksheetLocalDate)window.PacEduWorksheetLocalDate.fill(printableCard);

      var starterNote=node("p","Existing Class 1 five-day diagnostic starter pack remains available for comparison; the new 115-day draft is the expanded programme.");
      packCard.appendChild(starterNote);
      var class2Card=node("section");
      class2Card.id="paceduClass2EnglishDailyPackLink";
      class2Card.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class2Card.appendChild(node("h4","Class 2 English — 115 Daily Activities (Copper–Gold)"));
      class2Card.appendChild(node("p","Original 23-week PacEdu planning draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; confirm the authorised current Year 2 English guide and sequence before learner release."));
      var class2ActivityLink=node("a","Open Class 2 English Days 1–115");
      class2ActivityLink.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class-2-daily-activities-days-1-115.md";
      class2ActivityLink.target="_blank";class2ActivityLink.rel="noopener noreferrer";
      class2ActivityLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class2Card.appendChild(class2ActivityLink);
      var class2WorksheetStatus=node("p","460 separate daily print versions are drafted (115 days × Copper, Bronze, Silver and Gold). PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; not approved for student release.");
      class2Card.appendChild(class2WorksheetStatus);
      var class2PrintLink=node("a","Open Class 2 Printable Worksheets — Days 1–115");
      class2PrintLink.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class2-english-printable-worksheets.html";
      class2PrintLink.setAttribute("aria-label","Open Class 2 printable English worksheets, all 115 days and four ability groups");
      class2PrintLink.target="_blank";class2PrintLink.rel="noopener noreferrer";
      class2PrintLink.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class2Card.appendChild(class2PrintLink);
      list.appendChild(class2Card);
      addEnglishAbilityLinks(class2Card,"Class 2","pacedu-class2-english-printable-worksheets.html");

      var class3EnglishCard=node("section");
      class3EnglishCard.id="paceduClass3EnglishDailyPackLink";
      class3EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class3EnglishCard.appendChild(node("h4","Class 3 English — 115 Daily Activities (Copper–Gold)"));
      class3EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var class3EnglishActivity=node("a","Open Class 3 English Days 1–115");
      class3EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class3-daily-activities-days-1-115.md";
      class3EnglishActivity.target="_blank";class3EnglishActivity.rel="noopener noreferrer";
      class3EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class3EnglishCard.appendChild(class3EnglishActivity);
      class3EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var class3EnglishPrint=node("a","Open Class 3 Printable Worksheets — Days 1–115");
      class3EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class3-english-printable-worksheets.html";
      class3EnglishPrint.target="_blank";class3EnglishPrint.rel="noopener noreferrer";
      class3EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class3EnglishCard.appendChild(class3EnglishPrint);
      list.appendChild(class3EnglishCard);
      addEnglishAbilityLinks(class3EnglishCard,"Class 3","pacedu-class3-english-printable-worksheets.html");

      var class4EnglishCard=node("section");
      class4EnglishCard.id="paceduClass4EnglishDailyPackLink";
      class4EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class4EnglishCard.appendChild(node("h4","Class 4 English — 115 Daily Activities (Copper–Gold)"));
      class4EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var class4EnglishActivity=node("a","Open Class 4 English Days 1–115");
      class4EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class4-daily-activities-days-1-115.md";
      class4EnglishActivity.target="_blank";class4EnglishActivity.rel="noopener noreferrer";
      class4EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class4EnglishCard.appendChild(class4EnglishActivity);
      class4EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var class4EnglishPrint=node("a","Open Class 4 Printable Worksheets — Days 1–115");
      class4EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class4-english-printable-worksheets.html";
      class4EnglishPrint.target="_blank";class4EnglishPrint.rel="noopener noreferrer";
      class4EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class4EnglishCard.appendChild(class4EnglishPrint);
      list.appendChild(class4EnglishCard);
      addEnglishAbilityLinks(class4EnglishCard,"Class 4","pacedu-class4-english-printable-worksheets.html");

      var class5EnglishCard=node("section");
      class5EnglishCard.id="paceduClass5EnglishDailyPackLink";
      class5EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class5EnglishCard.appendChild(node("h4","Class 5 English — 115 Daily Activities (Copper–Gold)"));
      class5EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var class5EnglishActivity=node("a","Open Class 5 English Days 1–115");
      class5EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class5-daily-activities-days-1-115.md";
      class5EnglishActivity.target="_blank";class5EnglishActivity.rel="noopener noreferrer";
      class5EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class5EnglishCard.appendChild(class5EnglishActivity);
      class5EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var class5EnglishPrint=node("a","Open Class 5 Printable Worksheets — Days 1–115");
      class5EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class5-english-printable-worksheets.html";
      class5EnglishPrint.target="_blank";class5EnglishPrint.rel="noopener noreferrer";
      class5EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class5EnglishCard.appendChild(class5EnglishPrint);
      list.appendChild(class5EnglishCard);
      addEnglishAbilityLinks(class5EnglishCard,"Class 5","pacedu-class5-english-printable-worksheets.html");

      var class6EnglishCard=node("section");
      class6EnglishCard.id="paceduClass6EnglishDailyPackLink";
      class6EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class6EnglishCard.appendChild(node("h4","Class 6 English — 115 Daily Activities (Copper–Gold)"));
      class6EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var class6EnglishActivity=node("a","Open Class 6 English Days 1–115");
      class6EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class6-daily-activities-days-1-115.md";
      class6EnglishActivity.target="_blank";class6EnglishActivity.rel="noopener noreferrer";
      class6EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class6EnglishCard.appendChild(class6EnglishActivity);
      class6EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var class6EnglishPrint=node("a","Open Class 6 Printable Worksheets — Days 1–115");
      class6EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class6-english-printable-worksheets.html";
      class6EnglishPrint.target="_blank";class6EnglishPrint.rel="noopener noreferrer";
      class6EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class6EnglishCard.appendChild(class6EnglishPrint);
      list.appendChild(class6EnglishCard);
      addEnglishAbilityLinks(class6EnglishCard,"Class 6","pacedu-class6-english-printable-worksheets.html");

      var class7EnglishCard=node("section");
      class7EnglishCard.id="paceduClass7EnglishDailyPackLink";
      class7EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class7EnglishCard.appendChild(node("h4","Class 7 English — 115 Daily Activities (Copper–Gold)"));
      class7EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var class7EnglishActivity=node("a","Open Class 7 English Days 1–115");
      class7EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class7-daily-activities-days-1-115.md";
      class7EnglishActivity.target="_blank";class7EnglishActivity.rel="noopener noreferrer";
      class7EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class7EnglishCard.appendChild(class7EnglishActivity);
      class7EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var class7EnglishPrint=node("a","Open Class 7 Printable Worksheets — Days 1–115");
      class7EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class7-english-printable-worksheets.html";
      class7EnglishPrint.target="_blank";class7EnglishPrint.rel="noopener noreferrer";
      class7EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class7EnglishCard.appendChild(class7EnglishPrint);
      list.appendChild(class7EnglishCard);
      addEnglishAbilityLinks(class7EnglishCard,"Class 7","pacedu-class7-english-printable-worksheets.html");

      var class8EnglishCard=node("section");
      class8EnglishCard.id="paceduClass8EnglishDailyPackLink";
      class8EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      class8EnglishCard.appendChild(node("h4","Class 8 English — 115 Daily Activities (Copper–Gold)"));
      class8EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var class8EnglishActivity=node("a","Open Class 8 English Days 1–115");
      class8EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-class8-daily-activities-days-1-115.md";
      class8EnglishActivity.target="_blank";class8EnglishActivity.rel="noopener noreferrer";
      class8EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      class8EnglishCard.appendChild(class8EnglishActivity);
      class8EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var class8EnglishPrint=node("a","Open Class 8 Printable Worksheets — Days 1–115");
      class8EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-class8-english-printable-worksheets.html";
      class8EnglishPrint.target="_blank";class8EnglishPrint.rel="noopener noreferrer";
      class8EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      class8EnglishCard.appendChild(class8EnglishPrint);
      list.appendChild(class8EnglishCard);
      addEnglishAbilityLinks(class8EnglishCard,"Class 8","pacedu-class8-english-printable-worksheets.html");

      var form1EnglishCard=node("section");
      form1EnglishCard.id="paceduForm1EnglishDailyPackLink";
      form1EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form1EnglishCard.appendChild(node("h4","Form 1 — Year 7 English — 115 Daily Activities (Copper–Gold)"));
      form1EnglishCard.appendChild(node("p","Original PacEdu practice draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form1EnglishActivity=node("a","Open Form 1 — Year 7 English Days 1–115");
      form1EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form1-daily-activities-days-1-115.md";
      form1EnglishActivity.target="_blank";form1EnglishActivity.rel="noopener noreferrer";
      form1EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form1EnglishCard.appendChild(form1EnglishActivity);
      form1EnglishCard.appendChild(node("p","460 separate printable worksheets (115 days × four pathways); teacher and official indicator review pending."));
      var form1EnglishPrint=node("a","Open Form 1 — Year 7 Printable Worksheets — Days 1–115");
      form1EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form1-english-printable-worksheets.html";
      form1EnglishPrint.target="_blank";form1EnglishPrint.rel="noopener noreferrer";
      form1EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form1EnglishCard.appendChild(form1EnglishPrint);
      list.appendChild(form1EnglishCard);
      addEnglishAbilityLinks(form1EnglishCard,"Form 1 — Year 7","pacedu-form1-english-printable-worksheets.html");

      var form2EnglishCard=node("section");
      form2EnglishCard.id="paceduForm2EnglishDailyPackLink";
      form2EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form2EnglishCard.appendChild(node("h4","Form 2 — Year 8 English — 115 Daily Activities (Copper–Gold)"));
      form2EnglishCard.appendChild(node("p","Original PacEdu practice draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form2EnglishActivity=node("a","Open Form 2 — Year 8 English Days 1–115");
      form2EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form2-daily-activities-days-1-115.md";
      form2EnglishActivity.target="_blank";form2EnglishActivity.rel="noopener noreferrer";
      form2EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form2EnglishCard.appendChild(form2EnglishActivity);
      form2EnglishCard.appendChild(node("p","460 separate printable worksheets (115 days × four pathways); teacher and official indicator review pending."));
      var form2EnglishPrint=node("a","Open Form 2 — Year 8 Printable Worksheets — Days 1–115");
      form2EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form2-english-printable-worksheets.html";
      form2EnglishPrint.target="_blank";form2EnglishPrint.rel="noopener noreferrer";
      form2EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form2EnglishCard.appendChild(form2EnglishPrint);
      list.appendChild(form2EnglishCard);
      addEnglishAbilityLinks(form2EnglishCard,"Form 2 — Year 8","pacedu-form2-english-printable-worksheets.html");

      var form3EnglishCard=node("section");
      form3EnglishCard.id="paceduForm3EnglishDailyPackLink";
      form3EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form3EnglishCard.appendChild(node("h4","Form 3 English — 115 Daily Activities (Copper–Gold)"));
      form3EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form3EnglishActivity=node("a","Open Form 3 English Days 1–115");
      form3EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form3-daily-activities-days-1-115.md";
      form3EnglishActivity.target="_blank";form3EnglishActivity.rel="noopener noreferrer";
      form3EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form3EnglishCard.appendChild(form3EnglishActivity);
      form3EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var form3EnglishPrint=node("a","Open Form 3 Printable Worksheets — Days 1–115");
      form3EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form3-english-printable-worksheets.html";
      form3EnglishPrint.target="_blank";form3EnglishPrint.rel="noopener noreferrer";
      form3EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form3EnglishCard.appendChild(form3EnglishPrint);
      list.appendChild(form3EnglishCard);
      addEnglishAbilityLinks(form3EnglishCard,"Form 3","pacedu-form3-english-printable-worksheets.html");

      var form4EnglishCard=node("section");
      form4EnglishCard.id="paceduForm4EnglishDailyPackLink";
      form4EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form4EnglishCard.appendChild(node("h4","Form 4 English — 115 Daily Activities (Copper–Gold)"));
      form4EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form4EnglishActivity=node("a","Open Form 4 English Days 1–115");
      form4EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form4-daily-activities-days-1-115.md";
      form4EnglishActivity.target="_blank";form4EnglishActivity.rel="noopener noreferrer";
      form4EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form4EnglishCard.appendChild(form4EnglishActivity);
      form4EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var form4EnglishPrint=node("a","Open Form 4 Printable Worksheets — Days 1–115");
      form4EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form4-english-printable-worksheets.html";
      form4EnglishPrint.target="_blank";form4EnglishPrint.rel="noopener noreferrer";
      form4EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form4EnglishCard.appendChild(form4EnglishPrint);
      list.appendChild(form4EnglishCard);
      addEnglishAbilityLinks(form4EnglishCard,"Form 4","pacedu-form4-english-printable-worksheets.html");

      var form5EnglishCard=node("section");
      form5EnglishCard.id="paceduForm5EnglishDailyPackLink";
      form5EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form5EnglishCard.appendChild(node("h4","Form 5 English — 115 Daily Activities (Copper–Gold)"));
      form5EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form5EnglishActivity=node("a","Open Form 5 English Days 1–115");
      form5EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form5-daily-activities-days-1-115.md";
      form5EnglishActivity.target="_blank";form5EnglishActivity.rel="noopener noreferrer";
      form5EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form5EnglishCard.appendChild(form5EnglishActivity);
      form5EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var form5EnglishPrint=node("a","Open Form 5 Printable Worksheets — Days 1–115");
      form5EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form5-english-printable-worksheets.html";
      form5EnglishPrint.target="_blank";form5EnglishPrint.rel="noopener noreferrer";
      form5EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form5EnglishCard.appendChild(form5EnglishPrint);
      list.appendChild(form5EnglishCard);
      addEnglishAbilityLinks(form5EnglishCard,"Form 5","pacedu-form5-english-printable-worksheets.html");

      var form6EnglishCard=node("section");
      form6EnglishCard.id="paceduForm6EnglishDailyPackLink";
      form6EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form6EnglishCard.appendChild(node("h4","Form 6 English — 115 Daily Activities (Copper–Gold)"));
      form6EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form6EnglishActivity=node("a","Open Form 6 English Days 1–115");
      form6EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form6-daily-activities-days-1-115.md";
      form6EnglishActivity.target="_blank";form6EnglishActivity.rel="noopener noreferrer";
      form6EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form6EnglishCard.appendChild(form6EnglishActivity);
      form6EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var form6EnglishPrint=node("a","Open Form 6 Printable Worksheets — Days 1–115");
      form6EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form6-english-printable-worksheets.html";
      form6EnglishPrint.target="_blank";form6EnglishPrint.rel="noopener noreferrer";
      form6EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form6EnglishCard.appendChild(form6EnglishPrint);
      list.appendChild(form6EnglishCard);
      addEnglishAbilityLinks(form6EnglishCard,"Form 6","pacedu-form6-english-printable-worksheets.html");

      var form7EnglishCard=node("section");
      form7EnglishCard.id="paceduForm7EnglishDailyPackLink";
      form7EnglishCard.style.cssText="margin:12px 0;padding:12px;border:2px solid #b7791f;border-radius:9px;background:#fffaf0;";
      form7EnglishCard.appendChild(node("h4","Form 7 English — 115 Daily Activities (Copper–Gold)"));
      form7EnglishCard.appendChild(node("p","Original PacEdu draft. PENDING_TEACHER_REVIEW and PENDING_OFFICIAL_INDICATOR_VERIFICATION; verify the current authorised syllabus before learner release."));
      var form7EnglishActivity=node("a","Open Form 7 English Days 1–115");
      form7EnglishActivity.href="https://github.com/terubea82-eng/Pacific-education-/blob/pacedu/english-ece-form7-staging-20261119/docs/curriculum/english-form7-daily-activities-days-1-115.md";
      form7EnglishActivity.target="_blank";form7EnglishActivity.rel="noopener noreferrer";
      form7EnglishActivity.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #7b5b25;border-radius:7px;font-weight:700;";
      form7EnglishCard.appendChild(form7EnglishActivity);
      form7EnglishCard.appendChild(node("p","460 separate printable versions (115 days × four pathways); teacher and official indicator review pending."));
      var form7EnglishPrint=node("a","Open Form 7 Printable Worksheets — Days 1–115");
      form7EnglishPrint.href="https://terubea82-eng.github.io/Pacific-education-/src/pacedu-form7-english-printable-worksheets.html";
      form7EnglishPrint.target="_blank";form7EnglishPrint.rel="noopener noreferrer";
      form7EnglishPrint.style.cssText="display:inline-block;min-height:44px;padding:10px 12px;border:1px solid #1877b7;border-radius:7px;font-weight:700;";
      form7EnglishCard.appendChild(form7EnglishPrint);
      list.appendChild(form7EnglishCard);
      addEnglishAbilityLinks(form7EnglishCard,"Form 7","pacedu-form7-english-printable-worksheets.html");
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
      for(var f=1;f<=7;f++)items.push({id:"",label:"Form "+f+(f===1?" — Year 7":f===2?" — Year 8":""),level:"Form "+f});
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
        if(selectedButton)selectedButton.textContent=displaySubject;
        var listTitle=list.querySelector("h3");
        if(listTitle)listTitle.textContent=displaySubject+" — Choose a Class";
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
    if(!host)return;
    if(!grid){
      grid=node("div");
      grid.id="paceduTeacherSubjectGrid";
      var existingShell=document.getElementById("paceduTeacherDailyLearningOnlyShell");
      (existingShell||host).appendChild(grid);
    }
    if(!list){
      list=node("div");
      list.id="paceduTeacherClassList";
    }
    var existingButtons=grid.querySelectorAll("[data-pacedu-teacher-subject]");
    var completeGrid=existingButtons.length===SUBJECTS.length&&SUBJECTS.every(function(subject){
      return Array.prototype.some.call(existingButtons,function(button){
        return button.getAttribute("data-pacedu-teacher-subject")===subject;
      });
    });
    /* A stale data-ready flag is not proof that the subject grid still exists.
       Recover an empty/partial grid instead of leaving Teacher Step 2 blank. */
    if(grid.getAttribute("data-ready")==="true"&&completeGrid&&
       host.contains(list)&&grid.contains(list))return;
    grid.textContent="";
    grid.removeAttribute("data-ready");
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
    if(!planPanel&&window.PacificEducationLinkedTeacherPlans&&
       typeof window.PacificEducationLinkedTeacherPlans.render==="function"){
      try{window.PacificEducationLinkedTeacherPlans.render();}catch(e){}
      planPanel=document.getElementById("pacificEducationLinkedTeacherPlans");
    }
    if(planPanel){planPanel.hidden=true;planPanel.setAttribute("aria-hidden","true");}
    renderDailyLearningOnly(host,grid,list,planPanel);
  }
  /* Keep the teacher step focused on learner activities and their matching
     workplans/lesson plans. Preserve the existing subject/class controls and
     linked-plan generator; remove unrelated teacher forms from this workspace
     without touching registration, role routing, global mailbox, or voice code. */
  function renderDailyLearningOnly(host,grid,list,planPanel){
    if(!host||!grid||!list)return;
    var shell=document.getElementById("paceduTeacherDailyLearningOnlyShell");
    if(!shell){
      shell=node("section");
      shell.id="paceduTeacherDailyLearningOnlyShell";
      shell.setAttribute("data-pacedu-step-two-clean","true");
      shell.setAttribute("aria-label","Student daily activities and matching workplans");
      shell.style.cssText="margin:12px 0;padding:14px;border:1px solid #c8d7e2;border-radius:12px;box-sizing:border-box;";
      var heading=node("h2","My Teaching Workspace — Subject Boxes, Daily Activities & Teacher Resources");
      heading.style.cssText="margin-top:0;";
      shell.appendChild(heading);
      shell.appendChild(node("h2","My Teaching Subject Boxes"));
      shell.appendChild(grid);
      host.textContent="";
      host.appendChild(shell);
    }else if(!shell.contains(grid)){
      shell.appendChild(grid);
    }
    /* Keep the linked-plan/resource panel inside the subject boxes even when
       a dashboard renderer has replaced the grid and the original panel. */
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
      "paceduRoleActivityStatus"
    ].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&host.contains(el)&&!el.contains(grid)&&!el.contains(shell))el.remove();
    });
    host.querySelectorAll('[id*="paceduRoleActivity"],[id*="paceduAssessment"],[id*="paceduFijiWeekly"],[id*="paceduWorldLibrary"],[id*="paceduSeparateDaily"],[id*="paceduDailyResource"]').forEach(function(el){
      if(el!==grid&&el!==shell&&!el.contains(grid)&&!el.contains(shell))el.remove();
    });
  }
  var teacherStepTwoObserver=null;
  var teacherStepTwoInitQueued=false;
  function queueTeacherStepTwoInit(){
    if(teacherStepTwoInitQueued)return;
    teacherStepTwoInitQueued=true;
    window.setTimeout(function(){
      teacherStepTwoInitQueued=false;
      var host=document.getElementById(hostId);
      var grid=document.getElementById("paceduTeacherSubjectGrid");
      var list=document.getElementById("paceduTeacherClassList");
      if(!host)return;
      var buttons=grid?grid.querySelectorAll("[data-pacedu-teacher-subject]"):[];
      var complete=!!grid&&buttons.length===SUBJECTS.length&&SUBJECTS.every(function(subject){
        return Array.prototype.some.call(buttons,function(button){
          return button.getAttribute("data-pacedu-teacher-subject")===subject;
        });
      });
      /* Re-run the existing builder when the dashboard replaces either
         control, including when the class selector has been detached. */
      if(!grid||!list||grid.getAttribute("data-ready")!=="true"||!complete||
         !host.contains(list)||!grid.contains(list))init();
      cleanTeacherStepTwo();
    },0);
  }
  function observeCleanTeacherStepTwo(){
    cleanTeacherStepTwo();
    if(!window.MutationObserver||!document.body||teacherStepTwoObserver)return;
    var cleaning=false;
    teacherStepTwoObserver=new MutationObserver(function(){
      if(cleaning)return;
      cleaning=true;
      cleanTeacherStepTwo();
      cleaning=false;
      queueTeacherStepTwoInit();
    });
    /* Observe the body so a replaced Teacher Dashboard host is detected too.
       The queued check is bounded: a rebuild is followed by one validation
       pass, and no rebuild occurs once all subject buttons and the class
       selector are back in their required locations. */
    teacherStepTwoObserver.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",function(){init();observeCleanTeacherStepTwo();});
  if(document.readyState!=="loading")observeCleanTeacherStepTwo();
  else document.addEventListener("DOMContentLoaded",observeCleanTeacherStepTwo);
})(window,document);
