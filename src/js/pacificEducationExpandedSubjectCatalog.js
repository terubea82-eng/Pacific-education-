/*
 * PACIFIC EDUCATION
 * Fiji Form 1-7 Expanded Subject Pilot Catalog
 * Version 1.0.0
 *
 * Prototype teacher-testing catalog. This is NOT an official curriculum
 * prescription. Each subject/level must be mapped to current authoritative
 * Fiji curriculum documents before production use.
 */
(function(window){
    "use strict";
    var LEVELS=["Form 1","Form 2","Form 3","Form 4","Form 5","Form 6","Form 7"];
    var SUBJECTS=["English","Mathematics","Science","Basic Science","Elementary Science","Biology","Chemistry","Physics","Health Science","Health & Physical Education","Geography","History","Social Science","Accounting","Economics","Business/Enterprise Studies","Office Technology","Computer Studies","Agricultural Science","Home Economics","Basic Technology","Basic Graphics Technology","Applied Technology","Technical Drawing","Arts","Vosa Vakaviti","Hindi","Urdu","Moral Values","Other"];
    var AREAS={
      "English":["Reading and comprehension","Writing and composition","Speaking and listening","Language and grammar","Literature and response","Communication in context"],
      "Mathematics":["Number and operations","Algebra","Geometry","Measurement","Statistics and probability","Problem solving"],
      "Science":["Scientific investigation","Matter","Energy and forces","Living systems","Earth and environment","Science and technology"],
      "Basic Science":["Scientific investigation","Matter and materials","Energy and forces","Living things","Earth and environment","Everyday science"],
      "Elementary Science":["Observation and measurement","Plants and animals","Human body and health","Materials","Weather and Earth","Energy and simple machines"],
      "Biology":["Cells and organisation","Nutrition and transport","Respiration and excretion","Reproduction and inheritance","Ecology and biodiversity","Evolution and biotechnology"],
      "Chemistry":["Laboratory safety and measurement","Particles and atomic structure","Bonding and compounds","Chemical reactions","Acids bases and salts","Organic and applied chemistry"],
      "Physics":["Measurement and motion","Forces and energy","Heat and thermal physics","Waves and sound","Electricity and magnetism","Light and modern physics"],
      "Health Science":["Personal health and hygiene","Nutrition","Mental and social wellbeing","Disease prevention","Sexual and reproductive health","First aid and safety"],
      "Health & Physical Education":["Health and wellbeing","Physical fitness","Movement skills","Games and sports","Safety","Healthy lifestyles"],
      "Geography":["Map skills","Physical geography","Human geography","Environment","Resources","Fiji and the Pacific"],
      "History":["Historical inquiry","Fiji history","Pacific history","World history","Sources and evidence","Historical change"],
      "Social Science":["Society and culture","Citizenship","Government and institutions","Economy and livelihoods","Environment and society","Research skills"],
      "Accounting":["Accounting concepts","Source documents","Double entry","Ledger and trial balance","Financial statements","Analysis and application"],
      "Economics":["Basic economic concepts","Markets","Production and consumption","National economy","Development","Fiji and Pacific economic issues"],
      "Business/Enterprise Studies":["Entrepreneurship","Business planning","Marketing","Finance","Operations","Ethics and enterprise"],
      "Office Technology":["Keyboarding","Document preparation","Spreadsheets","Presentations","Office communication","Digital office practice"],
      "Computer Studies":["Computer systems","Algorithms","Programming","Data","Networks and security","Digital applications"],
      "Agricultural Science":["Soil and crops","Plant production","Animal production","Farm management","Agricultural technology","Sustainable agriculture"],
      "Home Economics":["Food and nutrition","Food preparation","Clothing and textiles","Home management","Family and community","Consumer skills"],
      "Basic Technology":["Materials","Tools and safety","Design","Construction","Mechanisms","Technology in context"],
      "Basic Graphics Technology":["Graphic communication","Freehand drawing","Geometric construction","Orthographic drawing","Design","Practical graphics"],
      "Applied Technology":["Design process","Materials and manufacture","Tools and machines","Systems","Problem solving","Applied projects"],
      "Technical Drawing":["Drawing instruments","Geometric construction","Orthographic projection","Isometric drawing","Sections and development","Technical design"],
      "Arts":["Visual art","Music","Drama","Creative processes","Cultural expression","Art appreciation"],
      "Vosa Vakaviti":["Listening and speaking","Reading","Writing","Grammar","Literature","Culture and communication"],
      "Hindi":["Listening and speaking","Reading","Writing","Grammar","Literature","Culture and communication"],
      "Urdu":["Listening and speaking","Reading","Writing","Grammar","Literature","Culture and communication"],
      "Moral Values":["Respect and kindness","Honesty and integrity","Responsibility and accountability","Empathy and compassion","Fairness and justice","Community and environmental responsibility"],
      "Other":["Integrated inquiry","Communication","Numeracy","Digital literacy","Local context","Project learning"]
    };
    var records=[]; SUBJECTS.forEach(function(subject){LEVELS.forEach(function(level){(AREAS[subject]||AREAS.Other).forEach(function(topic,n){records.push({id:"PE-"+level.replace(/\\s/g,"")+"-"+subject.replace(/[^A-Za-z0-9]/g,"")+"-"+(n+1),level:level,subjectId:subject,activityNumber:n+1,topic:topic,title:"Pilot activity: "+topic,instruction:"Explore, explain and apply key ideas in "+topic.toLowerCase()+" at "+level+" level.",teacherTask:"Attempt this prototype activity and record clarity, level suitability and curriculum-alignment feedback.",pilotStatus:"prototype-review",curriculumVerification:"required-before-production"});});});});
    function copy(v){return JSON.parse(JSON.stringify(v));}
    function list(filters){filters=filters||{};return records.filter(function(r){return (!filters.level||r.level===filters.level)&&(!filters.subjectId||r.subjectId===filters.subjectId);}).map(copy);}
    function get(id){var r=records.find(function(x){return x.id===id;});return r?copy(r):null;}
    window.PacificEducationExpandedSubjectCatalog=Object.freeze({version:"1.0.0",levels:LEVELS.slice(),subjects:SUBJECTS.slice(),activityCount:records.length,list:list,get:get,exportData:function(){return copy(records);},getSummary:function(){return SUBJECTS.map(function(s){return {subjectId:s,levels:LEVELS.slice(),activitiesPerLevel:(AREAS[s]||AREAS.Other).length,totalActivities:(AREAS[s]||AREAS.Other).length*LEVELS.length};});}});
})(window);
